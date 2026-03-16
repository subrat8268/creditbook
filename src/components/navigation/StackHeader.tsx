import { useRouter } from "expo-router";
import { ArrowLeft } from "lucide-react-native";
import { Text, TouchableOpacity, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

interface StackHeaderProps {
  title: string;
  showBack?: boolean;
}

export default function StackHeader({
  title,
  showBack = false,
}: StackHeaderProps) {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  return (
    <View
      className="bg-white border-b border-gray-200 flex-row items-center justify-center px-4"
      style={{ paddingTop: insets.top, height: 44 + insets.top }}
    >
      {showBack && router.canGoBack() && (
        <TouchableOpacity
          onPress={() => router.back()}
          className="absolute left-4 bottom-2"
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        >
          <ArrowLeft size={24} color="#1C1C1E" strokeWidth={2} />
        </TouchableOpacity>
      )}
      <Text className="text-xl font-semibold text-gray-900">{title}</Text>
    </View>
  );
}
