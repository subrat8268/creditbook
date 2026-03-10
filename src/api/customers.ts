import { supabase } from "../services/supabase";
import { Customer, CustomerDetail } from "../types/customer";

export const PAGE_SIZE = 10;

export async function fetchCustomers(
  pageParam: number,
  vendorId: string,
  search?: string,
) {
  let query = supabase
    .from("customers")
    .select("*")
    .eq("vendor_id", vendorId)
    .order("created_at", { ascending: false })
    .range(pageParam * PAGE_SIZE, pageParam * PAGE_SIZE + PAGE_SIZE - 1);

  if (search) {
    query = query.or(`name.ilike.%${search}%,phone.ilike.%${search}%`);
  }

  const { data, error } = await query;
  if (error) throw error;
  const customers = (data ?? []) as Customer[];

  // Determine overdue: balance_due > 0 AND last order > 30 days ago
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  const { data: overdueOrders } = await supabase
    .from("orders")
    .select("customer_id")
    .eq("vendor_id", vendorId)
    .gt("balance_due", 0)
    .lt("created_at", thirtyDaysAgo.toISOString());

  const overdueIds = new Set(
    (overdueOrders ?? []).map((o: any) => o.customer_id),
  );

  // Fetch sum of balance_due per customer
  const { data: balanceRows } = await supabase
    .from("orders")
    .select("customer_id, balance_due")
    .eq("vendor_id", vendorId)
    .in(
      "customer_id",
      customers.map((c) => c.id),
    );

  const balanceByCustomer: Record<string, number> = {};
  const lastActiveByCustomer: Record<string, string> = {};
  for (const row of balanceRows ?? []) {
    balanceByCustomer[row.customer_id] =
      (balanceByCustomer[row.customer_id] ?? 0) + Number(row.balance_due);
    const existing = lastActiveByCustomer[row.customer_id];
    if (!existing || row.created_at > existing) {
      lastActiveByCustomer[row.customer_id] = row.created_at;
    }
  }

  return customers.map((c) => ({
    ...c,
    isOverdue: overdueIds.has(c.id),
    outstandingBalance: balanceByCustomer[c.id] ?? 0,
    lastActiveAt: lastActiveByCustomer[c.id] ?? c.created_at,
  }));
}

export async function addCustomer(
  vendorId: string,
  values: Omit<Customer, "id" | "vendor_id" | "created_at">,
) {
  const { data, error } = await supabase
    .from("customers")
    .insert([{ ...values, vendor_id: vendorId }])
    .select()
    .single();
  if (error) throw error;
  return data as Customer;
}

export async function fetchCustomerDetail(
  customerId: string,
): Promise<CustomerDetail | null> {
  // Fetch customer profile
  const { data: customer, error: custErr } = await supabase
    .from("customers")
    .select("id, name, phone, address")
    .eq("id", customerId.trim())
    .maybeSingle();

  if (custErr) {
    console.error("Error fetching customer:", custErr.message);
    return null;
  }
  if (!customer) return null;

  // Fetch orders for customer (ascending to compute balance forward)
  const { data: orders, error: orderErr } = await supabase
    .from("orders")
    .select(
      "id, created_at, total_amount, amount_paid, balance_due, status, bill_number",
    )
    .eq("customer_id", customerId)
    .order("created_at", { ascending: true });

  if (orderErr) {
    console.error("Error fetching orders:", orderErr.message);
    return null;
  }

  const orderList = orders ?? [];
  const outstandingBalance = orderList.reduce(
    (sum, o) => sum + Number(o.balance_due),
    0,
  );

  // Overdue: outstanding balance AND most recent order is >30 days old
  const lastOrder = orderList[orderList.length - 1];
  const lastOrderDate = lastOrder?.created_at ?? null;
  const daysSinceLastOrder = lastOrderDate
    ? Math.floor(
        (Date.now() - new Date(lastOrderDate).getTime()) /
          (1000 * 60 * 60 * 24),
      )
    : 0;
  const isOverdue = outstandingBalance > 0 && daysSinceLastOrder > 30;

  // Fetch all payments for these orders in one batch
  const orderIds = orderList.map((o) => o.id);
  const { data: payments } = orderIds.length
    ? await supabase
        .from("payments")
        .select("id, order_id, amount, payment_date, payment_mode")
        .in("order_id", orderIds)
        .order("payment_date", { ascending: true })
    : { data: [] };

  // Build unified transaction list with running balance (forward pass)
  const billEvents = orderList.map((o) => ({
    id: o.id,
    type: "bill" as const,
    created_at: o.created_at,
    amount: Number(o.total_amount),
    runningBalance: 0,
    billNumber: o.bill_number as string | undefined,
    status: o.status as "Paid" | "Pending" | "Partially Paid",
  }));

  const paymentEvents = (payments ?? []).map((p) => ({
    id: p.id,
    type: "payment" as const,
    created_at: p.payment_date,
    amount: Number(p.amount),
    runningBalance: 0,
    paymentMode: p.payment_mode as string,
  }));

  // Sort ascending by time for forward pass
  const allEvents = [...billEvents, ...paymentEvents].sort(
    (a, b) =>
      new Date(a.created_at).getTime() - new Date(b.created_at).getTime(),
  );

  // Compute running balance (balance owed after each event)
  let running = 0;
  for (const ev of allEvents) {
    if (ev.type === "bill") running += ev.amount;
    else running -= ev.amount;
    ev.runningBalance = Math.max(running, 0);
  }

  // Reverse for newest-first display
  allEvents.reverse();

  // Find oldest pending/partially-paid order for payment recording
  const pendingOrder = orderList.find(
    (o) => o.status !== "Paid" && Number(o.balance_due) > 0,
  );

  return {
    ...customer,
    outstandingBalance,
    isOverdue,
    daysSinceLastOrder,
    lastActiveAt: lastOrderDate,
    pendingOrderId: pendingOrder?.id ?? null,
    pendingOrderBalance: pendingOrder ? Number(pendingOrder.balance_due) : 0,
    orders: orderList
      .slice()
      .reverse()
      .map((o) => ({
        id: o.id,
        created_at: o.created_at,
        amount: Number(o.total_amount),
        status: o.status as "Paid" | "Pending" | "Partially Paid",
      })),
    transactions: allEvents,
  };
}
