import { RecentActivityItem } from "@/src/api/dashboard";
import { formatDashboardDate, formatINR } from "@/src/utils/dashboardUi";
import { colors } from "@/src/utils/theme";
import { Store } from "lucide-react-native";
import { Text, View } from "react-native";
import StatusBadge from "./StatusBadge";

const AVATAR_COLORS = [
  "#EF4444",
  "#F97316",
  "#EAB308",
  "#22C55E",
  "#14B8A6",
  "#3B82F6",
  "#8B5CF6",
  "#EC4899",
];

function getInitials(name: string): string {
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[1][0]).toUpperCase();
}

function getAvatarColor(name: string): string {
  const sum = name.split("").reduce((acc, ch) => acc + ch.charCodeAt(0), 0);
  return AVATAR_COLORS[sum % 8];
}

type Props = {
  item: RecentActivityItem;
  /** When true: renders a gray Store icon avatar instead of color-initials circle */
  isSupplier?: boolean;
};

export default function ActivityRow({ item, isSupplier = false }: Props) {
  const initials = getInitials(item.name || "?");
  const avatarColor = getAvatarColor(item.name || "?");
  const isPaid = item.status === "Paid";
  // Money received (payment) → green +; outstanding bill → red −
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
      {/* Avatar — supplier: gray icon square | customer: colored initials circle */}
      {isSupplier ? (
        <View
          className="w-9 h-9 rounded-xl items-center justify-center"
          style={{ backgroundColor: colors.neutral[100] }}
        >
          <Store size={18} color={colors.neutral[500]} strokeWidth={1.75} />
        </View>
      ) : (
        <View
          className="w-9 h-9 rounded-full items-center justify-center"
          style={{ backgroundColor: avatarColor }}
        >
          <Text className="text-white font-bold text-[13px]">{initials}</Text>
        </View>
      )}

      <View className="flex-1">
        <Text
          className="text-sm font-semibold text-primary mb-0.5"
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
