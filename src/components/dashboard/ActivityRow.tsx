import { RecentActivityItem } from "@/src/api/dashboard";
import {
    dashboardPalette as C,
    formatDashboardDate,
    formatINR,
} from "@/src/utils/dashboardUi";
import { Ionicons } from "@expo/vector-icons";
import { Text, View } from "react-native";
import StatusBadge from "./StatusBadge";

type Props = { item: RecentActivityItem };

export default function ActivityRow({ item }: Props) {
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
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.04,
        shadowRadius: 4,
        elevation: 2,
      }}
    >
      <View
        style={{
          width: 44,
          height: 44,
          borderRadius: 22,
          backgroundColor: isPaid ? "#D1FAE5" : "#FEE2E2",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Ionicons
          name={isPaid ? "arrow-down" : "receipt-outline"}
          size={20}
          color={isPaid ? "#059669" : "#DC2626"}
        />
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
            color: isPaid ? "#059669" : C.heading,
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
