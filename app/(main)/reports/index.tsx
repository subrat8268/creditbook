import { useDashboard } from "@/src/hooks/useDashboard";
import { useAuthStore } from "@/src/store/authStore";
import { formatINR } from "@/src/utils/dashboardUi";
import { colors, gradients, spacing } from "@/src/utils/theme";
import { useRouter } from "expo-router";
import {
    Activity,
    CalendarDays,
    ChevronRight,
    Download,
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

  return (
    <SafeAreaView style={s.root} edges={["top", "left", "right"]}>
      <StatusBar barStyle="dark-content" backgroundColor={colors.background} />

      {/* ── Header ── */}
      <View style={s.header}>
        <View>
          <Text style={s.headerTitle}>Financial Position</Text>
          <Text style={s.headerSub}>{todayLabel()}</Text>
        </View>
        <TouchableOpacity hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
          <CalendarDays
            size={22}
            color={colors.textSecondary}
            strokeWidth={1.8}
          />
        </TouchableOpacity>
      </View>

      {/* ── Body ── */}
      {isLoading ? (
        <View style={s.center}>
          <ActivityIndicator size="large" color={colors.primary} />
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
            bg={colors.primary}
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
            bg={colors.supplierPrimary}
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

          {/* ── Export Data entry point ── */}
          <TouchableOpacity
            onPress={() => router.push("/(main)/export" as any)}
            activeOpacity={0.85}
            style={[s.exportRow, { backgroundColor: colors.surface }]}
          >
            <View style={s.exportRowLeft}>
              <View style={s.exportIconBox}>
                <Download
                  size={18}
                  color={colors.primaryDark}
                  strokeWidth={1.8}
                />
              </View>
              <View>
                <Text style={s.exportRowTitle}>Export Data</Text>
                <Text style={s.exportRowSub}>
                  Download CSV for orders, payments &amp; more
                </Text>
              </View>
            </View>
            <ChevronRight
              size={18}
              color={colors.textSecondary}
              strokeWidth={1.8}
            />
          </TouchableOpacity>

          <View style={{ height: 32 }} />
        </ScrollView>
      )}
    </SafeAreaView>
  );
}

// ── Styles ────────────────────────────────────────────────
const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.background },
  header: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    paddingHorizontal: spacing.lg,
    paddingBottom: 16,
    paddingTop: 8,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: "800",
    color: colors.textPrimary,
    marginBottom: 2,
  },
  headerSub: {
    fontSize: 11,
    fontWeight: "600",
    letterSpacing: 0.8,
    color: colors.textSecondary,
  },
  center: { flex: 1, alignItems: "center", justifyContent: "center" },
  errorText: { fontSize: 14, color: colors.textSecondary },
  scroll: { paddingHorizontal: spacing.lg, gap: spacing.sm, paddingBottom: 24 },

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
    color: colors.surface,
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
    backgroundColor: gradients.netPosition,
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
    color: colors.surface,
    letterSpacing: -0.5,
    marginBottom: 14,
  },
  netFormula: {
    fontSize: 13,
    color: "rgba(255,255,255,0.55)",
    fontWeight: "500",
  },

  // ── Export row ──
  exportRow: {
    borderRadius: 16,
    paddingHorizontal: spacing.lg,
    paddingVertical: 14,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  exportRowLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    flex: 1,
  },
  exportIconBox: {
    width: 38,
    height: 38,
    borderRadius: 10,
    backgroundColor: colors.paid.bg,
    alignItems: "center",
    justifyContent: "center",
  },
  exportRowTitle: {
    fontSize: 15,
    fontWeight: "700",
    color: colors.textPrimary,
    marginBottom: 2,
  },
  exportRowSub: {
    fontSize: 12,
    color: colors.textSecondary,
  },
});
