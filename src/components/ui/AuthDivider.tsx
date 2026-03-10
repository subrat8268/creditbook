import { Text, View } from "react-native";

/** Horizontal "or" divider used between primary action and social login */
export default function AuthDivider() {
  return (
    <View className="flex-row items-center my-4">
      <View className="flex-1 h-px bg-divider" />
      <Text className="mx-4 text-sm text-textMuted">or</Text>
      <View className="flex-1 h-px bg-divider" />
    </View>
  );
}
