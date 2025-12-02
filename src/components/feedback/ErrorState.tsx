import { Text, View } from "react-native";

export default function ErrorState({ message }: { message: string }) {
  return (
    <View className="flex-1 items-center justify-center mt-6">
      <Text className="text-red-500 text-center">{message}</Text>
    </View>
  );
}
