import { colors, spacing, typography } from "@/src/utils/theme";
import { AlertTriangle, Users, Users2 } from "lucide-react-native";
import { Text, View } from "react-native";

// ─── Types ────────────────────────────────────────────────────────────────────
// seller      → 2 cards: Active Buyers | Overdue
// distributor → 2 cards: Active Suppliers | Overdue Payments
// both        → 2×2 grid: Active Buyers | Active Suppliers | Overdue Customers | Overdue Suppliers
type Mode = "seller" | "distributor" | "both";

type Props = {
  mode?: Mode;
  primaryCount: number; // activeBuyers (seller/both) or activeSuppliers (distributor)
  overdueCount: number; // overdueCustomers (seller/both) or overduePayments (distributor)
  // Both-mode extras
  activeSuppliers?: number;
  overdueSuppliers?: number;
};

// ─── Shared card shell ────────────────────────────────────────────────────────
function StatCard({
  label,
  value,
  descriptor,
  valueColor = colors.textPrimary,
  icon,
  iconBg,
}: {
  label: string;
  value: number;
  descriptor: string;
  valueColor?: string;
  icon: React.ReactNode;
  iconBg: string;
}) {
  return (
    <View
      style={{
        flex: 1,
        backgroundColor: colors.surface,
        borderRadius: spacing.cardRadius + 4,
        padding: 18,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 8,
        elevation: 2,
      }}
    >
      <Text
        style={{
          ...typography.label,
          marginBottom: spacing.sm,
          color: colors.textSecondary,
        }}
      >
        {label}
      </Text>
      <View className="flex-row justify-between items-end">
        <View>
          <Text
            style={{
              color: valueColor,
              fontSize: 32,
              fontWeight: "800",
              lineHeight: 32,
              marginBottom: spacing.md,
            }}
          >
            {value}
          </Text>
          <Text
            style={{
              ...typography.caption,
              color: colors.textSecondary,
            }}
          >
            {descriptor}
          </Text>
        </View>
        <View
          style={{
            width: 38,
            height: 38,
            borderRadius: 12,
            alignItems: "center",
            justifyContent: "center",
            backgroundColor: iconBg,
          }}
        >
          {icon}
        </View>
      </View>
    </View>
  );
}

// ─── DashboardStatCards ───────────────────────────────────────────────────────
export default function DashboardStatCards({
  mode = "seller",
  primaryCount,
  overdueCount,
  activeSuppliers = 0,
  overdueSuppliers = 0,
}: Props) {
  const isBoth = mode === "both";
  const isDistributor = mode === "distributor";

  const buyerCard = (
    <StatCard
      label="ACTIVE BUYERS"
      value={primaryCount}
      descriptor="customers"
      icon={<Users size={20} color={colors.primary} strokeWidth={1.8} />}
      iconBg={colors.paid.bg}
    />
  );

  const supplierCard = (
    <StatCard
      label="ACTIVE SUPPLIERS"
      value={isBoth ? activeSuppliers : primaryCount}
      descriptor="vendors"
      icon={<Users2 size={20} color={colors.primary} strokeWidth={1.8} />}
      iconBg={colors.paid.bg}
    />
  );

  const overdueCustomerCard = (
    <StatCard
      label={isBoth ? "OVERDUE CUSTOMERS" : "OVERDUE"}
      value={overdueCount}
      descriptor="need follow-up"
      valueColor={colors.danger}
      icon={<AlertTriangle size={20} color={colors.danger} strokeWidth={1.8} />}
      iconBg={colors.overdue.bg}
    />
  );

  const overdueSupplierCard = (
    <StatCard
      label="OVERDUE SUPPLIERS"
      value={isBoth ? overdueSuppliers : overdueCount}
      descriptor="need follow-up"
      valueColor={colors.danger}
      icon={<AlertTriangle size={20} color={colors.danger} strokeWidth={1.8} />}
      iconBg={colors.overdue.bg}
    />
  );

  // ── Both mode — 2×2 grid ──────────────────────────────────────────────────
  if (isBoth) {
    return (
      <View style={{ marginBottom: spacing.xl, gap: spacing.md }}>
        <View className="flex-row" style={{ gap: spacing.md }}>
          {buyerCard}
          {supplierCard}
        </View>
        <View className="flex-row" style={{ gap: spacing.md }}>
          {overdueCustomerCard}
          {overdueSupplierCard}
        </View>
      </View>
    );
  }

  // ── Seller / Distributor — 2-column ───────────────────────────────────────
  return (
    <View
      className="flex-row"
      style={{
        gap: spacing.md,
        marginBottom: spacing.xl,
      }}
    >
      {isDistributor ? supplierCard : buyerCard}
      {isDistributor ? overdueSupplierCard : overdueCustomerCard}
    </View>
  );
}
