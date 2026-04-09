import { toApiError } from "../lib/supabaseQuery";
import { supabase, executeWithOfflineQueue } from "../services/supabase";
import { Person, PersonDetail } from "../types/customer";
export type { Person };

export const PAGE_SIZE = 10;

export async function fetchPeople(
  pageParam: number,
  vendorId: string,
  search?: string,
) {
  let query = supabase
    .from("parties")
    .select("id, vendor_id, name, phone, address, created_at")
    .eq("vendor_id", vendorId)
    .eq("is_customer", true)
    .order("created_at", { ascending: false })
    .range(pageParam * PAGE_SIZE, pageParam * PAGE_SIZE + PAGE_SIZE - 1);

  if (search) {
    query = query.or(`name.ilike.%${search}%,phone.ilike.%${search}%`);
  }

  const { data, error } = await query;
  if (error) throw toApiError(error);
  const customers = (data ?? []) as Person[];

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
    .select("customer_id, balance_due, created_at")
    .eq("vendor_id", vendorId)
    .in(
      "customer_id",
      customers.map((c) => c.id),
    );

  const balanceByPerson: Record<string, number> = {};
  const lastActiveByPerson: Record<string, string> = {};
  for (const row of balanceRows ?? []) {
    balanceByPerson[row.customer_id] =
      (balanceByPerson[row.customer_id] ?? 0) + Number(row.balance_due);
    const existing = lastActiveByPerson[row.customer_id];
    if (!existing || row.created_at > existing) {
      lastActiveByPerson[row.customer_id] = row.created_at;
    }
  }

  return customers.map((c) => ({
    ...c,
    isOverdue: overdueIds.has(c.id),
    outstandingBalance: balanceByPerson[c.id] ?? 0,
    lastActiveAt: lastActiveByPerson[c.id] ?? c.created_at,
  }));
}

export async function addPerson(
  vendorId: string,
  values: Omit<Person, "id" | "vendor_id" | "created_at">,
) {
  // Wrap mutation with offline queue fallback
  return executeWithOfflineQueue(
    async () => {
      const { openingBalance, ...rest } = values as any;
      const payload: Record<string, any> = { ...rest, vendor_id: vendorId };
      if (openingBalance && openingBalance > 0) {
        payload.opening_balance = openingBalance;
      }
      const { data, error } = await supabase
        .from("parties")
        .insert([
          {
            ...payload,
            is_customer: true,
            is_supplier: false,
          },
        ])
        .select()
        .single();
      if (error) {
        if (error.code === "23505") {
          throw new Error(
            "A person with this phone number already exists in your account.",
          );
        }
        throw error;
      }
      return data as Person;
    },
    {
      entity: 'customer',
      operation: 'CREATE',
      payload: {
        vendorId,
        ...values,
      },
    }
  );
}

// Backward-compatible aliases (deprecated)
export const fetchCustomers = fetchPeople;
export const addCustomer = addPerson;
export const fetchCustomerDetail = fetchPersonDetail;

export async function fetchPersonDetail(
  customerId: string,
): Promise<PersonDetail | null> {
  // Fetch customer profile from parties table
  const { data: customer, error: custErr } = await supabase
    .from("parties")
    .select("id, name, phone, address")
    .eq("id", customerId.trim())
    .eq("is_customer", true)
    .maybeSingle();

  if (custErr) {
    console.error("Error fetching customer:", custErr.message);
    return null;
  }
  if (!customer) return null;

  // Fetch orders and statements in parallel
  const [ordersResult, statementsResult] = await Promise.all([
    supabase
      .from("orders")
      .select("id, created_at, total_amount, amount_paid, balance_due, status, bill_number")
      .eq("customer_id", customerId)
      .order("created_at", { ascending: true }),
    supabase
      .rpc("get_customer_statement", { p_customer_id: customerId })
  ]);

  if (ordersResult.error) {
    console.error("Error fetching orders:", ordersResult.error.message);
    return null;
  }
  if (statementsResult.error) {
    console.error("Error fetching statements:", statementsResult.error.message);
    return null;
  }

  const orderList = ordersResult.data ?? [];
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

  // Map RPC statements to unified transaction list
  const allEvents = (statementsResult.data ?? []).map((s: any) => ({
    id: s.id,
    type: s.type as "bill" | "payment",
    created_at: s.created_at,
    amount: Number(s.amount),
    runningBalance: Number(s.running_balance),
    billNumber: s.bill_number,
    status: s.status as "Paid" | "Pending" | "Partially Paid" | undefined,
    itemCount: Number(s.item_count),
    paymentMode: s.payment_mode,
    orderBillNumber: s.order_bill_number,
  }));

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
