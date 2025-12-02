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
  total_amount: number;
  amount_paid: number;
  balance_due: number;
  status: "Paid" | "Pending" | "Partially Paid";
  created_at: string;
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

export type PaymentMode = "Cash" | "Online";

export interface Payment {
  id: string;
  vendor_id: string;
  order_id: string;
  amount: number;
  payment_date: string;
  payment_mode: PaymentMode;
}

export const PAGE_SIZE = 10;

// List orders by vendor
export async function fetchOrders(
  pageParam: number,
  vendorId: string,
  search?: string,
  statusFilter?: string,
  sortBy?: "newest" | "oldest" | "high" | "low"
): Promise<Order[]> {
  let query = supabase
    .from("orders")
    .select("*, customers(id, name, phone))")
    .eq("vendor_id", vendorId);

  // Apply status filter if not "All"
  if (statusFilter && statusFilter !== "All") {
    query = query.eq("status", statusFilter);
  }

  // Apply search filter (by order id, customer name or phone)
  if (search && search.trim() !== "") {
    const searchTerm = `%${search.trim()}%`;
    query = query.or(
      `id.ilike.${searchTerm},customer_name.ilike.${searchTerm},customer_phone.ilike.${searchTerm}`
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
    pageParam * PAGE_SIZE + PAGE_SIZE - 1
  );

  const { data, error } = await query;
  if (error) throw error;

  return (data ?? []).map((o) => ({
    ...o,
    total_amount: Number(o.total_amount),
    amount_paid: Number(o.amount_paid),
    balance_due: Number(o.total_amount) - Number(o.amount_paid),
  })) as Order[];
}

// Single order with customer info
export async function fetchOrderDetail(
  orderId: string
): Promise<OrderDetail | null> {
  const { data, error } = await supabase
    .from("orders")
    .select(
      `
      id, vendor_id, customer_id, total_amount, amount_paid, status, created_at,
      customers ( id, name, phone, address ),
      order_items ( id, product_id, product_name, variant_name, price, quantity, created_at )
    `
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
  markFull: boolean
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
  const { error: insertErr } = await supabase.from("payments").insert([
    {
      order_id: orderId,
      vendor_id: vendorId,
      amount: paymentAmount,
      payment_mode: paymentMode,
    },
  ]);
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
  paymentMode?: PaymentMode
): Promise<OrderDetail> {
  // 1. Calculate totals
  const totalAmount = items.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );

  const status =
    amountPaid >= totalAmount
      ? "Paid"
      : amountPaid > 0
        ? "Partially Paid"
        : "Pending";

  // 2. Insert order
  const { data: orderData, error: orderErr } = await supabase
    .from("orders")
    .insert([
      {
        vendor_id: vendorId,
        customer_id: customerId,
        total_amount: totalAmount,
        amount_paid: amountPaid,
        status,
      },
    ])
    .select("*")
    .single();

  if (orderErr) throw orderErr;
  if (!orderData) throw new Error("Failed to create order");

  // 3. Insert order_items
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

  // 4. Record payment if amountPaid > 0
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
