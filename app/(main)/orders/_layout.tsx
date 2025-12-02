import { Ionicons } from "@expo/vector-icons";
import { Stack, useRouter } from "expo-router";
import { Text, TouchableOpacity, View } from "react-native";

type CustomHeaderProps = {
  title?: string;
  showBack?: boolean;
};

const CustomHeader = ({ title, showBack }: CustomHeaderProps) => {
  const router = useRouter();

  return (
    <View className="bg-white border-b border-default h-[94px] flex-row  items-center justify-center">
      {showBack && router.canGoBack() && (
        <TouchableOpacity
          onPress={() => router.back()}
          className="absolute left-4 top-14"
        >
          <Ionicons name="arrow-back-sharp" size={24} color="black" />
        </TouchableOpacity>
      )}
      <Text className="text-xl font-semibold mt-10">{title}</Text>
    </View>
  );
};

export default function OrdersLayout() {
  const screenOptions = {
    index: { title: "Orders", showBack: false },
    create: { title: "New Order", showBack: true },
    "[orderId]": { title: "Order Details", showBack: true },
  };

  return (
    <Stack
      screenOptions={({ route }) => {
        const config =
          screenOptions[route.name as keyof typeof screenOptions] ||
          screenOptions.index;
        return {
          header: () => (
            <CustomHeader title={config.title} showBack={config.showBack} />
          ),
        };
      }}
    >
      <Stack.Screen name="index" />
      <Stack.Screen name="[orderId]" options={{ title: "Order Details" }} />
      <Stack.Screen name="create" options={{ title: "New Order" }} />
    </Stack>
  );
}
