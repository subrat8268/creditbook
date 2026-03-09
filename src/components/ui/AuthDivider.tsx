import { colors } from "@/src/utils/theme";
import { Text, View } from "react-native";

/** Horizontal "or" divider used between primary action and social login */
export default function AuthDivider() {
  return (
    <View className="flex-row items-center my-4">
      <View
        className="flex-1 h-px"
        style={{ backgroundColor: colors.neutral[200] }}
      />
      <Text className="mx-4 text-sm" style={{ color: colors.neutral[400] }}>
        or
      </Text>
      <View
        className="flex-1 h-px"
        style={{ backgroundColor: colors.neutral[200] }}
      />
    </View>
  );
}
