import { Text, View } from "react-native";

export default function EmptyState({ message }: { message: string }) {
  return (
    <View className="flex-1 items-center justify-center my-6">
      <Text className="font-inter-medium text-neutral-500">{message}</Text>
    </View>
  );
}
