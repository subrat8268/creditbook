import { supabase } from "@/src/services/supabase";

export interface DashboardData {
  totalRevenue: number;
  outstandingAmount: number;
  unpaidOrders: number;
  partialOrders: number;
}

export async function getDashboardData(
  vendorId: string
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
    };

  // 3️⃣ Define status groups
  const unpaidStatuses = ["pending", "unpaid"];
  const partialStatuses = ["partially paid", "partial"];

  const unpaidOrders = orders.filter((o) =>
    unpaidStatuses.includes((o.status ?? "").trim().toLowerCase())
  ).length;
  const partialOrders = orders.filter((o) =>
    partialStatuses.includes((o.status ?? "").trim().toLowerCase())
  ).length;

  const outstandingAmount = orders
    .filter((o) => unpaidStatuses.includes((o.status ?? "").toLowerCase()))
    .reduce((sum, o) => sum + Number(o.balance_due ?? 0), 0);

  return { totalRevenue, outstandingAmount, unpaidOrders, partialOrders };
}
