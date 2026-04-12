import { colors } from "@/src/utils/theme";
import { MoreVertical } from "lucide-react-native";
import { Text, TouchableOpacity, View } from "react-native";

type Props = {
  /** Total number of customers — shown as green badge next to title */
  count: number;
  onMenuPress?: () => void;
};

/**
 * Fixed header for the Customers list screen.
 * Layout: "Customers" (bold) + green count badge | three-dot menu (right)
 */
export default function CustomersHeader({ count, onMenuPress }: Props) {
  return (
    <View className="flex-row items-center justify-between px-5 pt-4 pb-3.5 bg-white">
      {/* Left — title + count */}
      <View className="flex-row items-center gap-2.5">
        <Text
          className="font-bold"
          style={{ fontSize: 22, color: colors.textPrimary }}
        >
          Customers
        </Text>
        <View
          className="rounded-full px-2.5 py-[3px]"
          style={{ backgroundColor: colors.paid.bg }}
        >
          <Text
            className="font-bold"
            style={{ fontSize: 13, color: colors.primary }}
          >
            {count}
          </Text>
        </View>
      </View>

      {/* Right — three-dot menu */}
      <TouchableOpacity
        onPress={onMenuPress}
        hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        activeOpacity={0.7}
      >
        <MoreVertical size={22} color={colors.textSecondary} strokeWidth={2} />
      </TouchableOpacity>
    </View>
  );
}
