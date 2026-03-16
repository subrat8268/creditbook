import { toApiError } from "@/src/lib/supabaseQuery";
import { supabase } from "@/src/services/supabase";

export interface RecentActivityItem {
  id: string;
  /** payment = money received from customer
   *  bill     = outstanding customer invoice
   *  delivery = supplier goods received (both/distributor modes) */
  type: "payment" | "bill" | "delivery";
  title: string;
  name: string;
  date: string;
  amount: number;
  status: "Paid" | "Pending" | "Overdue" | "Partially Paid";
}

export interface DashboardData {
  totalRevenue: number;
  outstandingAmount: number;
  unpaidOrders: number;
  partialOrders: number;
  overdueCustomers: number;
  // Net Position
  customersOweMe: number;
  iOweSuppliers: number;
  netPosition: number;
  // Seller mode
  activeBuyers: number;
  // Distributor mode
  activeSuppliers: number;
  overduePayments: number;
  recentActivity: RecentActivityItem[];
}

export async function getDashboardData(
  vendorId: string,
): Promise<DashboardData> {
  // Payments
  const { data: payments, error: payErr } = await supabase
    .from("payments")
    .select("amount")
    .eq("vendor_id", vendorId);

  if (payErr) throw toApiError(payErr);

  const totalRevenue =
    payments?.reduce((sum, p) => sum + Number(p.amount), 0) ?? 0;

  // Orders (include customer_id for active buyers count)
  const { data: orders, error: orderErr } = await supabase
    .from("orders")
    .select("customer_id, balance_due, status")
    .eq("vendor_id", vendorId);

  if (orderErr) throw toApiError(orderErr);

  if (!orders)
    return {
      totalRevenue,
      outstandingAmount: 0,
      unpaidOrders: 0,
      partialOrders: 0,
      overdueCustomers: 0,
      customersOweMe: 0,
      iOweSuppliers: 0,
      netPosition: 0,
      activeBuyers: 0,
      activeSuppliers: 0,
      overduePayments: 0,
      recentActivity: [],
    };

  const unpaidStatuses = ["pending", "unpaid"];
  const partialStatuses = ["partially paid", "partial"];

  const unpaidOrders = orders.filter((o) =>
    unpaidStatuses.includes((o.status ?? "").trim().toLowerCase()),
  ).length;
  const partialOrders = orders.filter((o) =>
    partialStatuses.includes((o.status ?? "").trim().toLowerCase()),
  ).length;

  const outstandingAmount = orders
    .filter((o) => unpaidStatuses.includes((o.status ?? "").toLowerCase()))
    .reduce((sum, o) => sum + Number(o.balance_due ?? 0), 0);

  // Active buyers = unique customers with at least one order
  const activeBuyers = new Set(orders.map((o: any) => o.customer_id)).size;

  // Overdue
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  const { data: overdueOrders } = await supabase
    .from("orders")
    .select("customer_id")
    .eq("vendor_id", vendorId)
    .gt("balance_due", 0)
    .lt("created_at", thirtyDaysAgo.toISOString());

  const overdueCustomers = new Set(
    (overdueOrders ?? []).map((o: any) => o.customer_id),
  ).size;

  // Net Position — customers owe me
  const customersOweMe = orders
    .filter((o) => Number(o.balance_due ?? 0) > 0)
    .reduce((sum, o) => sum + Number(o.balance_due ?? 0), 0);

  // Net Position — I owe suppliers
  const [{ data: deliveries }, { data: paymentsMade }] = await Promise.all([
    supabase
      .from("supplier_deliveries")
      .select("total_amount, supplier_id, created_at")
      .eq("vendor_id", vendorId),
    supabase.from("payments_made").select("amount").eq("vendor_id", vendorId),
  ]);

  const totalDeliveries = (deliveries ?? []).reduce(
    (s, d) => s + Number(d.total_amount),
    0,
  );
  const totalPaidToSuppliers = (paymentsMade ?? []).reduce(
    (s, p) => s + Number(p.amount),
    0,
  );
  const iOweSuppliers = Math.max(0, totalDeliveries - totalPaidToSuppliers);
  const netPosition = customersOweMe - iOweSuppliers;

  // Distributor stats — distinct active suppliers + overdue supplier deliveries
  const activeSuppliers = new Set(
    (deliveries ?? []).map((d: any) => d.supplier_id).filter(Boolean),
  ).size;
  const overduePayments = (deliveries ?? []).filter(
    (d: any) => new Date(d.created_at) < thirtyDaysAgo,
  ).length;

  // Recent activity — last 8 customer orders + last 4 supplier deliveries, merged by date
  const [{ data: recentOrders }, { data: recentDeliveries }] =
    await Promise.all([
      supabase
        .from("orders")
        .select(
          "id, bill_number, total_amount, amount_paid, balance_due, status, created_at, customers(name)",
        )
        .eq("vendor_id", vendorId)
        .order("created_at", { ascending: false })
        .limit(8),
      supabase
        .from("supplier_deliveries")
        .select("id, total_amount, created_at, suppliers(name)")
        .eq("vendor_id", vendorId)
        .order("created_at", { ascending: false })
        .limit(4),
    ]);

  const orderItems: RecentActivityItem[] = (recentOrders ?? []).map(
    (o: any) => {
      const customerName: string = o.customers?.name ?? "Unknown";
      const isPaid =
        (o.status ?? "").toLowerCase() === "paid" ||
        Number(o.balance_due) === 0;
      const isPartial = (o.status ?? "").toLowerCase().includes("partial");
      const thirtyDaysAgoTs = new Date();
      thirtyDaysAgoTs.setDate(thirtyDaysAgoTs.getDate() - 30);
      const isOverdue =
        !isPaid &&
        Number(o.balance_due) > 0 &&
        new Date(o.created_at) < thirtyDaysAgoTs;

      const resolvedStatus: RecentActivityItem["status"] = isPaid
        ? "Paid"
        : isOverdue
          ? "Overdue"
          : isPartial
            ? "Partially Paid"
            : "Pending";

      return {
        id: o.id,
        type: isPaid ? "payment" : "bill",
        name: customerName,
        title: isPaid
          ? `Payment from ${customerName}`
          : o.bill_number
            ? `Bill #${o.bill_number}`
            : `Bill for ${customerName}`,
        date: o.created_at,
        amount: isPaid ? Number(o.amount_paid) : Number(o.total_amount),
        status: resolvedStatus,
      };
    },
  );

  const deliveryItems: RecentActivityItem[] = (recentDeliveries ?? []).map(
    (d: any) => {
      const supplierName: string = d.suppliers?.name ?? "Supplier";
      return {
        id: `delivery-${d.id}`,
        type: "delivery" as const,
        name: supplierName,
        title: `Inventory from ${supplierName}`,
        date: d.created_at,
        amount: Number(d.total_amount),
        status: "Pending" as const,
      };
    },
  );

  // Merge and sort by date descending, cap at 8 items for the feed
  const recentActivity: RecentActivityItem[] = [...orderItems, ...deliveryItems]
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 8);

  return {
    totalRevenue,
    outstandingAmount,
    unpaidOrders,
    partialOrders,
    overdueCustomers,
    customersOweMe,
    iOweSuppliers,
    netPosition,
    activeBuyers,
    activeSuppliers,
    overduePayments,
    recentActivity,
  };
}
