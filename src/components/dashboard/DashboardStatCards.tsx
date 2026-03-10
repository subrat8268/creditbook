import { AlertTriangle, Users } from "lucide-react-native";
import { Text, View } from "react-native";

type Props = {
  activeBuyers: number;
  overdueCustomers: number;
};

export default function DashboardStatCards({
  activeBuyers,
  overdueCustomers,
}: Props) {
  return (
    <View className="flex-row gap-3 mb-7">
      {/* Active Buyers */}
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
        <View className="flex-row justify-between items-start">
          <Text className="text-[28px] font-extrabold text-textDark">
            {activeBuyers}
          </Text>
          <View className="w-[38px] h-[38px] rounded-xl bg-primary-light items-center justify-center">
            <Users size={20} color="#22C55E" strokeWidth={1.8} />
          </View>
        </View>
        <Text className="text-[13px] text-textPrimary mt-1.5">
          Active Buyers
        </Text>
      </View>

      {/* Overdue Accounts */}
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
        <View className="flex-row justify-between items-start">
          <Text className="text-[28px] font-extrabold text-textDark">
            {overdueCustomers}
          </Text>
          <View className="w-[38px] h-[38px] rounded-xl bg-danger-light items-center justify-center">
            <AlertTriangle size={20} color="#E74C3C" strokeWidth={1.8} />
          </View>
        </View>
        <Text className="text-[13px] text-textPrimary mt-1.5">
          Overdue Accounts
        </Text>
      </View>
    </View>
  );
}
