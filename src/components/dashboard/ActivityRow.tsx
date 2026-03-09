import { RecentActivityItem } from "@/src/api/dashboard";
import {
    dashboardPalette as C,
    formatDashboardDate,
    formatINR,
} from "@/src/utils/dashboardUi";
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

type Props = { item: RecentActivityItem };

export default function ActivityRow({ item }: Props) {
  const initials = getInitials(item.name || "?");
  const avatarColor = getAvatarColor(item.name || "?");
  const isPaid = item.status === "Paid";

  return (
    <View
      style={{
        backgroundColor: C.white,
        borderRadius: 16,
        padding: 16,
        flexDirection: "row",
        alignItems: "center",
        gap: 14,
        marginBottom: 10,
        shadowColor: colors.black,
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.04,
        shadowRadius: 4,
        elevation: 2,
      }}
    >
      {/* Initials avatar */}
      <View
        style={{
          width: 36,
          height: 36,
          borderRadius: 18,
          backgroundColor: avatarColor,
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Text
          style={{
            color: colors.white,
            fontWeight: "bold",
            fontSize: 13,
          }}
        >
          {initials}
        </Text>
      </View>

      <View style={{ flex: 1 }}>
        <Text
          style={{
            fontSize: 14,
            fontWeight: "600",
            color: C.heading,
            marginBottom: 2,
          }}
          numberOfLines={1}
        >
          {item.title}
        </Text>
        <Text style={{ fontSize: 12, color: C.muted }}>
          {formatDashboardDate(item.date)}
        </Text>
      </View>

      <View style={{ alignItems: "flex-end", gap: 4 }}>
        <Text
          style={{
            fontSize: 14,
            fontWeight: "700",
            color: isPaid ? colors.success.dark : C.heading,
          }}
        >
          {isPaid ? "+" : ""}
          {formatINR(item.amount)}
        </Text>
        <StatusBadge status={item.status} />
      </View>
    </View>
  );
}
