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
  /** Top 5 overdue customers sorted by total outstanding balance */
  overdueCustomersList: {
    id: string;
    name: string;
    phone: string;
    balance: number;
    daysSince: number;
  }[];
  // Net Position
  customersOweMe: number;
  iOweSuppliers: number;
  netPosition: number;
  /** Absolute ₹ change in outstanding orders vs prior 7-day window (for seller hero card) */
  weekDelta: number;
  /** Percentage change in net position vs same 7-day window last week (0 if no history) */
  weekDeltaPct: number;
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
      overdueCustomersList: [],
      customersOweMe: 0,
      iOweSuppliers: 0,
      netPosition: 0,
      weekDelta: 0,
      weekDeltaPct: 0,
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

  const { data: overdueOrdersWithCustomers } = await supabase
    .from("orders")
    .select("customer_id, balance_due, created_at, customers(id, name, phone)")
    .eq("vendor_id", vendorId)
    .gt("balance_due", 0)
    .lt("created_at", thirtyDaysAgo.toISOString());

  const overdueCustomers = new Set(
    (overdueOrdersWithCustomers ?? []).map((o: any) => o.customer_id),
  ).size;

  // Build overdueCustomersList — group by customer, sum balance, find oldest order date
  const customerOverdueMap = new Map<
    string,
    {
      id: string;
      name: string;
      phone: string;
      balance: number;
      oldestDate: Date;
    }
  >();
  for (const order of overdueOrdersWithCustomers ?? []) {
    const cid: string = (order as any).customer_id;
    const customer = (order as any).customers;
    const orderDate = new Date((order as any).created_at);
    const existing = customerOverdueMap.get(cid);
    if (existing) {
      existing.balance += Number((order as any).balance_due);
      if (orderDate < existing.oldestDate) existing.oldestDate = orderDate;
    } else {
      customerOverdueMap.set(cid, {
        id: cid,
        name: customer?.name ?? "Unknown",
        phone: customer?.phone ?? "",
        balance: Number((order as any).balance_due),
        oldestDate: orderDate,
      });
    }
  }
  const now = new Date();
  const overdueCustomersList = Array.from(customerOverdueMap.values())
    .sort((a, b) => b.balance - a.balance)
    .slice(0, 5)
    .map((c) => ({
      id: c.id,
      name: c.name,
      phone: c.phone,
      balance: c.balance,
      daysSince: Math.floor(
        (now.getTime() - c.oldestDate.getTime()) / (1000 * 60 * 60 * 24),
      ),
    }));

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

  // Week-over-week net position delta (percentage)
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
  const fourteenDaysAgo = new Date();
  fourteenDaysAgo.setDate(fourteenDaysAgo.getDate() - 14);

  const [{ data: thisWeekOrders }, { data: lastWeekOrders }] =
    await Promise.all([
      supabase
        .from("orders")
        .select("balance_due")
        .eq("vendor_id", vendorId)
        .gt("balance_due", 0)
        .gte("created_at", sevenDaysAgo.toISOString()),
      supabase
        .from("orders")
        .select("balance_due")
        .eq("vendor_id", vendorId)
        .gt("balance_due", 0)
        .gte("created_at", fourteenDaysAgo.toISOString())
        .lt("created_at", sevenDaysAgo.toISOString()),
    ]);

  const thisWeekTotal = (thisWeekOrders ?? []).reduce(
    (s, o) => s + Number(o.balance_due),
    0,
  );
  const lastWeekTotal = (lastWeekOrders ?? []).reduce(
    (s, o) => s + Number(o.balance_due),
    0,
  );
  const weekDeltaPct =
    lastWeekTotal > 0
      ? Math.round(((thisWeekTotal - lastWeekTotal) / lastWeekTotal) * 100)
      : 0;
  const weekDelta = thisWeekTotal - lastWeekTotal;

  return {
    totalRevenue,
    outstandingAmount,
    unpaidOrders,
    partialOrders,
    overdueCustomers,
    overdueCustomersList,
    customersOweMe,
    iOweSuppliers,
    netPosition,
    weekDelta,
    weekDeltaPct,
    activeBuyers,
    activeSuppliers,
    overduePayments,
    recentActivity,
  };
}

// ── Net Position Report ───────────────────────────────────────────────────────

export interface NetPositionCustomer {
  id: string;
  name: string;
  initials: string;
  balance: number;
}

export interface NetPositionSupplier {
  id: string;
  name: string;
  initials: string;
  amountOwed: number;
}

export interface CashFlowMonth {
  /** "Jan", "Feb", etc. */
  label: string;
  inflow: number;
  outflow: number;
}

export interface NetPositionReport {
  totalReceivables: number;
  totalPayables: number;
  netBalance: number;
  topCustomers: NetPositionCustomer[];
  topSuppliers: NetPositionSupplier[];
  cashFlow: CashFlowMonth[];
  overdueCount: number;
  upcomingPayables: number;
}

function getInitials(name: string): string {
  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase() ?? "")
    .join("");
}

export async function getNetPositionReport(
  vendorId: string,
  rangeDays = 30,
): Promise<NetPositionReport> {
  const now = new Date();

  const rangeStart = new Date(now);
  rangeStart.setDate(rangeStart.getDate() - Math.max(rangeDays - 1, 0));
  rangeStart.setHours(0, 0, 0, 0);

  const [
    { data: orders },
    { data: deliveries },
    { data: paymentsReceived },
    { data: paymentsMade },
  ] = await Promise.all([
    supabase
      .from("orders")
      .select("customer_id, balance_due, status, created_at, customers(id, name)")
      .eq("vendor_id", vendorId)
      .gt("balance_due", 0)
      .gte("created_at", rangeStart.toISOString()),
    supabase
      .from("supplier_deliveries")
      .select("supplier_id, total_amount, created_at, suppliers(id, name)")
      .eq("vendor_id", vendorId)
      .gte("created_at", rangeStart.toISOString()),
    supabase
      .from("payments")
      .select("amount, created_at")
      .eq("vendor_id", vendorId)
      .gte("created_at", rangeStart.toISOString()),
    supabase
      .from("payments_made")
      .select("amount, created_at")
      .eq("vendor_id", vendorId)
      .gte("created_at", rangeStart.toISOString()),
  ]);

  // Total receivables (customers owe me)
  const totalReceivables = (orders ?? []).reduce(
    (s, o) => s + Number(o.balance_due),
    0,
  );

  // Total payables (I owe suppliers)
  const totalDeliveries = (deliveries ?? []).reduce(
    (s, d) => s + Number(d.total_amount),
    0,
  );
  const totalPaid = (paymentsMade ?? []).reduce(
    (s, p) => s + Number(p.amount),
    0,
  );
  const totalPayables = Math.max(0, totalDeliveries - totalPaid);
  const netBalance = totalReceivables - totalPayables;

  // Top 5 customers by balance owed
  const customerMap = new Map<string, { name: string; balance: number }>();
  for (const order of orders ?? []) {
    const cid: string = (order as any).customer_id;
    const name: string = (order as any).customers?.name ?? "Unknown";
    const existing = customerMap.get(cid);
    if (existing) {
      existing.balance += Number(order.balance_due);
    } else {
      customerMap.set(cid, { name, balance: Number(order.balance_due) });
    }
  }
  const topCustomers: NetPositionCustomer[] = Array.from(customerMap.entries())
    .sort((a, b) => b[1].balance - a[1].balance)
    .slice(0, 5)
    .map(([id, { name, balance }]) => ({
      id,
      name,
      initials: getInitials(name),
      balance,
    }));

  // Top 5 suppliers by amount I owe
  const supplierDeliveryMap = new Map<
    string,
    { name: string; total: number }
  >();
  const supplierPaidMap = new Map<string, number>();

  for (const d of deliveries ?? []) {
    const sid: string = (d as any).supplier_id;
    const name: string = (d as any).suppliers?.name ?? "Supplier";
    const existing = supplierDeliveryMap.get(sid);
    if (existing) {
      existing.total += Number(d.total_amount);
    } else {
      supplierDeliveryMap.set(sid, { name, total: Number(d.total_amount) });
    }
  }

  const topSuppliers: NetPositionSupplier[] = Array.from(
    supplierDeliveryMap.entries(),
  )
    .map(([id, { name, total }]) => ({
      id,
      name,
      initials: getInitials(name),
      amountOwed: Math.max(0, total - (supplierPaidMap.get(id) ?? 0)),
    }))
    .filter((s) => s.amountOwed > 0)
    .sort((a, b) => b.amountOwed - a.amountOwed)
    .slice(0, 5);

  const bucketCount = 6;
  const bucketSize = Math.max(1, Math.ceil(rangeDays / bucketCount));
  const cashFlow: CashFlowMonth[] = [];

  for (let i = 0; i < bucketCount; i++) {
    const bucketStart = new Date(rangeStart);
    bucketStart.setDate(rangeStart.getDate() + i * bucketSize);
    if (bucketStart > now) break;
    const bucketEnd = new Date(bucketStart);
    bucketEnd.setDate(bucketStart.getDate() + bucketSize);

    const inflow = (paymentsReceived ?? [])
      .filter((p) => {
        const pd = new Date(p.created_at);
        return pd >= bucketStart && pd < bucketEnd;
      })
      .reduce((s, p) => s + Number(p.amount), 0);

    const outflow = (paymentsMade ?? [])
      .filter((p) => {
        const pd = new Date(p.created_at);
        return pd >= bucketStart && pd < bucketEnd;
      })
      .reduce((s, p) => s + Number(p.amount), 0);

    const label = bucketSize <= 1
      ? bucketStart.toLocaleDateString("en-IN", { day: "numeric", month: "short" })
      : bucketStart.toLocaleDateString("en-IN", { month: "short", day: "numeric" });

    cashFlow.push({ label, inflow, outflow });
  }

  // Quick insights
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
  const overdueCount = new Set(
    (orders ?? [])
      .filter((o: any) => {
        const st = (o.status ?? "").toLowerCase();
        return st !== "paid" && Number(o.balance_due) > 0;
      })
      .map((o: any) => o.customer_id),
  ).size;

  const sevenDaysFromNow = new Date();
  sevenDaysFromNow.setDate(sevenDaysFromNow.getDate() + 7);
  const upcomingPayables = (deliveries ?? [])
    .filter((d: any) => new Date(d.created_at ?? now) < sevenDaysFromNow)
    .reduce((s: number, d: any) => s + Number(d.total_amount), 0);

  return {
    totalReceivables,
    totalPayables,
    netBalance,
    topCustomers,
    topSuppliers,
    cashFlow,
    overdueCount,
    upcomingPayables,
  };
}

export async function exportNetPositionReport(
  vendorId: string,
  rangeDays: number,
) {
  const { data, error } = await supabase.functions.invoke(
    "net-position-export",
    {
      body: { vendorId, rangeDays },
    },
  );

  if (error) throw toApiError(error);

  return data as {
    pdfBase64: string;
    fileName?: string;
  };
}
