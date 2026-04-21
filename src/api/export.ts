import { toApiError } from "../lib/supabaseQuery";
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
       parties ( name, phone ),
       order_items ( id )`,
    )
    .eq("vendor_id", vendorId)
    .order("created_at", { ascending: false });

  if (start) query = query.gte("created_at", start);
  if (end) query = query.lte("created_at", end);

  const { data, error } = await query;
  if (error) throw toApiError(error);

  return (data ?? []).map((o: any) => {
    const total = Number(o.total_amount ?? 0);
    const paid = Number(o.amount_paid ?? 0);
    const prev = Number(o.previous_balance ?? 0);
    const loading = Number(o.loading_charge ?? 0);
    const tax = Number(o.tax_percent ?? 0);
    const subtotal =
      total - prev - loading - (total - prev - loading) * (tax / (100 + tax));
    const person = Array.isArray(o.parties)
      ? (o.parties[0] ?? {})
      : (o.parties ?? {});
    return {
      bill_number: o.bill_number ?? "",
      date: o.created_at ? o.created_at.substring(0, 10) : "",
      customer_name: person.name ?? "",
      customer_phone: person.phone ?? "",
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
