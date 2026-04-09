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
    bg: colors.paid.bg,
    icon: CreditCard,
    color: colors.primaryDark,
    label: "Payment",
  },
  delivery: {
    bg: colors.pending.bg,
    icon: Truck,
    color: colors.pending.text,
    label: "Inventory Received",
  },
  bill: {
    bg: colors.background,
    icon: FileText,
    color: colors.textSecondary,
    label: "Entry Added",
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
      className="bg-surface rounded-2xl p-4 flex-row items-center gap-3.5 mb-2.5"
      style={{
        shadowColor: colors.textPrimary,
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.04,
        shadowRadius: 4,
        elevation: 2,
      }}
    >
      {/* Type icon circle */}
      <View
        className="w-10 h-10 rounded-full items-center justify-center"
        style={{ backgroundColor: cfg.bg }}
      >
        <IconComp size={18} color={cfg.color} strokeWidth={1.75} />
      </View>

      <View className="flex-1">
        <Text
          className="text-sm font-semibold mb-0.5"
          style={{ color: colors.textPrimary }}
          numberOfLines={1}
        >
          {item.title}
        </Text>
        <Text className="text-xs text-textSecondary">
          {formatDashboardDate(item.date)}
        </Text>
      </View>

      <View className="items-end gap-1">
        <Text
          className="text-sm font-bold"
          style={{ color: isIncoming ? colors.primaryDark : colors.danger }}
        >
          {isIncoming ? "+" : "−"}
          {formatINR(item.amount)}
        </Text>
        <StatusBadge status={item.status} />
      </View>
    </View>
  );
}
