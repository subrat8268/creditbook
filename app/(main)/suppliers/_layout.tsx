import { Stack, useRouter } from "expo-router";
import { ArrowLeft } from "lucide-react-native";
import { Text, TouchableOpacity, View } from "react-native";

type CustomHeaderProps = {
  title?: string;
  showBack?: boolean;
};

const CustomHeader = ({ title, showBack }: CustomHeaderProps) => {
  const router = useRouter();
  return (
    <View className="bg-white border-b border-default h-[94px] flex-row items-center justify-center px-4 pt-10">
      {showBack && router.canGoBack() && (
        <TouchableOpacity
          onPress={() => router.back()}
          className="absolute left-4 top-14"
        >
          <ArrowLeft size={24} color="black" strokeWidth={2} />
        </TouchableOpacity>
      )}
      <Text className="text-xl font-semibold">{title}</Text>
    </View>
  );
};

export default function SuppliersLayout() {
  const screenConfig = {
    index: { title: "Suppliers", showBack: false },
    "[supplierId]": { title: "Supplier Details", showBack: true },
  };

  return (
    <Stack
      screenOptions={({ route }) => {
        // index renders its own header (Suppliers + I Owe pill)
        if (route.name === "index") {
          return { headerShown: false };
        }
        const config =
          screenConfig[route.name as keyof typeof screenConfig] ||
          screenConfig.index;
        return {
          header: () => (
            <CustomHeader title={config.title} showBack={config.showBack} />
          ),
        };
      }}
    >
      <Stack.Screen name="index" />
      <Stack.Screen name="[supplierId]" />
    </Stack>
  );
}
