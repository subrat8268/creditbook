import { CashFlowMonth } from "@/src/api/dashboard";
import Loader from "@/src/components/feedback/Loader";
import { useNetPositionReport } from "@/src/hooks/useDashboard";
import { buildNetPositionReportHtml } from "@/src/utils/netPositionReportPdf";
import { useAuthStore } from "@/src/store/authStore";
import {
  NET_POSITION_RANGE_OPTIONS,
  usePreferencesStore,
} from "@/src/store/preferencesStore";
import { formatINR } from "@/src/utils/dashboardUi";
import { colors, gradients, spacing } from "@/src/utils/theme";
import { LinearGradient } from "expo-linear-gradient";
import * as Print from "expo-print";
import { useRouter } from "expo-router";
import * as Sharing from "expo-sharing";
import {
  AlertTriangle,
  ArrowLeft,
  CalendarDays,
  Clock,
  Share2,
  Sparkles,
  TrendingUp,
} from "lucide-react-native";
import { useMemo, useState } from "react";
import {
  Alert,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

// ── avatar color helper ──────────────────────────────────
function avatarColor(name: string) {
  const idx =
    name.split("").reduce((a, c) => a + c.charCodeAt(0), 0) %
    colors.avatarPalette.length;
  const color = colors.avatarPalette[idx];
  return { bg: color + "22", text: color }; // Tinted bg, solid text
}

// ── Mini bar chart (View-based, no library) ──────────────
function CashFlowChart({ months }: { months: CashFlowMonth[] }) {
  const max = Math.max(...months.flatMap((m) => [m.inflow, m.outflow]), 1);
  const BAR_H = 120;

  return (
    <View>
      <View style={{ flexDirection: "row", alignItems: "flex-end", gap: 6 }}>
        {months.map((m) => {
          const inH = Math.round((m.inflow / max) * BAR_H);
          const outH = Math.round((m.outflow / max) * BAR_H);
          return (
            <View
              key={m.label}
              style={{ flex: 1, alignItems: "center", gap: 2 }}
            >
              {/* Stacked bars */}
              <View
                style={{
                  width: "100%",
                  height: BAR_H,
                  justifyContent: "flex-end",
                  gap: 2,
                }}
              >
                <View
                  style={{
                    height: inH || 4,
                    backgroundColor: colors.primary,
                    borderRadius: 3,
                    opacity: 0.9,
                  }}
                />
                <View
                  style={{
                    height: outH || 4,
                    backgroundColor: colors.danger,
                    borderRadius: 3,
                    opacity: 0.8,
                  }}
                />
              </View>
              <Text style={s.chartLabel}>{m.label}</Text>
            </View>
          );
        })}
      </View>
      {/* Legend */}
      <View style={{ flexDirection: "row", gap: 16, marginTop: 10 }}>
        <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
          <View
            style={{
              width: 10,
              height: 10,
              borderRadius: 5,
              backgroundColor: colors.primary,
            }}
          />
          <Text style={s.legendText}>Inflow</Text>
        </View>
        <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
          <View
            style={{
              width: 10,
              height: 10,
              borderRadius: 5,
              backgroundColor: colors.danger,
            }}
          />
          <Text style={s.legendText}>Outflow</Text>
        </View>
      </View>
    </View>
  );
}

// ── Customer/Supplier row ────────────────────────────────
function PersonRow({
  initials,
  name,
  amount,
  amountColor,
}: {
  initials: string;
  name: string;
  amount: number;
  amountColor: string;
}) {
  const { bg, text } = avatarColor(name);
  return (
    <View style={s.personRow}>
      <View style={[s.personAvatar, { backgroundColor: bg }]}>
        <Text style={[s.personInitials, { color: text }]}>{initials}</Text>
      </View>
      <Text style={s.personName} numberOfLines={1}>
        {name}
      </Text>
      <Text style={[s.personAmount, { color: amountColor }]}>
        {formatINR(amount)}
      </Text>
    </View>
  );
}

// ── Main Screen ──────────────────────────────────────────
export default function NetPositionScreen() {
  const { profile } = useAuthStore();
  const router = useRouter();
  const range = usePreferencesStore((s) => s.netPositionRange);
  const setRange = usePreferencesStore((s) => s.setNetPositionRange);
  const { data, isLoading, isFetching } = useNetPositionReport(
    profile?.id,
    range,
  );
  const [downloading, setDownloading] = useState(false);
  const selectedRangeLabel = useMemo(() => {
    return (
      NET_POSITION_RANGE_OPTIONS.find((opt) => opt.value === range)?.label ||
      "Last 30 days"
    );
  }, [range]);

  const handleDownloadPdf = async () => {
    if (!data) return;
    setDownloading(true);
    try {
      const html = buildNetPositionReportHtml(
        data,
        profile?.business_name ?? "My Business",
      );
      const { uri } = await Print.printToFileAsync({ html });
      await Sharing.shareAsync(uri, { mimeType: "application/pdf" });
    } catch {
      Alert.alert("Error", "Could not generate report. Please try again.");
    } finally {
      setDownloading(false);
    }
  };

  if (isLoading) return <Loader />;

  const report = data ?? {
    totalReceivables: 0,
    totalPayables: 0,
    netBalance: 0,
    topCustomers: [],
    topSuppliers: [],
    cashFlow: [],
    overdueCount: 0,
    upcomingPayables: 0,
  };

  const isPositive = report.netBalance >= 0;

  return (
    <SafeAreaView style={s.root} edges={["top", "left", "right"]}>
      <StatusBar barStyle="dark-content" backgroundColor={colors.background} />

      {/* ── Header ── */}
      <View style={s.header}>
        <TouchableOpacity
          onPress={() => router.back()}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        >
          <ArrowLeft size={22} color={colors.textPrimary} strokeWidth={1.75} />
        </TouchableOpacity>
        <Text style={s.headerTitle}>Net Position</Text>
        <TouchableOpacity hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
          <CalendarDays
            size={22}
            color={colors.textSecondary}
            strokeWidth={1.8}
          />
        </TouchableOpacity>
      </View>

      <ScrollView
        contentContainerStyle={s.scroll}
        showsVerticalScrollIndicator={false}
      >
        {/* ── Hero card ── */}
        <LinearGradient
          colors={[gradients.netPosition, gradients.netPosition]}
          style={s.heroCard}
        >
          <Text style={s.heroLabel}>YOUR NET POSITION</Text>
          <Text style={s.heroAmount}>
            {report.netBalance < 0 ? "−" : ""}
            {formatINR(Math.abs(report.netBalance))}
          </Text>
          <View style={s.heroSubRow}>
            <TrendingUp
              size={14}
              color={isPositive ? colors.paid.bg : "#FCA5A5"}
              strokeWidth={2}
            />
            <Text
              style={[s.heroSub, { color: isPositive ? colors.paid.bg : "#FCA5A5" }]}
            >
              {isPositive ? "Cash surplus available" : "Net liability position"}
            </Text>
          </View>
          <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8, marginTop: 12 }}>
            {NET_POSITION_RANGE_OPTIONS.map((option) => {
              const isActive = option.value === range;
              return (
                <TouchableOpacity
                  key={option.value}
                  onPress={() => setRange(option.value)}
                  activeOpacity={0.85}
                  style={{
                    paddingHorizontal: 14,
                    paddingVertical: 6,
                    borderRadius: 999,
                    borderWidth: 1,
                    borderColor: isActive ? colors.surface : "rgba(255,255,255,0.3)",
                    backgroundColor: isActive
                      ? "rgba(255,255,255,0.2)"
                      : "rgba(255,255,255,0.08)",
                  }}
                >
                  <Text
                    style={{
                      color: colors.surface,
                      fontWeight: isActive ? "700" : "600",
                    }}
                  >
                    {option.label.replace("Last ", "")}
                  </Text>
                </TouchableOpacity>
              );
            })}
            {isFetching && (
              <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
                <View style={{ width: 10, height: 10, borderRadius: 5, backgroundColor: "#fff" }} />
                <Text style={{ color: "#FFFFFF", opacity: 0.7, fontSize: 12 }}>
                  Updating…
                </Text>
              </View>
            )}
          </View>
          <Text style={{ marginTop: 8, color: "rgba(255,255,255,0.7)", fontSize: 12 }}>
            {selectedRangeLabel}
          </Text>
        </LinearGradient>

        {/* ── Breakdown ── */}
        <View style={s.card}>
          <Text style={s.sectionLabel}>BREAKDOWN</Text>
          <View style={s.breakdownRow}>
            <Text style={s.breakdownKey}>Total Receivables</Text>
            <Text style={[s.breakdownVal, { color: colors.primary }]}>
              +{formatINR(report.totalReceivables)}
            </Text>
          </View>
          <View style={[s.breakdownRow, s.breakdownDivider]}>
            <Text style={s.breakdownKey}>Total Payables</Text>
            <Text style={[s.breakdownVal, { color: colors.danger }]}>
              −{formatINR(report.totalPayables)}
            </Text>
          </View>
          <View style={[s.breakdownRow, { paddingTop: 12 }]}>
            <Text style={[s.breakdownKey, { fontWeight: "700" }]}>
              Net Balance
            </Text>
            <Text
              style={[
                s.breakdownVal,
                {
                  fontWeight: "800",
                  color: isPositive ? colors.textPrimary : colors.danger,
                },
              ]}
            >
              {formatINR(report.netBalance)}
            </Text>
          </View>
        </View>

        {/* ── Cash Flow Trend ── */}
        {report.cashFlow.length > 0 && (
          <View style={s.card}>
            <Text style={s.sectionLabel}>CASH FLOW TREND (LAST 6 MONTHS)</Text>
            <CashFlowChart months={report.cashFlow} />
          </View>
        )}

        {/* ── Top Customers Owed ── */}
        {report.topCustomers.length > 0 && (
          <View style={s.card}>
            <Text style={s.sectionLabel}>TOP CUSTOMERS OWED</Text>
            {report.topCustomers.map((c) => (
              <PersonRow
                key={c.id}
                initials={c.initials}
                name={c.name}
                amount={c.balance}
                amountColor={colors.primary}
              />
            ))}
          </View>
        )}

        {/* ── Top Suppliers Owed ── */}
        {report.topSuppliers.length > 0 && (
          <View style={s.card}>
            <Text style={s.sectionLabel}>TOP SUPPLIERS OWED</Text>
            {report.topSuppliers.map((sup) => (
              <PersonRow
                key={sup.id}
                initials={sup.initials}
                name={sup.name}
                amount={sup.amountOwed}
                amountColor={colors.danger}
              />
            ))}
          </View>
        )}

        {/* ── Quick Insights ── */}
        <View style={s.card}>
          <Text style={s.sectionLabel}>QUICK INSIGHTS</Text>
          <View style={s.insightRow}>
            {report.overdueCount > 0 && (
              <View style={[s.insightPill, { backgroundColor: colors.dangerBg }]}>
                <AlertTriangle
                  size={12}
                  color={colors.danger}
                  strokeWidth={2}
                />
                <Text style={[s.insightText, { color: colors.danger }]}>
                  High collection risk: {report.overdueCount} customer
                  {report.overdueCount !== 1 ? "s" : ""}
                </Text>
              </View>
            )}
            {report.upcomingPayables > 0 && (
              <View style={[s.insightPill, { backgroundColor: colors.warningBg }]}>
                <Clock size={12} color={colors.warning} strokeWidth={2} />
                <Text style={[s.insightText, { color: colors.warning }]}>
                  Upcoming payables: {formatINR(report.upcomingPayables)} this
                  week
                </Text>
              </View>
            )}
            <View style={[s.insightPill, { backgroundColor: colors.successBg }]}>
              <Sparkles size={12} color={colors.primary} strokeWidth={2} />
              <Text style={[s.insightText, { color: colors.primary }]}>
                {isPositive ? "Cash flow optimized" : "Review payables"}
              </Text>
            </View>
          </View>
        </View>

        {/* ── Download PDF ── */}
        <TouchableOpacity
          style={s.downloadBtn}
          onPress={handleDownloadPdf}
          activeOpacity={0.85}
          disabled={downloading}
        >
          <Share2 size={18} color={colors.surface} strokeWidth={2} />
          <Text style={s.downloadBtnText}>
            {downloading ? "Generating…" : "Download PDF Report"}
          </Text>
        </TouchableOpacity>

        <View style={{ height: 40 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

// ── Styles ───────────────────────────────────────────────
const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.background },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: spacing.lg,
    paddingVertical: 14,
    backgroundColor: colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  headerTitle: {
    fontSize: 17,
    fontWeight: "700",
    color: colors.textPrimary,
  },
  scroll: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.lg,
    gap: spacing.sm,
  },
  heroCard: {
    borderRadius: 20,
    padding: 24,
    marginBottom: 4,
  },
  heroLabel: {
    fontSize: 11,
    fontWeight: "700",
    letterSpacing: 1.1,
    color: "rgba(255,255,255,0.6)",
    marginBottom: 8,
  },
  heroAmount: {
    fontSize: 40,
    fontWeight: "800",
    color: colors.surface,
    letterSpacing: -0.5,
    marginBottom: 10,
  },
  heroSubRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  heroSub: {
    fontSize: 13,
    fontWeight: "500",
  },
  card: {
    backgroundColor: colors.surface,
    borderRadius: 18,
    padding: 18,
    shadowColor: colors.textPrimary,
    shadowOpacity: 0.04,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  sectionLabel: {
    fontSize: 11,
    fontWeight: "700",
    color: colors.textSecondary,
    letterSpacing: 0.9,
    marginBottom: 14,
  },
  breakdownRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 8,
  },
  breakdownDivider: {
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    paddingBottom: 12,
    marginBottom: 0,
  },
  breakdownKey: {
    fontSize: 14,
    color: colors.textPrimary,
    fontWeight: "500",
  },
  breakdownVal: {
    fontSize: 14,
    fontWeight: "700",
  },
  chartLabel: {
    fontSize: 10,
    color: colors.textSecondary,
    textAlign: "center",
    marginTop: 4,
  },
  legendText: {
    fontSize: 12,
    color: colors.textSecondary,
  },
  personRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 10,
    gap: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
  },
  personAvatar: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },
  personInitials: {
    fontSize: 13,
    fontWeight: "700",
  },
  personName: {
    flex: 1,
    fontSize: 14,
    fontWeight: "600",
    color: colors.textPrimary,
  },
  personAmount: {
    fontSize: 14,
    fontWeight: "700",
  },
  insightRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  insightPill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 20,
  },
  insightText: {
    fontSize: 12,
    fontWeight: "600",
  },
  downloadBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    backgroundColor: colors.textPrimary,
    borderRadius: 16,
    paddingVertical: 18,
    marginTop: 8,
  },
  downloadBtnText: {
    fontSize: 15,
    fontWeight: "700",
    color: colors.surface,
  },
});

