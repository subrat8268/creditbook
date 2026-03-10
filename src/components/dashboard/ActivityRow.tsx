import { RecentActivityItem } from "@/src/api/dashboard";
import { formatDashboardDate, formatINR } from "@/src/utils/dashboardUi";
import { colors } from "@/src/utils/theme";
import { CreditCard, FileText, Truck } from "lucide-react-native";
import { Text, View } from "react-native";
import StatusBadge from "./StatusBadge";

// ─── Type-driven icon config ──────────────────────────────────────────────────
type IconCfg = {
  bg: string;
  icon: React.ComponentType<{
    size: number;
    color: string;
    strokeWidth: number;
  }>;
  color: string;
  label: string;
};

const ICON_CONFIG: Record<string, IconCfg> = {
  payment: {
    bg: colors.success.light ?? "#DCFCE7",
    icon: CreditCard,
    color: colors.success.dark ?? "#166534",
    label: "Customer Payment",
  },
  delivery: {
    bg: colors.warning.light ?? "#FEF3C7",
    icon: Truck,
    color: colors.warning.dark ?? "#92400E",
    label: "Inventory Received",
  },
  bill: {
    bg: colors.neutral[100],
    icon: FileText,
    color: colors.neutral[500],
    label: "Bill Created",
  },
};

type Props = {
  item: RecentActivityItem;
};

export default function ActivityRow({ item }: Props) {
  const cfg = ICON_CONFIG[item.type] ?? ICON_CONFIG.bill;
  const IconComp = cfg.icon;
  // Money received (payment) → green +; anything else → red −
  const isIncoming = item.type === "payment";

  return (
    <View
      className="bg-white rounded-2xl p-4 flex-row items-center gap-3.5 mb-2.5"
      style={{
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.04,
        shadowRadius: 4,
        elevation: 2,
      }}
    >
      {/* Type icon square */}
      <View
        className="w-9 h-9 rounded-xl items-center justify-center"
        style={{ backgroundColor: cfg.bg }}
      >
        <IconComp size={18} color={cfg.color} strokeWidth={1.75} />
      </View>

      <View className="flex-1">
        <Text
          className="text-sm font-semibold text-primary mb-0.5"
          numberOfLines={1}
        >
          {item.title}
        </Text>
        <Text className="text-xs text-textSecondary">
          {cfg.label} · {formatDashboardDate(item.date)}
        </Text>
      </View>

      <View className="items-end gap-1">
        <Text
          className="text-sm font-bold"
          style={{ color: isIncoming ? "#16A34A" : colors.danger.DEFAULT }}
        >
          {isIncoming ? "+" : "−"}
          {formatINR(item.amount)}
        </Text>
        <StatusBadge status={item.status} />
      </View>
    </View>
  );
}
