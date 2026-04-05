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
    <View className="flex-row justify-between w-full mb-4 gap-3">
      {/* New Bill */}
      <TouchableOpacity
        className="flex-1 rounded-[16px] items-center justify-center py-5 border"
        style={{
          backgroundColor: "#F8FAFC",
          borderColor: "#E2E8F0",
        }}
        onPress={onNewBill}
      >
        <View
          className="w-10 h-10 rounded-full items-center justify-center mb-2"
          style={{ backgroundColor: "#EFF6FF" }}
        >
          <FilePlus2 size={20} color="#3B82F6" strokeWidth={2} />
        </View>
        <Text
          style={{ fontSize: 13, fontWeight: "600", color: "#1E293B" }}
        >
          New Bill
        </Text>
      </TouchableOpacity>

      {/* Collect */}
      <TouchableOpacity
        className="flex-1 rounded-[16px] items-center justify-center py-5 border"
        style={{
          backgroundColor: "#F6FDF9",
          borderColor: "#DCFCE7",
        }}
        onPress={onCollect}
      >
        <View
          className="w-10 h-10 rounded-full items-center justify-center mb-2"
          style={{ backgroundColor: "#dcfce7" }}
        >
          <Wallet size={20} color={colors.primary} strokeWidth={2} />
        </View>
        <Text
          style={{ fontSize: 13, fontWeight: "600", color: "#1E293B" }}
        >
          Collect
        </Text>
      </TouchableOpacity>

      {/* Remind */}
      <TouchableOpacity
        className="flex-1 rounded-[16px] items-center justify-center py-5 border"
        style={{
          backgroundColor: "#FFFAEB",
          borderColor: "#FEF3C7",
        }}
        onPress={onRemind}
      >
        <View
          className="w-10 h-10 rounded-full items-center justify-center mb-2"
          style={{ backgroundColor: "#FEF3C7" }}
        >
          <BellRing size={20} color="#F59E0B" strokeWidth={2} />
        </View>
        <Text
          style={{ fontSize: 13, fontWeight: "600", color: "#1E293B" }}
        >
          Remind
        </Text>
      </TouchableOpacity>
    </View>
  );
}
