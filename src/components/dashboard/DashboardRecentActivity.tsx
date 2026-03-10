import { RecentActivityItem } from "@/src/api/dashboard";
import { Receipt } from "lucide-react-native";
import { Text, TouchableOpacity, View } from "react-native";
import ActivityRow from "./ActivityRow";

type Props = {
  items: RecentActivityItem[];
  onViewAll?: () => void;
};

export default function DashboardRecentActivity({
  items,
  onViewAll,
}: Props) {
  return (
    <>
      <View className="flex-row justify-between items-center mb-3.5">
        <Text className="text-lg font-bold text-textDark">Recent Activity</Text>
        <TouchableOpacity onPress={onViewAll}>
          <Text className="text-sm font-semibold text-primary">See All</Text>
        </TouchableOpacity>
      </View>

      {items.length === 0 ? (
        <View className="bg-white rounded-2xl p-8 items-center">
          <Receipt size={36} color="#AEAEB2" strokeWidth={1.5} />
          <Text className="text-textMuted mt-2.5 text-sm">
            No recent activity
          </Text>
        </View>
      ) : (
        items.map((item) => (
          <ActivityRow key={item.id} item={item} />
        ))
      )}
    </>
  );
}
