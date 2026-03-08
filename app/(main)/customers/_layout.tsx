import { Stack, useRouter } from "expo-router";
import { ArrowLeft } from "lucide-react-native";
import { Text, TouchableOpacity, View } from "react-native";

type CustomHeaderProps = {
  title?: string;
  showBack?: boolean;
};

// 1. Update CustomHeader to accept props
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

// 2. Implement the dynamic screenOptions logic
export default function CustomersLayout() {
  const screenConfig = {
    index: { title: "Customers", showBack: false },
    "[customerId]": { title: "Customer Details", showBack: true },
    // Add other screens like 'create' here if needed
  };

  return (
    <Stack
      screenOptions={({ route }) => {
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
      <Stack.Screen name="[customerId]" />
    </Stack>
  );
}
