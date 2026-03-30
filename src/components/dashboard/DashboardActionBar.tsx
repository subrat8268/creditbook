import { colors } from "@/src/utils/theme";
import { BellRing, FilePlus2, Wallet } from "lucide-react-native";
import { Text, TouchableOpacity, View } from "react-native";

type Props = {
  onNewBill?: () => void;
  onCollect?: () => void;
  onRemind?: () => void;
};

export default function DashboardActionBar({
  onNewBill,
  onCollect,
  onRemind,
}: Props) {
  return (
    <View
      className="bg-white rounded-[20px] flex-row mb-4 overflow-hidden"
      style={{
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 8,
        elevation: 2,
      }}
    >
      <TouchableOpacity
        className="flex-1 py-[18px] items-center justify-center gap-1.5 border-r border-divider"
        onPress={onNewBill}
      >
        <View
          className="w-9 h-9 rounded-full items-center justify-center"
          style={{ backgroundColor: "#EFF6FF" }}
        >
          <FilePlus2 size={18} color="#3B82F6" strokeWidth={2} />
        </View>
        <Text className="text-xs font-semibold" style={{ color: "#3B82F6" }}>
          New Bill
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        className="flex-1 py-[18px] items-center justify-center gap-1.5 border-r border-divider"
        onPress={onCollect}
      >
        <View
          className="w-9 h-9 rounded-full items-center justify-center"
          style={{ backgroundColor: "#F0FDF4" }}
        >
          <Wallet size={18} color={colors.primary} strokeWidth={2} />
        </View>
        <Text
          className="text-xs font-semibold"
          style={{ color: colors.primary }}
        >
          Collect
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        className="flex-1 py-[18px] items-center justify-center gap-1.5"
        onPress={onRemind}
      >
        <View
          className="w-9 h-9 rounded-full items-center justify-center"
          style={{ backgroundColor: "#FFFBEB" }}
        >
          <BellRing size={18} color="#F59E0B" strokeWidth={2} />
        </View>
        <Text className="text-xs font-semibold" style={{ color: "#F59E0B" }}>
          Remind
        </Text>
      </TouchableOpacity>
    </View>
  );
}
