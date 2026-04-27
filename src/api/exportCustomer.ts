import { toApiError } from "../lib/supabaseQuery";
import { supabase } from "../services/supabase";

export interface LedgerEntry {
  id: string;
  date: string;
  description: string;
  amount: number;
  status: string;
  balance_after: number;
  type: "bill" | "payment";
  bill_number?: string;
  payment_mode?: string;
  items?: { product_name: string; quantity: number; rate: number; subtotal: number }[];
}

export interface LedgerExport {
  customer_name: string;
  customer_phone: string;
  business_name: string;
  generated_at: string;
  date_from?: string;
  date_to?: string;
  opening_balance: number;
  entries: LedgerEntry[];
  closing_balance: number;
  total_bills: number;
  total_payments: number;
}

function isoRange(from?: string, to?: string) {
  const start = from ? new Date(from + "T00:00:00.000Z").toISOString() : null;
  const end = to ? new Date(to + "T23:59:59.999Z").toISOString() : null;
  return { start, end };
}

export async function fetchLedgerForExport(
  customerId: string,
  vendorId: string,
  from?: string,
  to?: string,
): Promise<LedgerExport> {
  const { start, end } = isoRange(from, to);

  // 1. Fetch all orders for this customer
  let ordersQuery = supabase
    .from("orders")
    .select(
      `id, bill_number, created_at, total_amount, amount_paid, balance_due, status, previous_balance,
       order_items ( id, product_name, quantity, rate, subtotal )`,
    )
    .eq("customer_id", customerId)
    .eq("vendor_id", vendorId)
    .order("created_at", { ascending: true });

  if (start) ordersQuery = ordersQuery.gte("created_at", start);
  if (end) ordersQuery = ordersQuery.lte("created_at", end);

  const { data: orders, error: ordersError } = await ordersQuery;
  if (ordersError) throw toApiError(ordersError);

  // 2. Fetch all payments for this customer
  let paymentsQuery = supabase
    .from("payments")
    .select(`id, amount, payment_mode, created_at`)
    .eq("customer_id", customerId)
    .eq("vendor_id", vendorId)
    .order("created_at", { ascending: true });

  if (start) paymentsQuery = paymentsQuery.gte("created_at", start);
  if (end) paymentsQuery = paymentsQuery.lte("created_at", end);

  const { data: payments, error: paymentsError } = await paymentsQuery;
  if (paymentsError) throw toApiError(paymentsError);

  // 3. Fetch customer + business info
  const [{ data: customer }, { data: profile }] = await Promise.all([
    supabase.from("parties").select("name, phone").eq("id", customerId).single(),
    supabase.from("profiles").select("business_name").eq("id", vendorId).single(),
  ]);

  // 4. Merge + sort entries by date
  type TxEntry = LedgerEntry & { _sort: number };
  const txEntries: TxEntry[] = [
    ...(orders ?? []).map((o: any) => ({
      id: o.id,
      date: o.created_at,
      description: o.bill_number
        ? `Bill #${o.bill_number}`
        : "Entry",
      amount: Number(o.total_amount ?? 0),
      status: o.status ?? "Pending",
      balance_after: Number(o.balance_due ?? 0),
      type: "bill" as const,
      bill_number: o.bill_number ?? undefined,
      items: (o.order_items ?? []).map((i: any) => ({
        product_name: i.product_name ?? "Item",
        quantity: Number(i.quantity ?? 1),
        rate: Number(i.rate ?? 0),
        subtotal: Number(i.subtotal ?? 0),
      })),
      _sort: new Date(o.created_at).getTime(),
    })),
    ...(payments ?? []).map((p: any) => ({
      id: p.id,
      date: p.created_at,
      description: `Payment${p.payment_mode ? ` (${p.payment_mode})` : ""}`,
      amount: Number(p.amount ?? 0),
      status: "Paid",
      balance_after: 0,
      type: "payment" as const,
      payment_mode: p.payment_mode ?? undefined,
      _sort: new Date(p.created_at).getTime(),
    })),
  ];

  txEntries.sort((a, b) => a._sort - b._sort);

  // 5. Calculate running balance
  let running = 0;
  const entries: LedgerEntry[] = txEntries.map((tx) => {
    if (tx.type === "bill") {
      running += tx.amount;
    } else {
      running -= tx.amount;
    }
    return { ...tx, balance_after: running };
  });

  return {
    customer_name: customer?.name ?? "Customer",
    customer_phone: customer?.phone ?? "",
    business_name: profile?.business_name ?? "Your Business",
    generated_at: new Date().toISOString(),
    date_from: from,
    date_to: to,
    opening_balance: 0,
    entries,
    closing_balance: running,
    total_bills: (orders ?? []).length,
    total_payments: (payments ?? []).length,
  };
}

export async function fetchLedgerCsvRows(
  customerId: string,
  vendorId: string,
  from?: string,
  to?: string,
): Promise<Record<string, unknown>[]> {
  const ledger = await fetchLedgerForExport(customerId, vendorId, from, to);

  return ledger.entries.map((entry) => ({
    date: entry.date ? entry.date.substring(0, 10) : "",
    description: entry.description,
    amount: entry.type === "bill" ? entry.amount : -entry.amount,
    status: entry.status,
    balance_after: entry.balance_after,
    type: entry.type,
  }));
}