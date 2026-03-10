import { colors } from "@/src/utils/theme";
import { AlertTriangle, Users, Users2 } from "lucide-react-native";
import { Text, View } from "react-native";

// ─── Types ────────────────────────────────────────────────────────────────────
// seller      → 2 cards: Active Buyers | Overdue
// distributor → 2 cards: Active Suppliers | Overdue Payments
// both        → 2×2 grid: Active Buyers | Active Suppliers | Overdue Customers | Overdue Suppliers
type Mode = "seller" | "distributor" | "both";

type Props = {
  mode?: Mode;
  primaryCount: number;      // activeBuyers (seller/both) or activeSuppliers (distributor)
  overdueCount: number;      // overdueCustomers (seller/both) or overduePayments (distributor)
  // Both-mode extras
  activeSuppliers?: number;
  overdueSuppliers?: number;
};

// ─── Shared card shell ────────────────────────────────────────────────────────
function StatCard({
  label,
  value,
  descriptor,
  valueColor = colors.neutral[900],
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
      className="flex-1 bg-white rounded-[20px] p-[18px]"
      style={{
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 8,
        elevation: 2,
      }}
    >
      <Text
        className="text-[10px] tracking-widest font-bold mb-2"
        style={{ color: colors.neutral[500] }}
      >
        {label}
      </Text>
      <View className="flex-row justify-between items-end">
        <View>
          <Text
            className="font-extrabold leading-none mb-1.5"
            style={{ color: valueColor, fontSize: 32 }}
          >
            {value}
          </Text>
          <Text className="text-[12px]" style={{ color: colors.neutral[500] }}>
            {descriptor}
          </Text>
        </View>
        <View
          className="w-[38px] h-[38px] rounded-xl items-center justify-center"
          style={{ backgroundColor: iconBg }}
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
      icon={<Users size={20} color={colors.primary.DEFAULT} strokeWidth={1.8} />}
      iconBg={colors.primary.light}
    />
  );

  const supplierCard = (
    <StatCard
      label="ACTIVE SUPPLIERS"
      value={isBoth ? activeSuppliers : primaryCount}
      descriptor="vendors"
      icon={<Users2 size={20} color={colors.primary.DEFAULT} strokeWidth={1.8} />}
      iconBg={colors.primary.light}
    />
  );

  const overdueCustomerCard = (
    <StatCard
      label={isBoth ? "OVERDUE CUSTOMERS" : "OVERDUE"}
      value={overdueCount}
      descriptor="need follow-up"
      valueColor={colors.danger.DEFAULT}
      icon={<AlertTriangle size={20} color={colors.danger.DEFAULT} strokeWidth={1.8} />}
      iconBg={colors.danger.light}
    />
  );

  const overdueSupplierCard = (
    <StatCard
      label="OVERDUE SUPPLIERS"
      value={isBoth ? overdueSuppliers : overdueCount}
      descriptor="need follow-up"
      valueColor={colors.danger.DEFAULT}
      icon={<AlertTriangle size={20} color={colors.danger.DEFAULT} strokeWidth={1.8} />}
      iconBg={colors.danger.light}
    />
  );

  // ── Both mode — 2×2 grid ──────────────────────────────────────────────────
  if (isBoth) {
    return (
      <View className="mb-7 gap-3">
        <View className="flex-row gap-3">
          {buyerCard}
          {supplierCard}
        </View>
        <View className="flex-row gap-3">
          {overdueCustomerCard}
          {overdueSupplierCard}
        </View>
      </View>
    );
  }

  // ── Seller / Distributor — 2-column ───────────────────────────────────────
  return (
    <View className="flex-row gap-3 mb-7">
      {isDistributor ? supplierCard : buyerCard}
      {isDistributor ? overdueSupplierCard : overdueCustomerCard}
    </View>
  );
}


