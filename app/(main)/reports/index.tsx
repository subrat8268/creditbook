/**
 * Financial Position Screen
 *
 * Shows a clear breakdown of:
 *  - Total Customers Owe Me (receivables)
 *  - Total I Owe Suppliers (payables)
 *  - Net Position (receivables − payables)
 *
 * Accessible from DashboardActionBar → "View Report" or any
 * deep-link to /(main)/reports
 */
import { useRouter } from "expo-router";
import { ArrowLeft, TrendingDown, TrendingUp } from "lucide-react-native";
import {
    ActivityIndicator,
    ScrollView,
    StatusBar,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useDashboard } from "../../../src/hooks/useDashboard";
import { useAuthStore } from "../../../src/store/authStore";
import { formatINR } from "../../../src/utils/dashboardUi";

export default function FinancialPositionScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { profile } = useAuthStore();
  const { data, isLoading, isError } = useDashboard(profile?.id);

  const netPos = data ? data.customersOweMe - data.iOweSuppliers : 0;
  const isPositive = netPos >= 0;

  return (
    <View style={[styles.root, { paddingTop: insets.top }]}>
      <StatusBar barStyle="dark-content" backgroundColor="#F6F7FB" />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <ArrowLeft size={22} color="#1C1C1E" strokeWidth={2} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Financial Position</Text>
        <View style={{ width: 40 }} />
      </View>

      {isLoading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color="#22C55E" />
        </View>
      ) : isError || !data ? (
        <View style={styles.center}>
          <Text style={styles.errorText}>
            Could not load data. Pull to refresh.
          </Text>
        </View>
      ) : (
        <ScrollView
          contentContainerStyle={styles.scroll}
          showsVerticalScrollIndicator={false}
        >
          {/* Net Position hero */}
          <View
            style={[
              styles.heroCard,
              { backgroundColor: isPositive ? "#F0FDF4" : "#FEF2F2" },
            ]}
          >
            <Text
              style={[
                styles.heroLabel,
                { color: isPositive ? "#16A34A" : "#DC2626" },
              ]}
            >
              NET POSITION
            </Text>
            <Text
              style={[
                styles.heroAmount,
                { color: isPositive ? "#16A34A" : "#DC2626" },
              ]}
            >
              {isPositive ? "+" : ""}
              {formatINR(netPos)}
            </Text>
            <View style={styles.heroRow}>
              {isPositive ? (
                <TrendingUp size={16} color="#16A34A" strokeWidth={2} />
              ) : (
                <TrendingDown size={16} color="#DC2626" strokeWidth={2} />
              )}
              <Text
                style={[
                  styles.heroSub,
                  { color: isPositive ? "#16A34A" : "#DC2626" },
                ]}
              >
                {isPositive
                  ? "You are in a healthy surplus"
                  : "You owe more than you receive"}
              </Text>
            </View>
          </View>

          {/* Receivables card */}
          <View style={styles.card}>
            <View style={styles.cardRow}>
              <View style={[styles.dot, { backgroundColor: "#22C55E" }]} />
              <Text style={styles.cardLabel}>Customers Owe Me</Text>
            </View>
            <Text style={[styles.cardAmount, { color: "#16A34A" }]}>
              {formatINR(data.customersOweMe)}
            </Text>
            <Text style={styles.cardCaption}>
              Total outstanding from {data.activeBuyers} active buyer
              {data.activeBuyers !== 1 ? "s" : ""}
            </Text>
            {/* Progress bar */}
            <ProgressBar
              value={data.customersOweMe}
              total={data.customersOweMe + data.iOweSuppliers}
              color="#22C55E"
            />
          </View>

          {/* Payables card */}
          <View style={styles.card}>
            <View style={styles.cardRow}>
              <View style={[styles.dot, { backgroundColor: "#EF4444" }]} />
              <Text style={styles.cardLabel}>I Owe Suppliers</Text>
            </View>
            <Text style={[styles.cardAmount, { color: "#DC2626" }]}>
              {formatINR(data.iOweSuppliers)}
            </Text>
            <Text style={styles.cardCaption}>
              Total pending supplier payments
            </Text>
            <ProgressBar
              value={data.iOweSuppliers}
              total={data.customersOweMe + data.iOweSuppliers}
              color="#EF4444"
            />
          </View>

          {/* Breakdown row */}
          <View style={styles.breakdownCard}>
            <BreakdownRow
              label="Overdue Customers"
              value={data.overdueCustomers}
              unit="accounts"
              color="#F97316"
            />
            <View style={styles.divider} />
            <BreakdownRow
              label="Net Receivable"
              value={formatINR(data.customersOweMe)}
              color="#16A34A"
            />
            <View style={styles.divider} />
            <BreakdownRow
              label="Net Payable"
              value={formatINR(data.iOweSuppliers)}
              color="#DC2626"
            />
          </View>
        </ScrollView>
      )}
    </View>
  );
}

// ─── Sub-components ───────────────────────────────────────────────────────────
function ProgressBar({
  value,
  total,
  color,
}: {
  value: number;
  total: number;
  color: string;
}) {
  const pct = total > 0 ? Math.min(value / total, 1) : 0;
  return (
    <View style={pb.track}>
      <View
        style={[
          pb.bar,
          {
            width: `${(pct * 100).toFixed(1)}%` as any,
            backgroundColor: color,
          },
        ]}
      />
    </View>
  );
}

function BreakdownRow({
  label,
  value,
  unit,
  color,
}: {
  label: string;
  value: string | number;
  unit?: string;
  color: string;
}) {
  return (
    <View style={bd.row}>
      <Text style={bd.label}>{label}</Text>
      <Text style={[bd.value, { color }]}>
        {typeof value === "number" ? value : value}
        {unit ? ` ${unit}` : ""}
      </Text>
    </View>
  );
}

// ─── Styles ──────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: "#F6F7FB" },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingVertical: 14,
    backgroundColor: "#F6F7FB",
    borderBottomWidth: 1,
    borderBottomColor: "#E5E5EA",
  },
  backBtn: {
    width: 40,
    height: 40,
    alignItems: "flex-start",
    justifyContent: "center",
  },
  headerTitle: { fontSize: 17, fontWeight: "700", color: "#1C1C1E" },
  center: { flex: 1, alignItems: "center", justifyContent: "center" },
  errorText: { fontSize: 14, color: "#8E8E93" },
  scroll: { padding: 20, gap: 14, paddingBottom: 48 },
  heroCard: { borderRadius: 20, padding: 24, marginBottom: 2 },
  heroLabel: {
    fontSize: 11,
    fontWeight: "700",
    letterSpacing: 1.2,
    marginBottom: 8,
  },
  heroAmount: {
    fontSize: 40,
    fontWeight: "800",
    letterSpacing: -0.5,
    marginBottom: 10,
  },
  heroRow: { flexDirection: "row", alignItems: "center", gap: 6 },
  heroSub: { fontSize: 13, fontWeight: "600" },
  card: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  cardRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 8,
  },
  dot: { width: 10, height: 10, borderRadius: 5 },
  cardLabel: { fontSize: 14, fontWeight: "600", color: "#636366" },
  cardAmount: {
    fontSize: 28,
    fontWeight: "800",
    letterSpacing: -0.4,
    marginBottom: 4,
  },
  cardCaption: { fontSize: 12, color: "#8E8E93", marginBottom: 12 },
  breakdownCard: {
    backgroundColor: "#fff",
    borderRadius: 16,
    paddingHorizontal: 20,
    paddingVertical: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  divider: { height: 1, backgroundColor: "#F0F0F5" },
});

const pb = StyleSheet.create({
  track: {
    height: 6,
    backgroundColor: "#F3F4F6",
    borderRadius: 3,
    overflow: "hidden",
  },
  bar: { height: 6, borderRadius: 3 },
});

const bd = StyleSheet.create({
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 14,
  },
  label: { fontSize: 14, color: "#636366", fontWeight: "500" },
  value: { fontSize: 15, fontWeight: "700" },
});
