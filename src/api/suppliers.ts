import { supabase } from "../services/supabase";
import {
  Supplier,
  SupplierDelivery,
  SupplierDeliveryItem,
  SupplierDetail,
  SupplierTimelineEntry,
} from "../types/supplier";

export const PAGE_SIZE = 10;

// ─── Suppliers ───────────────────────────────────────────────────────────────

export async function fetchSuppliers(
  pageParam: number,
  vendorId: string,
  search?: string,
): Promise<Supplier[]> {
  let query = supabase
    .from("suppliers")
    .select("*")
    .eq("vendor_id", vendorId)
    .order("created_at", { ascending: false })
    .range(pageParam * PAGE_SIZE, pageParam * PAGE_SIZE + PAGE_SIZE - 1);

  if (search) {
    query = query.or(`name.ilike.%${search}%,phone.ilike.%${search}%`);
  }

  const { data, error } = await query;
  if (error) throw error;

  const suppliers = (data ?? []) as Supplier[];
  if (suppliers.length === 0) return suppliers;

  const ids = suppliers.map((s) => s.id);

  const [{ data: deliveries }, { data: payments }] = await Promise.all([
    supabase
      .from("supplier_deliveries")
      .select("supplier_id, total_amount, delivery_date")
      .eq("vendor_id", vendorId)
      .in("supplier_id", ids),
    supabase
      .from("payments_made")
      .select("supplier_id, amount")
      .eq("vendor_id", vendorId)
      .in("supplier_id", ids),
  ]);

  const totals: Record<string, number> = {};
  const paid: Record<string, number> = {};
  const lastDelivery: Record<string, string> = {};

  for (const d of deliveries ?? []) {
    totals[d.supplier_id] =
      (totals[d.supplier_id] ?? 0) + Number(d.total_amount);
    // Track most-recent delivery date per supplier
    if (
      !lastDelivery[d.supplier_id] ||
      d.delivery_date > lastDelivery[d.supplier_id]
    ) {
      lastDelivery[d.supplier_id] = d.delivery_date;
    }
  }
  for (const p of payments ?? []) {
    paid[p.supplier_id] = (paid[p.supplier_id] ?? 0) + Number(p.amount);
  }

  return suppliers
    .map((s) => ({
      ...s,
      balanceOwed: Math.max(0, (totals[s.id] ?? 0) - (paid[s.id] ?? 0)),
      lastDeliveryAt: lastDelivery[s.id] ?? undefined,
    }))
    .sort((a, b) => (b.balanceOwed ?? 0) - (a.balanceOwed ?? 0)); // highest owed first
}

export async function addSupplier(
  vendorId: string,
  values: Omit<Supplier, "id" | "vendor_id" | "created_at" | "balanceOwed">,
): Promise<Supplier> {
  const { data, error } = await supabase
    .from("suppliers")
    .insert([{ ...values, vendor_id: vendorId }])
    .select()
    .single();
  if (error) throw error;
  return data as Supplier;
}

export async function fetchSupplierDetail(
  supplierId: string,
): Promise<SupplierDetail | null> {
  const { data: supplier, error: sErr } = await supabase
    .from("suppliers")
    .select("*")
    .eq("id", supplierId)
    .maybeSingle();

  if (sErr || !supplier) return null;

  const { data: deliveries, error: dErr } = await supabase
    .from("supplier_deliveries")
    .select("*, supplier_delivery_items(*)")
    .eq("supplier_id", supplierId)
    .order("delivery_date", { ascending: false });

  if (dErr) return null;

  const { data: paymentsMade } = await supabase
    .from("payments_made")
    .select("id, amount, payment_mode, notes, created_at")
    .eq("supplier_id", supplierId)
    .order("created_at", { ascending: true });

  const totalDelivered = (deliveries ?? []).reduce(
    (s, d) => s + Number(d.total_amount),
    0,
  );
  const totalPaid = (paymentsMade ?? []).reduce(
    (s, p) => s + Number(p.amount),
    0,
  );
  const totalOwed = Math.max(0, totalDelivered - totalPaid);

  const mappedDeliveries: SupplierDelivery[] = (deliveries ?? []).map((d) => ({
    ...(d as SupplierDelivery),
    items: (d.supplier_delivery_items ?? []) as SupplierDeliveryItem[],
  }));

  // ── Build unified timeline with running balance ───────────────────────────
  type RawEvent = {
    id: string;
    type: "delivery" | "payment";
    date: string;
    delta: number; // +delivery amount, -payment amount
    delivery?: SupplierDelivery;
    paymentAmount?: number;
    paymentMode?: string;
    paymentNotes?: string;
  };

  const events: RawEvent[] = [
    ...mappedDeliveries.map((d) => ({
      id: d.id,
      type: "delivery" as const,
      date: d.delivery_date,
      delta: Number(d.total_amount),
      delivery: d,
    })),
    ...(paymentsMade ?? []).map((p) => ({
      id: p.id,
      type: "payment" as const,
      date: p.created_at,
      delta: -Number(p.amount),
      paymentAmount: Number(p.amount),
      paymentMode: p.payment_mode,
      paymentNotes: p.notes ?? undefined,
    })),
  ];

  // Sort ascending → compute running balance → reverse for newest-first display
  events.sort((a, b) => a.date.localeCompare(b.date));
  let running = 0;
  let dIdx = 0;
  const timeline: SupplierTimelineEntry[] = events.map((ev) => {
    running += ev.delta;
    const entry: SupplierTimelineEntry = {
      id: ev.id,
      type: ev.type,
      date: ev.date,
      runningBalance: Math.max(0, running),
      delivery: ev.delivery,
      paymentAmount: ev.paymentAmount,
      paymentMode: ev.paymentMode,
      paymentNotes: ev.paymentNotes,
    };
    if (ev.type === "delivery") {
      dIdx += 1;
      entry.deliveryNumber = dIdx;
    }
    return entry;
  });
  timeline.reverse();

  return {
    ...(supplier as Supplier),
    balanceOwed: totalOwed,
    totalOwed,
    deliveries: mappedDeliveries,
    timeline,
  };
}

// ─── Deliveries ───────────────────────────────────────────────────────────────

export interface RecordDeliveryInput {
  delivery_date: string;
  loading_charge: number;
  advance_paid: number;
  notes?: string;
  items: { item_name: string; quantity: number; rate: number }[];
}

export async function recordDelivery(
  vendorId: string,
  supplierId: string,
  delivery: RecordDeliveryInput,
): Promise<void> {
  const itemsSubtotal = delivery.items.reduce(
    (s, i) => s + i.quantity * i.rate,
    0,
  );
  const total_amount = itemsSubtotal + delivery.loading_charge;

  const { data: deliveryRow, error: dErr } = await supabase
    .from("supplier_deliveries")
    .insert([
      {
        vendor_id: vendorId,
        supplier_id: supplierId,
        delivery_date: delivery.delivery_date,
        loading_charge: delivery.loading_charge,
        advance_paid: delivery.advance_paid,
        total_amount,
        notes: delivery.notes ?? "",
      },
    ])
    .select("id")
    .single();

  if (dErr) throw new Error(dErr.message);

  if (delivery.items.length > 0) {
    const itemRows = delivery.items.map((i) => ({
      delivery_id: deliveryRow.id,
      vendor_id: vendorId,
      item_name: i.item_name,
      quantity: i.quantity,
      rate: i.rate,
    }));
    const { error: iErr } = await supabase
      .from("supplier_delivery_items")
      .insert(itemRows);
    if (iErr) throw new Error(iErr.message);
  }

  // Record advance as a payment_made entry
  if (delivery.advance_paid > 0) {
    const { error: pErr } = await supabase.from("payments_made").insert([
      {
        vendor_id: vendorId,
        supplier_id: supplierId,
        delivery_id: deliveryRow.id,
        amount: delivery.advance_paid,
        payment_mode: "Cash",
        notes: "Advance paid at delivery",
      },
    ]);
    if (pErr) throw new Error(pErr.message);
  }
}

export async function recordPaymentMade(
  vendorId: string,
  supplierId: string,
  amount: number,
  payment_mode: string,
  notes?: string,
): Promise<void> {
  const { error } = await supabase.from("payments_made").insert([
    {
      vendor_id: vendorId,
      supplier_id: supplierId,
      amount,
      payment_mode,
      notes: notes ?? "",
    },
  ]);
  if (error) throw new Error(error.message);
}
