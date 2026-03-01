import { supabase } from "@/src/services/supabase";

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
}

export async function getDashboardData(
  vendorId: string,
): Promise<DashboardData> {
  // Payments
  const { data: payments, error: payErr } = await supabase
    .from("payments")
    .select("amount")
    .eq("vendor_id", vendorId);

  if (payErr) throw new Error(payErr.message);

  const totalRevenue =
    payments?.reduce((sum, p) => sum + Number(p.amount), 0) ?? 0;

  // Orders
  const { data: orders, error: orderErr } = await supabase
    .from("orders")
    .select("balance_due, status")
    .eq("vendor_id", vendorId);

  if (orderErr) throw new Error(orderErr.message);

  if (!orders)
    return {
      totalRevenue,
      outstandingAmount: 0,
      unpaidOrders: 0,
      partialOrders: 0,
      overdueCustomers: 0,
    };

  // 3️⃣ Define status groups
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

  // Overdue: unique customers with balance_due > 0 and last order > 30 days old
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
      .select("total_amount")
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

  return {
    totalRevenue,
    outstandingAmount,
    unpaidOrders,
    partialOrders,
    overdueCustomers,
    customersOweMe,
    iOweSuppliers,
    netPosition,
  };
}
