import { toApiError } from "@/src/lib/supabaseQuery";
import { supabase } from "@/src/services/supabase";

export interface RecentActivityItem {
  id: string;
  /** payment = money received from a person
   *  bill     = outstanding entry (invoice)
   *  delivery = legacy (supplier mode, out of strict single-mode) */
  type: "payment" | "bill" | "delivery";
  title: string;
  name: string;
  date: string;
  amount: number;
  status: "Paid" | "Pending" | "Overdue" | "Partially Paid";
}

export interface DashboardData {
  totalRevenue: number;
  outstandingAmount: number;
  /** Sum(balance_due) for entries past due_date */
  overdueOutstandingAmount: number;
  unpaidOrders: number;
  partialOrders: number;
  overdueCustomers: number;
  /** Top 5 overdue people sorted by total outstanding balance */
  overdueCustomersList: {
    id: string;
    name: string;
    phone: string;
    balance: number;
    daysSince: number;
  }[];
  // Net Position
  customersOweMe: number;
  iOweSuppliers: number;
  netPosition: number;
  /** Absolute ₹ change in outstanding orders vs prior 7-day window (for seller hero card) */
  weekDelta: number;
  /** Percentage change in net position vs same 7-day window last week (0 if no history) */
  weekDeltaPct: number;
  // Seller mode
  activeBuyers: number;
  // Distributor mode
  activeSuppliers: number;
  overduePayments: number;
  overdueSuppliersList: {
    id: string;
    name: string;
    phone?: string;
    amount: number;
    daysSince: number;
  }[];
  recentActivity: RecentActivityItem[];
  totalCustomersCount?: number;
  totalEntriesCount?: number;
}

type DashboardSummaryRow = {
  total_outstanding: number | string;
  total_overdue: number | string;
  overdue_customers_count: number;
  top_overdue_customers: {
    id: string;
    name: string;
    phone: string;
    balance: number;
    daysSince: number;
  }[];
  total_customers_count: number;
  total_entries_count: number;
};

async function getDashboardSummary(): Promise<DashboardSummaryRow | null> {
  const { data, error } = await supabase.rpc("get_dashboard_summary");
  if (error) throw toApiError(error);
  const row = Array.isArray(data) ? (data[0] as DashboardSummaryRow | undefined) : null;
  return row ?? null;
}

export async function getDashboardData(
  vendorId: string,
): Promise<DashboardData> {
  const summary = await getDashboardSummary();

  // Payments
  const { data: payments, error: payErr } = await supabase
    .from("payments")
    .select("amount")
    .eq("vendor_id", vendorId);

  if (payErr) throw toApiError(payErr);

  const totalRevenue =
    payments?.reduce((sum, p) => sum + Number(p.amount), 0) ?? 0;

  // Orders (include customer_id for active buyers count)
  const { data: orders, error: orderErr } = await supabase
    .from("orders")
    .select("customer_id, balance_due, status")
    .eq("vendor_id", vendorId);

  if (orderErr) throw toApiError(orderErr);

  if (!orders)
    return {
      totalRevenue,
      outstandingAmount: Number(summary?.total_outstanding ?? 0),
      overdueOutstandingAmount: Number(summary?.total_overdue ?? 0),
      unpaidOrders: 0,
      partialOrders: 0,
      overdueCustomers: summary?.overdue_customers_count ?? 0,
      overdueCustomersList: summary?.top_overdue_customers ?? [],
      customersOweMe: 0,
      iOweSuppliers: 0,
      netPosition: 0,
      weekDelta: 0,
      weekDeltaPct: 0,
      activeBuyers: 0,
      activeSuppliers: 0,
      overduePayments: 0,
      overdueSuppliersList: [],
      recentActivity: [],
      totalCustomersCount: summary?.total_customers_count ?? 0,
      totalEntriesCount: summary?.total_entries_count ?? 0,
    };

  const unpaidStatuses = ["pending", "unpaid"];
  const partialStatuses = ["partially paid", "partial"];

  const unpaidOrders = orders.filter((o) =>
    unpaidStatuses.includes((o.status ?? "").trim().toLowerCase()),
  ).length;
  const partialOrders = orders.filter((o) =>
    partialStatuses.includes((o.status ?? "").trim().toLowerCase()),
  ).length;

  const outstandingAmount = orders
    .filter((o) => unpaidStatuses.includes((o.status ?? "").toLowerCase()))
    .reduce((sum, o) => sum + Number(o.balance_due ?? 0), 0);

  // Active buyers = unique people with at least one order
  const activeBuyers = new Set(orders.map((o: any) => o.customer_id)).size;

  const overdueCustomers = summary?.overdue_customers_count ?? 0;
  const overdueCustomersList = summary?.top_overdue_customers ?? [];

  // Net Position — people owe me
  const peopleOweMe = orders
    .filter((o) => Number(o.balance_due ?? 0) > 0)
    .reduce((sum, o) => sum + Number(o.balance_due ?? 0), 0);

  // Strict single-mode: supplier payables are out of scope.
  // Keep legacy fields in the response shape as zeros/empty to avoid breaking consumers.
  const iOweSuppliers = 0;
  const netPosition = peopleOweMe;
  const activeSuppliers = 0;
  const overdueSuppliersList: DashboardData["overdueSuppliersList"] = [];
  const overduePayments = 0;

  // Recent activity — last 8 Entries/Payments only (strict single-mode)
  const { data: recentOrders } = await supabase
    .from("orders")
    .select(
      "id, bill_number, total_amount, amount_paid, balance_due, status, created_at, due_date, parties(name)",
    )
    .eq("vendor_id", vendorId)
    .order("created_at", { ascending: false })
    .limit(8);

  const orderItems: RecentActivityItem[] = (recentOrders ?? []).map(
    (o: any) => {
      const personName: string = o.parties?.name ?? "Unknown";
      const isPaid =
        (o.status ?? "").toLowerCase() === "paid" ||
        Number(o.balance_due) === 0;
      const isPartial = (o.status ?? "").toLowerCase().includes("partial");
      const isOverdue =
        !isPaid &&
        Number(o.balance_due) > 0 &&
        o.due_date &&
        new Date(o.due_date) < new Date();

      const resolvedStatus: RecentActivityItem["status"] = isPaid
        ? "Paid"
        : isOverdue
          ? "Overdue"
          : isPartial
            ? "Partially Paid"
            : "Pending";

      return {
        id: o.id,
        type: isPaid ? "payment" : "bill",
        name: personName,
        title: isPaid
          ? `Payment from ${personName}`
          : o.bill_number
            ? `Bill #${o.bill_number}`
            : `Bill for ${personName}`,
        date: o.created_at,
        amount: isPaid ? Number(o.amount_paid) : Number(o.total_amount),
        status: resolvedStatus,
      };
    },
  );

  // Sort by date descending, cap at 8 items for the feed
  const recentActivity: RecentActivityItem[] = [...orderItems]
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 8);

  // Week-over-week net position delta (percentage)
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
  const fourteenDaysAgo = new Date();
  fourteenDaysAgo.setDate(fourteenDaysAgo.getDate() - 14);

  const [{ data: thisWeekOrders }, { data: lastWeekOrders }] =
    await Promise.all([
      supabase
        .from("orders")
        .select("balance_due")
        .eq("vendor_id", vendorId)
        .gt("balance_due", 0)
        .gte("created_at", sevenDaysAgo.toISOString()),
      supabase
        .from("orders")
        .select("balance_due")
        .eq("vendor_id", vendorId)
        .gt("balance_due", 0)
        .gte("created_at", fourteenDaysAgo.toISOString())
        .lt("created_at", sevenDaysAgo.toISOString()),
    ]);

  const thisWeekTotal = (thisWeekOrders ?? []).reduce(
    (s, o) => s + Number(o.balance_due),
    0,
  );
  const lastWeekTotal = (lastWeekOrders ?? []).reduce(
    (s, o) => s + Number(o.balance_due),
    0,
  );
  const weekDeltaPct =
    lastWeekTotal > 0
      ? Math.round(((thisWeekTotal - lastWeekTotal) / lastWeekTotal) * 100)
      : 0;
  const weekDelta = thisWeekTotal - lastWeekTotal;

  return {
    totalRevenue,
    outstandingAmount: Number(summary?.total_outstanding ?? outstandingAmount),
    overdueOutstandingAmount: Number(summary?.total_overdue ?? 0),
    unpaidOrders,
    partialOrders,
    overdueCustomers,
    overdueCustomersList,
    customersOweMe: peopleOweMe,
    iOweSuppliers,
    netPosition,
    weekDelta,
    weekDeltaPct,
    activeBuyers,
    activeSuppliers,
    overduePayments,
    overdueSuppliersList,
    recentActivity,
    totalCustomersCount: summary?.total_customers_count ?? 0,
    totalEntriesCount: summary?.total_entries_count ?? 0,
  };
}

// ── Net Position Report ───────────────────────────────────────────────────────

export interface NetPositionCustomer {
  id: string;
  name: string;
  initials: string;
  balance: number;
}

export interface NetPositionSupplier {
  id: string;
  name: string;
  initials: string;
  amountOwed: number;
}

export interface CashFlowMonth {
  /** "Jan", "Feb", etc. */
  label: string;
  inflow: number;
  outflow: number;
}

export interface NetPositionReport {
  totalReceivables: number;
  totalPayables: number;
  netBalance: number;
  topCustomers: NetPositionCustomer[];
  topSuppliers: NetPositionSupplier[];
  cashFlow: CashFlowMonth[];
  overdueCount: number;
  upcomingPayables: number;
}

function getInitials(name: string): string {
  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase() ?? "")
    .join("");
}

export async function getNetPositionReport(
  vendorId: string,
  rangeDays = 30,
): Promise<NetPositionReport> {
  const now = new Date();

  const rangeStart = new Date(now);
  rangeStart.setDate(rangeStart.getDate() - Math.max(rangeDays - 1, 0));
  rangeStart.setHours(0, 0, 0, 0);

  const [{ data: orders }, { data: paymentsReceived }] = await Promise.all([
    supabase
      .from("orders")
      .select("customer_id, balance_due, status, created_at, parties!inner(id, name)")
      .eq("vendor_id", vendorId)
      .gt("balance_due", 0)
      .gte("created_at", rangeStart.toISOString()),
    supabase
      .from("payments")
      .select("amount, created_at")
      .eq("vendor_id", vendorId)
      .gte("created_at", rangeStart.toISOString()),
  ]);

  // Total receivables (people owe me)
  const totalReceivables = (orders ?? []).reduce(
    (s, o) => s + Number(o.balance_due),
    0,
  );

  // Strict single-mode: supplier payables are out of scope.
  const totalPayables = 0;
  const netBalance = totalReceivables;

  // Top 5 people by balance owed
  const personMap = new Map<string, { name: string; balance: number }>();
  for (const order of orders ?? []) {
    const cid: string = (order as any).customer_id;
    const name: string = Array.isArray((order as any).parties)
      ? (order as any).parties[0]?.name ?? "Unknown"
      : (order as any).parties?.name ?? "Unknown";
    const existing = personMap.get(cid);
    if (existing) {
      existing.balance += Number(order.balance_due);
    } else {
      personMap.set(cid, { name, balance: Number(order.balance_due) });
    }
  }
  const topCustomers: NetPositionCustomer[] = Array.from(personMap.entries())
    .sort((a, b) => b[1].balance - a[1].balance)
    .slice(0, 5)
    .map(([id, { name, balance }]) => ({
      id,
      name,
      initials: getInitials(name),
      balance,
    }));

  const topSuppliers: NetPositionSupplier[] = [];

  const bucketCount = 6;
  const bucketSize = Math.max(1, Math.ceil(rangeDays / bucketCount));
  const cashFlow: CashFlowMonth[] = [];

  for (let i = 0; i < bucketCount; i++) {
    const bucketStart = new Date(rangeStart);
    bucketStart.setDate(rangeStart.getDate() + i * bucketSize);
    if (bucketStart > now) break;
    const bucketEnd = new Date(bucketStart);
    bucketEnd.setDate(bucketStart.getDate() + bucketSize);

    const inflow = (paymentsReceived ?? [])
      .filter((p) => {
        const pd = new Date(p.created_at);
        return pd >= bucketStart && pd < bucketEnd;
      })
      .reduce((s, p) => s + Number(p.amount), 0);

    const outflow = 0;

    const label = bucketSize <= 1
      ? bucketStart.toLocaleDateString("en-IN", { day: "numeric", month: "short" })
      : bucketStart.toLocaleDateString("en-IN", { month: "short", day: "numeric" });

    cashFlow.push({ label, inflow, outflow });
  }

  // Quick insights
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
  const overdueCount = new Set(
    (orders ?? [])
      .filter((o: any) => {
        const st = (o.status ?? "").toLowerCase();
        return st !== "paid" && Number(o.balance_due) > 0;
      })
      .map((o: any) => o.customer_id),
  ).size;

  const sevenDaysFromNow = new Date();
  sevenDaysFromNow.setDate(sevenDaysFromNow.getDate() + 7);
  const upcomingPayables = 0;

  return {
    totalReceivables,
    totalPayables,
    netBalance,
    topCustomers,
    topSuppliers,
    cashFlow,
    overdueCount,
    upcomingPayables,
  };
}

export async function exportNetPositionReport(
  vendorId: string,
  rangeDays: number,
) {
  const { data, error } = await supabase.functions.invoke(
    "net-position-export",
    {
      body: { vendorId, rangeDays },
    },
  );

  if (error) throw toApiError(error);

  return data as {
    pdfBase64: string;
    fileName?: string;
  };
}
