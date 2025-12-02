import { ActivityIndicator, Text, View } from "react-native";

export default function Loader({ message }: { message?: string }) {
  return (
    <View className="flex-1 items-center justify-center mt-6">
      <ActivityIndicator size="large" color="#398526" />
      <Text className="mt-3 text-neutral-500">{message}</Text>
    </View>
  );
}
