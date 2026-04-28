import { toApiError } from "../lib/supabaseQuery";
import { supabase } from "../services/supabase";
import type { OverdueReminder } from "../lib/notifications";

export async function fetchOverdueReminders(
  vendorId: string,
): Promise<OverdueReminder[]> {
  const { data, error } = await supabase
    .from("orders")
    .select(
      `id, balance_due, due_date, created_at,
       customer_id,
       parties!inner(id, name)`,
    )
    .eq("vendor_id", vendorId)
    .gt("balance_due", 0)
    .lte("due_date", new Date().toISOString())
    .neq("status", "Paid");

  if (error) throw toApiError(error);

  if (!data || data.length === 0) return [];

  const { data: customers } = await supabase
    .from("parties")
    .select("id, name")
    .eq("vendor_id", vendorId)
    .eq("is_customer", true);

  const customerMap = new Map((customers ?? []).map((c: any) => [c.id, c]));

  type OrderRow = {
    id: string;
    balance_due: number;
    due_date: string;
    created_at: string;
    customer_id: string;
    parties: any;
  };

  const seen = new Set<string>();
  const reminders: OverdueReminder[] = [];

  for (const row of data as unknown as OrderRow[]) {
    if (seen.has(row.customer_id)) continue;
    seen.add(row.customer_id);

    const party = Array.isArray(row.parties)
      ? row.parties[0]
      : row.parties;

    const daysSince = Math.floor(
      (Date.now() - new Date(row.due_date).getTime()) / 86_400_000,
    );

    reminders.push({
      customerId: row.customer_id,
      customerName: party?.name ?? "Customer",
      balance: Number(row.balance_due ?? 0),
      daysSince: Math.max(1, daysSince),
    });
  }

  return reminders.sort((a, b) => b.balance - a.balance);
}