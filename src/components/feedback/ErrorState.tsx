import { useTheme } from "@/src/utils/ThemeProvider";
import { Text, View } from "react-native";

export default function ErrorState({ message }: { message: string }) {
  const { colors } = useTheme();

  return (
    <View className="flex-1 items-center justify-center mt-6">
      <Text className="text-center" style={{ color: colors.danger }}>{message}</Text>
    </View>
  );
}
