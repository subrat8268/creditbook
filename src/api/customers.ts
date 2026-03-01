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

  return customers.map((c) => ({ ...c, isOverdue: overdueIds.has(c.id) }));
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

  // Fetch orders for customer
  const { data: orders, error: orderErr } = await supabase
    .from("orders")
    .select("id, created_at, total_amount, amount_paid, balance_due, status")
    .eq("customer_id", customerId)
    .order("created_at", { ascending: false });

  if (orderErr) {
    console.error("Error fetching orders:", orderErr.message);
    return null;
  }

  const outstandingBalance =
    orders?.reduce((sum, o) => sum + Number(o.balance_due), 0) ?? 0;

  // Overdue: outstanding balance AND most recent order is >30 days old
  const lastOrderDate = orders?.[0]?.created_at ?? null;
  const daysSinceLastOrder = lastOrderDate
    ? Math.floor(
        (Date.now() - new Date(lastOrderDate).getTime()) /
          (1000 * 60 * 60 * 24),
      )
    : 0;
  const isOverdue = outstandingBalance > 0 && daysSinceLastOrder > 30;

  return {
    ...customer,
    outstandingBalance,
    isOverdue,
    daysSinceLastOrder,
    orders:
      orders.map((o) => ({
        id: o.id,
        created_at: o.created_at,
        amount: o.total_amount,
        status: o.status,
      })) ?? [],
  };
}
