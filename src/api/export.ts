import { supabase } from "../services/supabase";

// ─── Types ───────────────────────────────────────────────────────────────────

export interface ExportOrder {
  bill_number: string;
  date: string;
  customer_name: string;
  customer_phone: string;
  items_count: number;
  subtotal: number;
  tax_percent: number;
  loading_charge: number;
  previous_balance: number;
  total_amount: number;
  amount_paid: number;
  balance_due: number;
  status: string;
}

export interface ExportPayment {
  date: string;
  bill_number: string;
  customer_name: string;
  customer_phone: string;
  amount: number;
  payment_mode: string;
}

export interface ExportCustomer {
  name: string;
  phone: string;
  address: string;
  outstanding_balance: number;
}

export interface ExportSupplierPurchase {
  date: string;
  supplier_name: string;
  supplier_phone: string;
  total_amount: number;
  advance_paid: number;
  balance_owed: number;
}

// ─── Date helpers ─────────────────────────────────────────────────────────────

function isoRange(from?: string, to?: string) {
  const start = from ? new Date(from + "T00:00:00.000Z").toISOString() : null;
  const end = to ? new Date(to + "T23:59:59.999Z").toISOString() : null;
  return { start, end };
}

// ─── Orders export ───────────────────────────────────────────────────────────

export async function fetchOrdersForExport(
  vendorId: string,
  from?: string,
  to?: string,
): Promise<ExportOrder[]> {
  const { start, end } = isoRange(from, to);

  let query = supabase
    .from("orders")
    .select(
      `bill_number, created_at, status,
       total_amount, amount_paid, previous_balance, loading_charge, tax_percent,
       customers ( name, phone ),
       order_items ( id )`,
    )
    .eq("vendor_id", vendorId)
    .order("created_at", { ascending: false });

  if (start) query = query.gte("created_at", start);
  if (end) query = query.lte("created_at", end);

  const { data, error } = await query;
  if (error) throw error;

  return (data ?? []).map((o: any) => {
    const total = Number(o.total_amount ?? 0);
    const paid = Number(o.amount_paid ?? 0);
    const prev = Number(o.previous_balance ?? 0);
    const loading = Number(o.loading_charge ?? 0);
    const tax = Number(o.tax_percent ?? 0);
    const subtotal =
      total - prev - loading - (total - prev - loading) * (tax / (100 + tax));
    const customer = Array.isArray(o.customers)
      ? (o.customers[0] ?? {})
      : (o.customers ?? {});
    return {
      bill_number: o.bill_number ?? "",
      date: o.created_at ? o.created_at.substring(0, 10) : "",
      customer_name: customer.name ?? "",
      customer_phone: customer.phone ?? "",
      items_count: (o.order_items ?? []).length,
      subtotal: Math.round(subtotal * 100) / 100,
      tax_percent: tax,
      loading_charge: loading,
      previous_balance: prev,
      total_amount: total,
      amount_paid: paid,
      balance_due: total - paid,
      status: o.status ?? "",
    };
  });
}

// ─── Payments received export ─────────────────────────────────────────────────

export async function fetchPaymentsForExport(
  vendorId: string,
  from?: string,
  to?: string,
): Promise<ExportPayment[]> {
  const { start, end } = isoRange(from, to);

  let query = supabase
    .from("payments")
    .select(
      `payment_date, amount, payment_mode,
       orders ( bill_number, total_amount, customers ( name, phone ) )`,
    )
    .eq("vendor_id", vendorId)
    .order("payment_date", { ascending: false });

  if (start) query = query.gte("payment_date", start);
  if (end) query = query.lte("payment_date", end);

  const { data, error } = await query;
  if (error) throw error;

  return (data ?? []).map((p: any) => {
    const order = Array.isArray(p.orders)
      ? (p.orders[0] ?? {})
      : (p.orders ?? {});
    const customer = Array.isArray(order.customers)
      ? (order.customers[0] ?? {})
      : (order.customers ?? {});
    return {
      date: p.payment_date ? p.payment_date.substring(0, 10) : "",
      bill_number: order.bill_number ?? "",
      customer_name: customer.name ?? "",
      customer_phone: customer.phone ?? "",
      amount: Number(p.amount ?? 0),
      payment_mode: p.payment_mode ?? "",
    };
  });
}

// ─── Customer balances export ─────────────────────────────────────────────────

export async function fetchCustomersForExport(
  vendorId: string,
): Promise<ExportCustomer[]> {
  const { data: customers, error } = await supabase
    .from("customers")
    .select("id, name, phone, address")
    .eq("vendor_id", vendorId)
    .order("name", { ascending: true });
  if (error) throw error;

  if (!customers || customers.length === 0) return [];

  // Get outstanding balance per customer from orders
  const { data: orders, error: oErr } = await supabase
    .from("orders")
    .select("customer_id, total_amount, amount_paid")
    .eq("vendor_id", vendorId);
  if (oErr) throw oErr;

  const balanceMap: Record<string, number> = {};
  for (const o of orders ?? []) {
    const b = Number(o.total_amount) - Number(o.amount_paid);
    balanceMap[o.customer_id] = (balanceMap[o.customer_id] ?? 0) + b;
  }

  return customers.map((c: any) => ({
    name: c.name ?? "",
    phone: c.phone ?? "",
    address: c.address ?? "",
    outstanding_balance: Math.round((balanceMap[c.id] ?? 0) * 100) / 100,
  }));
}

// ─── Supplier purchases export ────────────────────────────────────────────────

export async function fetchSupplierPurchasesForExport(
  vendorId: string,
  from?: string,
  to?: string,
): Promise<ExportSupplierPurchase[]> {
  const { start, end } = isoRange(from, to);

  let query = supabase
    .from("supplier_deliveries")
    .select(
      `delivery_date, total_amount, advance_paid,
       suppliers ( name, phone )`,
    )
    .eq("vendor_id", vendorId)
    .order("delivery_date", { ascending: false });

  if (start) query = query.gte("delivery_date", start);
  if (end) query = query.lte("delivery_date", end);

  const { data, error } = await query;
  if (error) throw error;

  return (data ?? []).map((d: any) => {
    const supplier = Array.isArray(d.suppliers)
      ? (d.suppliers[0] ?? {})
      : (d.suppliers ?? {});
    const total = Number(d.total_amount ?? 0);
    const advance = Number(d.advance_paid ?? 0);
    return {
      date: d.delivery_date ? d.delivery_date.substring(0, 10) : "",
      supplier_name: supplier.name ?? "",
      supplier_phone: supplier.phone ?? "",
      total_amount: total,
      advance_paid: advance,
      balance_owed: Math.round((total - advance) * 100) / 100,
    };
  });
}
