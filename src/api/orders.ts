import { supabase } from "../services/supabase";

export interface OrderItem {
  id: string;
  order_id: string;
  product_id: string | null;
  product_name: string;
  variant_name?: string | null;
  price: number;
  quantity: number;
  subtotal: number;
  vendor_id: string;
  created_at: string;
}

export interface Order {
  id: string;
  vendor_id: string;
  customer_id: string;
  bill_number: string;
  total_amount: number;
  amount_paid: number;
  balance_due: number;
  previous_balance: number;
  loading_charge: number;
  tax_percent: number;
  status: "Paid" | "Pending" | "Partially Paid";
  created_at: string;
  customer?: { id: string; name: string; phone: string } | null;
}

interface CustomerInfo {
  id: string;
  name: string;
  phone: string;
  address: string;
}

export interface OrderDetail extends Order {
  customer: CustomerInfo | null;
  items: OrderItem[];
}

export type PaymentMode = "Cash" | "UPI" | "NEFT" | "Draft" | "Cheque";

export interface Payment {
  id: string;
  vendor_id: string;
  order_id: string;
  amount: number;
  payment_date: string;
  payment_mode: PaymentMode;
  created_at: string;
}

export const PAGE_SIZE = 10;

// List orders by vendor
export async function fetchOrders(
  pageParam: number,
  vendorId: string,
  search?: string,
  statusFilter?: string,
  sortBy?: "newest" | "oldest" | "high" | "low",
): Promise<Order[]> {
  // Use !inner when searching so the join filters the result set;
  // fall back to regular join (allows orders with no customer) when not searching.
  const selectClause = search?.trim()
    ? "*, customers!inner(id, name, phone)"
    : "*, customers(id, name, phone)";

  let query = supabase
    .from("orders")
    .select(selectClause)
    .eq("vendor_id", vendorId);

  // Apply status filter if not "All"
  if (statusFilter && statusFilter !== "All") {
    query = query.eq("status", statusFilter);
  }

  // Apply search filter — uses dot notation to reference joined customers columns
  if (search && search.trim() !== "") {
    const searchTerm = `%${search.trim()}%`;
    query = query.or(
      `bill_number.ilike.${searchTerm},customers.name.ilike.${searchTerm},customers.phone.ilike.${searchTerm}`,
    );
  }

  // Apply sorting
  switch (sortBy) {
    case "oldest":
      query = query.order("created_at", { ascending: true });
      break;
    case "high":
      query = query.order("total_amount", { ascending: false });
      break;
    case "low":
      query = query.order("total_amount", { ascending: true });
      break;
    default:
      query = query.order("created_at", { ascending: false }); // newest
  }

  // Apply pagination
  query = query.range(
    pageParam * PAGE_SIZE,
    pageParam * PAGE_SIZE + PAGE_SIZE - 1,
  );

  const { data, error } = await query;
  if (error) throw error;

  return (data ?? []).map((o) => ({
    ...o,
    total_amount: Number(o.total_amount),
    amount_paid: Number(o.amount_paid),
    balance_due: Number(o.balance_due), // DB GENERATED column — do not recompute in JS
    previous_balance: Number(o.previous_balance || 0),
    loading_charge: Number(o.loading_charge || 0),
    tax_percent: Number(o.tax_percent || 0),
  })) as Order[];
}

// Single order with customer info
export async function fetchOrderDetail(
  orderId: string,
): Promise<OrderDetail | null> {
  const { data, error } = await supabase
    .from("orders")
    .select(
      `
      id, vendor_id, customer_id, bill_number, total_amount, amount_paid, 
      previous_balance, loading_charge, tax_percent, status, created_at,
      customers ( id, name, phone, address ),
      order_items ( id, product_id, product_name, variant_name, price, quantity, created_at )
    `,
    )
    .eq("id", orderId)
    .maybeSingle();
  if (error) throw error;
  if (!data) return null;

  return {
    ...data,
    total_amount: Number(data.total_amount),
    amount_paid: Number(data.amount_paid),
    balance_due: Number(data.total_amount) - Number(data.amount_paid),
    previous_balance: Number(data.previous_balance || 0),
    loading_charge: Number(data.loading_charge || 0),
    tax_percent: Number(data.tax_percent || 0),
    customer: Array.isArray(data.customers)
      ? (data.customers[0] ?? null)
      : (data.customers ?? null),
    items: (data.order_items ?? []).map((item: any) => ({
      ...item,
      price: Number(item.price),
      quantity: Number(item.quantity),
      subtotal: Number(item.price) * Number(item.quantity),
    })),
  };
}

// Payments Fucntions
export async function fetchPayments(orderId: string): Promise<Payment[]> {
  const { data, error } = await supabase
    .from("payments")
    .select("*")
    .eq("order_id", orderId)
    .order("payment_date", { ascending: false });

  if (error) throw error;

  return (data ?? []).map((p) => ({
    ...p,
    amount: Number(p.amount),
    payment_mode: p.payment_mode as PaymentMode,
  })) as Payment[];
}

export async function recordPayment(
  orderId: string,
  vendorId: string,
  amount: number,
  paymentMode: PaymentMode,
  markFull: boolean,
  notes?: string,
): Promise<void> {
  // 1. Get current order
  const { data: order, error: orderErr } = await supabase
    .from("orders")
    .select("total_amount, amount_paid")
    .eq("id", orderId)
    .single();

  if (orderErr) throw orderErr;
  if (!order) throw new Error("Order not found");

  const totalAmount = Number(order.total_amount);
  const currentPaid = Number(order.amount_paid);
  const currentBalance = totalAmount - currentPaid;

  // 2. Determine payment amount
  const paymentAmount = markFull ? currentBalance : amount;
  if (paymentAmount <= 0) throw new Error("Invalid payment amount");

  // 3. Insert into payments
  const paymentRow: Record<string, unknown> = {
    order_id: orderId,
    vendor_id: vendorId,
    amount: paymentAmount,
    payment_mode: paymentMode,
  };
  if (notes?.trim()) paymentRow.notes = notes.trim();

  const { error: insertErr } = await supabase
    .from("payments")
    .insert([paymentRow]);
  if (insertErr) throw insertErr;

  // 4. Update order
  const newPaid = currentPaid + paymentAmount;
  const status =
    newPaid >= totalAmount
      ? "Paid"
      : newPaid > 0
        ? "Partially Paid"
        : "Pending";

  const { error: updateErr } = await supabase
    .from("orders")
    .update({
      amount_paid: newPaid,
      status,
    })
    .eq("id", orderId);

  if (updateErr) throw updateErr;
}

/**
 * Get next sequential bill number for a vendor
 */
export async function getNextBillNumber(
  vendorId: string,
  prefix = "INV",
): Promise<string> {
  const { data, error } = await supabase.rpc("get_next_bill_number", {
    vendor_uuid: vendorId,
    prefix,
  });

  if (error) {
    console.error("Error getting next bill number:", error);
    // Fallback to timestamp-based if function doesn't exist
    return `${prefix}-${Date.now().toString().slice(-6)}`;
  }

  return data || `${prefix}-001`;
}

/**
 * Calculate customer's previous outstanding balance
 * (sum of all unpaid amounts from their orders)
 */
export async function getCustomerPreviousBalance(
  customerId: string,
  vendorId: string,
): Promise<number> {
  const { data, error } = await supabase.rpc("get_customer_previous_balance", {
    customer_uuid: customerId,
    vendor_uuid: vendorId,
  });

  if (error) {
    console.error("Error getting customer previous balance:", error);
    // Fallback to manual calculation
    const { data: orders } = await supabase
      .from("orders")
      .select("total_amount, amount_paid")
      .eq("customer_id", customerId)
      .eq("vendor_id", vendorId);

    if (!orders) return 0;

    return orders.reduce(
      (sum, order) =>
        sum + (Number(order.total_amount) - Number(order.amount_paid)),
      0,
    );
  }

  return Number(data || 0);
}

/**
 * Create a new order with items
 */
export async function createOrder(
  vendorId: string,
  customerId: string,
  items: {
    product_id: string | null;
    product_name: string;
    variant_name?: string | null;
    price: number;
    quantity: number;
  }[],
  amountPaid: number,
  paymentMode?: PaymentMode,
  loadingCharge: number = 0,
  taxPercent: number = 0,
  billNumberPrefix: string = "INV",
): Promise<OrderDetail> {
  // 1. Get bill number and previous balance
  const billNumber = await getNextBillNumber(vendorId, billNumberPrefix);
  const previousBalance = await getCustomerPreviousBalance(
    customerId,
    vendorId,
  );

  // 2. Calculate totals (tax applied to items only, not loading charge)
  const itemsTotal = items.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0,
  );
  const taxAmount = Math.round(((itemsTotal * taxPercent) / 100) * 100) / 100;
  const totalAmount = itemsTotal + taxAmount + loadingCharge;

  const status =
    amountPaid >= totalAmount
      ? "Paid"
      : amountPaid > 0
        ? "Partially Paid"
        : "Pending";

  // 3. Insert order
  const { data: orderData, error: orderErr } = await supabase
    .from("orders")
    .insert([
      {
        vendor_id: vendorId,
        customer_id: customerId,
        bill_number: billNumber,
        total_amount: totalAmount,
        amount_paid: amountPaid,
        previous_balance: previousBalance,
        loading_charge: loadingCharge,
        tax_percent: taxPercent,
        status,
      },
    ])
    .select("*")
    .single();

  if (orderErr) throw orderErr;
  if (!orderData) throw new Error("Failed to create order");

  // 4. Insert order_items
  const orderItems = items.map((item) => ({
    order_id: orderData.id,
    vendor_id: vendorId,
    product_id: item.product_id,
    product_name: item.product_name,
    variant_name: item.variant_name ?? null,
    price: item.price,
    quantity: item.quantity,
  }));

  const { error: itemsErr } = await supabase
    .from("order_items")
    .insert(orderItems);

  if (itemsErr) throw itemsErr;

  // 5. Record payment if amountPaid > 0
  if (amountPaid > 0 && paymentMode) {
    const { error: paymentErr } = await supabase.from("payments").insert([
      {
        order_id: orderData.id,
        vendor_id: vendorId,
        amount: amountPaid,
        payment_mode: paymentMode,
      },
    ]);
    if (paymentErr) throw paymentErr;
  }

  const orderDetail = await fetchOrderDetail(orderData.id);
  if (!orderDetail) throw new Error("Failed to fetch created order details");
  return orderDetail;
}
