import StackHeader from "@/src/components/navigation/StackHeader";
import { Stack } from "expo-router";

export default function OrdersLayout() {
  return (
    <Stack>
      <Stack.Screen
        name="index"
        options={{
          header: () => <StackHeader title="Orders" />,
        }}
      />
      <Stack.Screen name="[orderId]" options={{ headerShown: false }} />
      <Stack.Screen name="create" options={{ headerShown: false }} />
    </Stack>
  );
}
