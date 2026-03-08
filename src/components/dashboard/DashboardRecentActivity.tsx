import { RecentActivityItem } from "@/src/api/dashboard";
import { dashboardPalette as C } from "@/src/utils/dashboardUi";
import { Receipt } from "lucide-react-native";
import { Text, TouchableOpacity, View } from "react-native";
import ActivityRow from "./ActivityRow";

type Props = {
  items: RecentActivityItem[];
  onViewAll?: () => void;
};

export default function DashboardRecentActivity({ items, onViewAll }: Props) {
  return (
    <>
      <View
        style={{
          flexDirection: "row",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: 14,
        }}
      >
        <Text style={{ fontSize: 18, fontWeight: "700", color: C.heading }}>
          Recent Activity
        </Text>
        <TouchableOpacity onPress={onViewAll}>
          <Text style={{ fontSize: 14, fontWeight: "600", color: C.blue }}>
            View All
          </Text>
        </TouchableOpacity>
      </View>

      {items.length === 0 ? (
        <View
          style={{
            backgroundColor: C.white,
            borderRadius: 16,
            padding: 32,
            alignItems: "center",
          }}
        >
          <Receipt size={36} color={C.muted} strokeWidth={1.5} />
          <Text style={{ color: C.muted, marginTop: 10, fontSize: 14 }}>
            No recent activity
          </Text>
        </View>
      ) : (
        items.map((item) => <ActivityRow key={item.id} item={item} />)
      )}
    </>
  );
}
