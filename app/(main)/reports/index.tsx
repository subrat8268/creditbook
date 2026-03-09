import { colors } from "@/src/utils/theme";
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
      <StatusBar barStyle="dark-content" backgroundColor={colors.neutral.bg} />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <ArrowLeft size={22} color={colors.neutral[900]} strokeWidth={2} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Financial Position</Text>
        <View style={{ width: 40 }} />
      </View>

      {isLoading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color={colors.primary.DEFAULT} />
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
              {
                backgroundColor: isPositive
                  ? colors.success.bg
                  : colors.danger.bg,
              },
            ]}
          >
            <Text
              style={[
                styles.heroLabel,
                {
                  color: isPositive
                    ? colors.primary.dark
                    : colors.danger.strong,
                },
              ]}
            >
              NET POSITION
            </Text>
            <Text
              style={[
                styles.heroAmount,
                {
                  color: isPositive
                    ? colors.primary.dark
                    : colors.danger.strong,
                },
              ]}
            >
              {isPositive ? "+" : ""}
              {formatINR(netPos)}
            </Text>
            <View style={styles.heroRow}>
              {isPositive ? (
                <TrendingUp
                  size={16}
                  color={colors.primary.dark}
                  strokeWidth={2}
                />
              ) : (
                <TrendingDown
                  size={16}
                  color={colors.danger.strong}
                  strokeWidth={2}
                />
              )}
              <Text
                style={[
                  styles.heroSub,
                  {
                    color: isPositive
                      ? colors.primary.dark
                      : colors.danger.strong,
                  },
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
              <View
                style={[
                  styles.dot,
                  { backgroundColor: colors.primary.DEFAULT },
                ]}
              />
              <Text style={styles.cardLabel}>Customers Owe Me</Text>
            </View>
            <Text style={[styles.cardAmount, { color: colors.primary.dark }]}>
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
              color={colors.primary.DEFAULT}
            />
          </View>

          {/* Payables card */}
          <View style={styles.card}>
            <View style={styles.cardRow}>
              <View
                style={[styles.dot, { backgroundColor: colors.danger.DEFAULT }]}
              />
              <Text style={styles.cardLabel}>I Owe Suppliers</Text>
            </View>
            <Text style={[styles.cardAmount, { color: colors.danger.strong }]}>
              {formatINR(data.iOweSuppliers)}
            </Text>
            <Text style={styles.cardCaption}>
              Total pending supplier payments
            </Text>
            <ProgressBar
              value={data.iOweSuppliers}
              total={data.customersOweMe + data.iOweSuppliers}
              color={colors.danger.DEFAULT}
            />
          </View>

          {/* Breakdown row */}
          <View style={styles.breakdownCard}>
            <BreakdownRow
              label="Overdue Customers"
              value={data.overdueCustomers}
              unit="accounts"
              color={colors.warning.DEFAULT}
            />
            <View style={styles.divider} />
            <BreakdownRow
              label="Net Receivable"
              value={formatINR(data.customersOweMe)}
              color={colors.primary.dark}
            />
            <View style={styles.divider} />
            <BreakdownRow
              label="Net Payable"
              value={formatINR(data.iOweSuppliers)}
              color={colors.danger.strong}
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
  root: { flex: 1, backgroundColor: colors.neutral.bg },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingVertical: 14,
    backgroundColor: colors.neutral.bg,
    borderBottomWidth: 1,
    borderBottomColor: colors.neutral[200],
  },
  backBtn: {
    width: 40,
    height: 40,
    alignItems: "flex-start",
    justifyContent: "center",
  },
  headerTitle: { fontSize: 17, fontWeight: "700", color: colors.neutral[900] },
  center: { flex: 1, alignItems: "center", justifyContent: "center" },
  errorText: { fontSize: 14, color: colors.neutral[400] },
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
    backgroundColor: colors.white,
    borderRadius: 16,
    padding: 20,
    shadowColor: colors.black,
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
  cardLabel: { fontSize: 14, fontWeight: "600", color: colors.neutral[600] },
  cardAmount: {
    fontSize: 28,
    fontWeight: "800",
    letterSpacing: -0.4,
    marginBottom: 4,
  },
  cardCaption: { fontSize: 12, color: colors.neutral[400], marginBottom: 12 },
  breakdownCard: {
    backgroundColor: colors.white,
    borderRadius: 16,
    paddingHorizontal: 20,
    paddingVertical: 4,
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  divider: { height: 1, backgroundColor: colors.neutral.bg },
});

const pb = StyleSheet.create({
  track: {
    height: 6,
    backgroundColor: colors.neutral.bg,
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
  label: { fontSize: 14, color: colors.neutral[600], fontWeight: "500" },
  value: { fontSize: 15, fontWeight: "700" },
});
