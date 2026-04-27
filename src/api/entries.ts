import { toApiError } from "../lib/supabaseQuery";
import { supabase, executeWithOfflineQueue } from "../services/supabase";

export interface OrderItem {
  id: string;
  order_id: string;
  product_id: string | null;
  variant_id?: string | null;
  product_name: string;
  variant_name?: string | null;
  price: number;
  quantity: number;
  subtotal: number;
  vendor_id: string;
  created_at: string;
}

export interface OrderItemInput {
  product_id: string | null;
  product_name: string;
  variant_id?: string | null;
  variant_name?: string | null;
  price: number;
  quantity: number;
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
  edited_at?: string | null;
  edit_count?: number | null;
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
    ? "*, customer:parties!inner(id, name, phone)"
    : "*, customer:parties(id, name, phone)";

  let query = supabase
    .from("orders")
    .select(selectClause)
    .eq("vendor_id", vendorId);

  // Apply status filter if not "All"
  if (statusFilter && statusFilter !== "All") {
    query = query.eq("status", statusFilter);
  }

  // Apply search filter — uses dot notation to reference joined parties columns
  if (search && search.trim() !== "") {
    const searchTerm = `%${search.trim()}%`;
    query = query.or(
      `bill_number.ilike.${searchTerm},parties.name.ilike.${searchTerm},parties.phone.ilike.${searchTerm}`,
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
  if (error) throw toApiError(error);

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
      previous_balance, loading_charge, tax_percent, status, edited_at, edit_count, created_at,
       parties ( id, name, phone, address ),
      order_items ( id, product_id, variant_id, product_name, variant_name, price, quantity, created_at )
    `,
    )
    .eq("id", orderId)
    .maybeSingle();
  if (error) throw toApiError(error);
  if (!data) return null;

  return {
    ...data,
    total_amount: Number(data.total_amount),
    amount_paid: Number(data.amount_paid),
    balance_due: Number(data.total_amount) - Number(data.amount_paid),
    previous_balance: Number(data.previous_balance || 0),
    loading_charge: Number(data.loading_charge || 0),
    tax_percent: Number(data.tax_percent || 0),
    edited_at: data.edited_at ?? null,
    edit_count: data.edit_count ?? 0,
    customer: Array.isArray(data.parties)
      ? (data.parties[0] ?? null)
      : (data.parties ?? null),
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

  if (error) throw toApiError(error);

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
  // Wrap mutation with offline queue fallback
  return executeWithOfflineQueue(
    async () => {
      // 1. Get current order to calculate balance
      const { data: order, error: orderErr } = await supabase
        .from("orders")
        .select("total_amount, amount_paid")
        .eq("id", orderId)
        .single();

      if (orderErr) throw toApiError(orderErr);
      if (!order) throw new Error("Order not found");

      const totalAmount = Number(order.total_amount);
      const currentPaid = Number(order.amount_paid);
      const currentBalance = totalAmount - currentPaid;

      // 2. Determine payment amount
      const paymentAmount = markFull ? currentBalance : amount;
      if (paymentAmount <= 0) throw new Error("Invalid payment amount");

      // 3. Insert into payments
      // NOTE: The `on_payment_upsert` DB trigger will automatically update
      // the parent order's amount_paid and status. Do not update it here.
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
      if (insertErr) throw toApiError(insertErr);
    },
    {
      entity: 'payment',
      operation: 'CREATE',
      payload: {
        vendorId,
        orderId,
        amount,
        paymentMode,
        markFull,
        notes,
      },
    }
  );
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
  items: OrderItemInput[],
  amountPaid: number,
  paymentMode?: PaymentMode,
  loadingCharge: number = 0,
  taxPercent: number = 0,
  billNumberPrefix: string = "INV",
): Promise<OrderDetail> {
  // Wrap mutation with offline queue fallback
  return executeWithOfflineQueue(
    async () => {
      // Use Postgres RPC to ensure order, items, and payments are inserted atomically
      const { data, error } = await supabase.rpc("create_order_transaction", {
        p_vendor_id: vendorId,
        p_customer_id: customerId,
        p_items: items,
        p_amount_paid: amountPaid,
        p_payment_mode: paymentMode || null,
        p_loading_charge: loadingCharge,
        p_tax_percent: taxPercent,
        p_bill_prefix: billNumberPrefix,
      });

      if (error) throw toApiError(error);
      if (!data?.order_id) throw new Error("Failed to create order");

      // Fetch and return the fully detailed order
      const orderDetail = await fetchOrderDetail(data.order_id);
      if (!orderDetail) throw new Error("Failed to fetch created order details");
      return orderDetail;
    },
    {
      entity: 'order',
      operation: 'CREATE',
      payload: {
        vendorId,
        customerId,
        items,
        amountPaid,
        paymentMode,
        loadingCharge,
        taxPercent,
        billNumberPrefix,
      },
    }
  );
}

/**
 * Update an existing order (items + totals)
 */
export async function updateOrder(
  orderId: string,
  vendorId: string,
  items: OrderItemInput[],
  loadingCharge: number,
  taxPercent: number,
  quickAmount: number,
): Promise<OrderDetail> {
  // Wrap mutation with offline queue fallback
  return executeWithOfflineQueue(
    async () => {
      // Fetch order to validate ownership and access customer_id
      const { data: existing, error: existingErr } = await supabase
        .from("orders")
        .select("id, vendor_id, customer_id, amount_paid, total_amount, loading_charge, tax_percent, status")
        .eq("id", orderId)
        .single();

      if (existingErr) throw toApiError(existingErr);
      if (!existing || existing.vendor_id !== vendorId) {
        throw new Error("Order not found");
      }

      const useItems = items.length > 0;
      const safeLoading = Math.max(0, Number(loadingCharge) || 0);
      const safeTax = Math.min(100, Math.max(0, Number(taxPercent) || 0));
      const normalizedItems = useItems
        ? items
        : [
            {
              product_id: null,
              product_name: "Entry Amount",
              variant_id: null,
              variant_name: null,
              price: Number(quickAmount || 0),
              quantity: 1,
            },
          ];
      const itemsTotal = normalizedItems.reduce(
        (sum, item) => sum + item.price * item.quantity,
        0,
      );
      const safeQuickAmount = Math.max(0, Number.isFinite(quickAmount) ? quickAmount : 0);
      const totalAmount = useItems
        ? Number((itemsTotal + (itemsTotal * safeTax) / 100 + safeLoading).toFixed(2))
        : safeQuickAmount;

      if (totalAmount <= 0) {
        throw new Error("Total amount must be greater than zero");
      }

      const amountPaid = Number(existing.amount_paid || 0);
      if (totalAmount < amountPaid) {
        throw new Error("Total amount cannot be less than amount already paid");
      }
      const balanceDue = totalAmount - amountPaid;
      const status =
        balanceDue <= 0
          ? "Paid"
          : amountPaid > 0
          ? "Partially Paid"
          : "Pending";


      const isMissingRpc = (error: any) => {
        const message = String(error?.message ?? "").toLowerCase();
        return (
          error?.code === "PGRST202" ||
          (message.includes("function") &&
            message.includes("update_order_transaction"))
        );
      };

      const rpcPayload = {
        p_order_id: orderId,
        p_vendor_id: vendorId,
        p_items: normalizedItems,
        p_loading_charge: useItems ? safeLoading : 0,
        p_tax_percent: useItems ? safeTax : 0,
        p_quick_amount: safeQuickAmount,
      };

      const { error: rpcError } = await supabase.rpc(
        "update_order_transaction",
        rpcPayload,
      );

      if (rpcError && !isMissingRpc(rpcError)) {
        throw toApiError(rpcError);
      }

      if (rpcError && isMissingRpc(rpcError)) {
        const { data: previousItems, error: previousItemsErr } = await supabase
          .from("order_items")
          .select("product_id, variant_id, product_name, variant_name, price, quantity")
          .eq("order_id", orderId)
          .eq("vendor_id", vendorId);

        if (previousItemsErr) throw toApiError(previousItemsErr);

        const { error: deleteErr } = await supabase
          .from("order_items")
          .delete()
          .eq("order_id", orderId)
          .eq("vendor_id", vendorId);

        if (deleteErr) throw toApiError(deleteErr);

        if (normalizedItems.length > 0) {
          const payload = normalizedItems.map((item) => ({
            order_id: orderId,
            vendor_id: vendorId,
            product_id: item.product_id,
            variant_id: item.variant_id ?? null,
            product_name: item.product_name,
            variant_name: item.variant_name ?? null,
            price: item.price,
            quantity: item.quantity,
          }));

          const { error: insertErr } = await supabase
            .from("order_items")
            .insert(payload);

          if (insertErr) {
            if (previousItems?.length) {
              await supabase.from("order_items").insert(
                previousItems.map((item) => ({
                  order_id: orderId,
                  vendor_id: vendorId,
                  product_id: item.product_id,
                  variant_id: item.variant_id ?? null,
                  product_name: item.product_name,
                  variant_name: item.variant_name ?? null,
                  price: item.price,
                  quantity: item.quantity,
                })),
              );
            }
            throw toApiError(insertErr);
          }
        }

        const { error: orderErr } = await supabase
          .from("orders")
          .update({
            total_amount: totalAmount,
            loading_charge: useItems ? safeLoading : 0,
            tax_percent: useItems ? safeTax : 0,
            status,
          })
          .eq("id", orderId)
          .eq("vendor_id", vendorId);

        if (orderErr) {
          if (previousItems?.length) {
            await supabase
              .from("order_items")
              .delete()
              .eq("order_id", orderId)
              .eq("vendor_id", vendorId);
            await supabase.from("order_items").insert(
              previousItems.map((item) => ({
                order_id: orderId,
                vendor_id: vendorId,
                product_id: item.product_id,
                variant_id: item.variant_id ?? null,
                product_name: item.product_name,
                variant_name: item.variant_name ?? null,
                price: item.price,
                quantity: item.quantity,
              })),
            );
          }
          throw toApiError(orderErr);
        }
      }

      const updated = await fetchOrderDetail(orderId);
      if (!updated) throw new Error("Failed to fetch updated order");
      return updated;
    },
    {
      entity: "order",
      operation: "UPDATE",
      payload: {
        orderId,
        vendorId,
        items,
        loadingCharge,
        taxPercent,
        quickAmount,
      },
    },
  );
}
