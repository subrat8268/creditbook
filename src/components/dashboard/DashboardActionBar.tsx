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
          backgroundColor: colors.surfaceAlt,
          borderColor: colors.border,
        }}
        onPress={onNewBill}
      >
        <View
          className="w-10 h-10 rounded-full items-center justify-center mb-2"
          style={{ backgroundColor: colors.primaryBlueBg }}
        >
          <FilePlus2 size={20} color={colors.primaryBlue} strokeWidth={2} />
        </View>
        <Text
          style={{ fontSize: 13, fontWeight: "600", color: colors.textPrimary }}
        >
          New Bill
        </Text>
      </TouchableOpacity>

      {/* Collect */}
      <TouchableOpacity
        className="flex-1 rounded-[16px] items-center justify-center py-5 border"
        style={{
          backgroundColor: colors.successBg,
          borderColor: colors.paid.bg,
        }}
        onPress={onCollect}
      >
        <View
          className="w-10 h-10 rounded-full items-center justify-center mb-2"
          style={{ backgroundColor: colors.paid.bg }}
        >
          <Wallet size={20} color={colors.primary} strokeWidth={2} />
        </View>
        <Text
          style={{ fontSize: 13, fontWeight: "600", color: colors.textPrimary }}
        >
          Collect
        </Text>
      </TouchableOpacity>

      {/* Remind */}
      <TouchableOpacity
        className="flex-1 rounded-[16px] items-center justify-center py-5 border"
        style={{
          backgroundColor: colors.warningBg,
          borderColor: colors.warningBadgeBg,
        }}
        onPress={onRemind}
      >
        <View
          className="w-10 h-10 rounded-full items-center justify-center mb-2"
          style={{ backgroundColor: colors.warningBadgeBg }}
        >
          <BellRing size={20} color={colors.warning} strokeWidth={2} />
        </View>
        <Text
          style={{ fontSize: 13, fontWeight: "600", color: colors.textPrimary }}
        >
          Remind
        </Text>
      </TouchableOpacity>
    </View>
  );
}
