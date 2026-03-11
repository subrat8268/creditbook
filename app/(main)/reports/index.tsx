import { useDashboard } from "@/src/hooks/useDashboard";
import { useAuthStore } from "@/src/store/authStore";
import { formatINR } from "@/src/utils/dashboardUi";
import { colors } from "@/src/utils/theme";
import { useRouter } from "expo-router";
import {
  Activity,
  AlertTriangle,
  CalendarDays,
  CheckCircle2,
  ChevronRight,
  CircleAlert,
  Download,
  FileText,
  Info,
  Truck,
  Users,
} from "lucide-react-native";
import {
  ActivityIndicator,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

// ── Helper ────────────────────────────────────────────────
function todayLabel() {
  const now = new Date();
  const day = now.getDate();
  const month = now.toLocaleString("en-IN", { month: "short" }).toUpperCase();
  const year = now.getFullYear();
  return `AS OF TODAY, ${day} ${month} ${year}`;
}

// ── Sub-components ────────────────────────────────────────

/** Large solid-color stat card matching screenshot */
function StatCard({
  label,
  amount,
  subtitle,
  icon,
  bg,
  onPress,
}: {
  label: string;
  amount: string;
  subtitle: string;
  icon: React.ReactNode;
  bg: string;
  onPress?: () => void;
}) {
  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={onPress ? 0.85 : 1}
      style={[s.statCard, { backgroundColor: bg }]}
    >
      {/* Top row */}
      <View style={s.statCardTop}>
        <Text style={s.statCardLabel}>{label}</Text>
        {icon}
      </View>
      {/* Amount */}
      <Text style={s.statCardAmount}>{amount}</Text>
      {/* Divider */}
      <View style={s.statCardDivider} />
      {/* Subtitle row */}
      <View style={s.statCardBottom}>
        <Text style={s.statCardSub}>{subtitle}</Text>
        {onPress && (
          <ChevronRight
            size={18}
            color="rgba(255,255,255,0.8)"
            strokeWidth={2}
          />
        )}
      </View>
    </TouchableOpacity>
  );
}

/** Dark "Net Position" card */
function NetCard({ amount, formula }: { amount: string; formula: string }) {
  return (
    <View style={s.netCard}>
      {/* Top row */}
      <View style={s.statCardTop}>
        <Text style={s.netLabel}>NET POSITION</Text>
        <Activity size={20} color="rgba(255,255,255,0.55)" strokeWidth={2} />
      </View>
      {/* Amount */}
      <Text style={s.netAmount}>{amount}</Text>
      {/* Divider */}
      <View
        style={[s.statCardDivider, { borderColor: "rgba(255,255,255,0.1)" }]}
      />
      {/* Formula row */}
      <View style={s.statCardBottom}>
        <Text style={s.netFormula}>{formula}</Text>
        <Info size={16} color="rgba(255,255,255,0.45)" strokeWidth={2} />
      </View>
    </View>
  );
}

/** Quick insight pill badge */
function InsightPill({
  icon,
  label,
  bg,
  textColor,
}: {
  icon: React.ReactNode;
  label: string;
  bg: string;
  textColor: string;
}) {
  return (
    <View style={[s.pill, { backgroundColor: bg }]}>
      {icon}
      <Text style={[s.pillText, { color: textColor }]}>{label}</Text>
    </View>
  );
}

// ── Screen ────────────────────────────────────────────────
export default function FinancialPositionScreen() {
  const { profile } = useAuthStore();
  const { data, isLoading, isError } = useDashboard(profile?.id);
  const router = useRouter();

  const customersOweMe = data?.customersOweMe ?? 0;
  const iOweSuppliers = data?.iOweSuppliers ?? 0;
  const netPos = customersOweMe - iOweSuppliers;
  const activeBuyers = data?.activeBuyers ?? 0;
  const activeSuppliers = data?.activeSuppliers ?? 0;
  const overdueCustomers = data?.overdueCustomers ?? 0;

  // Derive collection rate: (totalRevenue / (totalRevenue + outstandingAmount)) * 100
  const totalRevenue = data?.totalRevenue ?? 0;
  const outstandingAmount = data?.outstandingAmount ?? 0;
  const collectionRate =
    totalRevenue + outstandingAmount > 0
      ? Math.round((totalRevenue / (totalRevenue + outstandingAmount)) * 100)
      : 0;

  return (
    <SafeAreaView style={s.root} edges={["top", "left", "right"]}>
      <StatusBar barStyle="dark-content" backgroundColor={colors.neutral.bg} />

      {/* ── Header ── */}
      <View style={s.header}>
        <View>
          <Text style={s.headerTitle}>Financial Position</Text>
          <Text style={s.headerSub}>{todayLabel()}</Text>
        </View>
        <TouchableOpacity hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
          <CalendarDays
            size={22}
            color={colors.neutral[600]}
            strokeWidth={1.8}
          />
        </TouchableOpacity>
      </View>

      {/* ── Body ── */}
      {isLoading ? (
        <View style={s.center}>
          <ActivityIndicator size="large" color={colors.primary.DEFAULT} />
        </View>
      ) : isError || !data ? (
        <View style={s.center}>
          <Text style={s.errorText}>Could not load data. Pull to refresh.</Text>
        </View>
      ) : (
        <ScrollView
          contentContainerStyle={s.scroll}
          showsVerticalScrollIndicator={false}
        >
          {/* ── Customers Owe Me ── */}
          <StatCard
            label="CUSTOMERS OWE ME"
            amount={formatINR(customersOweMe)}
            subtitle={`${activeBuyers} active · ${overdueCustomers} overdue`}
            bg={colors.primary.DEFAULT}
            icon={
              <Users
                size={20}
                color="rgba(255,255,255,0.75)"
                strokeWidth={1.8}
              />
            }
            onPress={() => router.push("/(main)/customers")}
          />

          {/* ── I Owe Suppliers ── */}
          <StatCard
            label="I OWE SUPPLIERS"
            amount={formatINR(iOweSuppliers)}
            subtitle={`${activeSuppliers} supplier${activeSuppliers !== 1 ? "s" : ""}`}
            bg="#E0336E"
            icon={
              <Truck
                size={20}
                color="rgba(255,255,255,0.75)"
                strokeWidth={1.8}
              />
            }
            onPress={() => router.push("/(main)/suppliers")}
          />

          {/* ── Net Position ── */}
          <NetCard
            amount={formatINR(netPos)}
            formula={`${formatINR(customersOweMe)} – ${formatINR(iOweSuppliers)}`}
          />

          {/* ── Quick Insights ── */}
          <View style={s.sectionHeader}>
            <Text style={s.sectionLabel}>QUICK INSIGHTS</Text>
          </View>

          <View style={s.pillGroup}>
            {overdueCustomers > 0 && (
              <InsightPill
                icon={
                  <CircleAlert
                    size={14}
                    color={colors.danger.DEFAULT}
                    strokeWidth={2}
                  />
                }
                label={`${overdueCustomers} overdue customer${overdueCustomers !== 1 ? "s" : ""}`}
                bg={colors.danger.light}
                textColor={colors.danger.DEFAULT}
              />
            )}
            {iOweSuppliers > 0 && (
              <InsightPill
                icon={
                  <AlertTriangle
                    size={14}
                    color={colors.warning.dark}
                    strokeWidth={2}
                  />
                }
                label={`Largest debt: ₹${Math.round(iOweSuppliers / 1000)}K`}
                bg={colors.warning.light}
                textColor={colors.warning.dark}
              />
            )}
            {collectionRate > 0 && (
              <InsightPill
                icon={
                  <CheckCircle2
                    size={14}
                    color={colors.primary.dark}
                    strokeWidth={2}
                  />
                }
                label={`Collection rate: ${collectionRate}%`}
                bg={colors.primary.light}
                textColor={colors.primary.dark}
              />
            )}
          </View>

          {/* ── Monthly Report card ── */}
          <View style={s.reportCard}>
            {/* PDF icon */}
            <View style={s.reportIconBox}>
              <FileText
                size={22}
                color={colors.primary.DEFAULT}
                strokeWidth={1.8}
              />
            </View>
            {/* Meta */}
            <View style={s.reportMeta}>
              <Text style={s.reportTitle}>Monthly Financial Report</Text>
              <Text style={s.reportSub}>
                {new Date().toLocaleString("en-IN", {
                  month: "long",
                  year: "numeric",
                })}{" "}
                • PDF
              </Text>
            </View>
            {/* Download button */}
            <TouchableOpacity activeOpacity={0.8} style={s.downloadBtn}>
              <Download size={18} color="#fff" strokeWidth={2} />
            </TouchableOpacity>
          </View>

          <View style={{ height: 32 }} />
        </ScrollView>
      )}
    </SafeAreaView>
  );
}

// ── Styles ────────────────────────────────────────────────
const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.neutral.bg },
  header: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingBottom: 16,
    paddingTop: 8,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: "800",
    color: colors.neutral[900],
    marginBottom: 2,
  },
  headerSub: {
    fontSize: 11,
    fontWeight: "600",
    letterSpacing: 0.8,
    color: colors.neutral[400],
  },
  center: { flex: 1, alignItems: "center", justifyContent: "center" },
  errorText: { fontSize: 14, color: colors.neutral[400] },
  scroll: { paddingHorizontal: 16, gap: 12, paddingBottom: 24 },

  // ── StatCard ──
  statCard: {
    borderRadius: 20,
    paddingHorizontal: 22,
    paddingVertical: 20,
  },
  statCardTop: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 10,
  },
  statCardLabel: {
    fontSize: 11,
    fontWeight: "700",
    letterSpacing: 1.1,
    color: "rgba(255,255,255,0.8)",
  },
  statCardAmount: {
    fontSize: 36,
    fontWeight: "800",
    color: "#FFFFFF",
    letterSpacing: -0.5,
    marginBottom: 14,
  },
  statCardDivider: {
    borderTopWidth: 1,
    borderColor: "rgba(255,255,255,0.25)",
    marginBottom: 12,
  },
  statCardBottom: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  statCardSub: {
    fontSize: 13,
    color: "rgba(255,255,255,0.85)",
    fontWeight: "500",
  },

  // ── NetCard ──
  netCard: {
    borderRadius: 20,
    paddingHorizontal: 22,
    paddingVertical: 20,
    backgroundColor: "#1C2333",
  },
  netLabel: {
    fontSize: 11,
    fontWeight: "700",
    letterSpacing: 1.1,
    color: "rgba(255,255,255,0.5)",
  },
  netAmount: {
    fontSize: 36,
    fontWeight: "800",
    color: "#FFFFFF",
    letterSpacing: -0.5,
    marginBottom: 14,
  },
  netFormula: {
    fontSize: 13,
    color: "rgba(255,255,255,0.55)",
    fontWeight: "500",
  },

  // ── Quick Insights ──
  sectionHeader: { marginTop: 4, marginBottom: 0 },
  sectionLabel: {
    fontSize: 11,
    fontWeight: "700",
    letterSpacing: 1.1,
    color: colors.neutral[400],
  },
  pillGroup: { flexDirection: "column", gap: 8 },
  pill: {
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "flex-start",
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 9,
    borderRadius: 50,
  },
  pillText: { fontSize: 13, fontWeight: "600" },

  // ── Report card ──
  reportCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.white,
    borderRadius: 16,
    padding: 16,
    gap: 14,
    borderWidth: 1,
    borderColor: colors.neutral[100],
  },
  reportIconBox: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: colors.primary.light,
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },
  reportMeta: { flex: 1 },
  reportTitle: {
    fontSize: 14,
    fontWeight: "700",
    color: colors.neutral[900],
    marginBottom: 3,
  },
  reportSub: { fontSize: 12, color: colors.neutral[400] },
  downloadBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.primary.DEFAULT,
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },
});
