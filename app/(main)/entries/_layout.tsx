import { Stack } from "expo-router";

export default function OrdersLayout() {
  return (
    <Stack>
      <Stack.Screen name="index" options={{ headerShown: false }} />
      <Stack.Screen name="[orderId]" options={{ headerShown: false }} />
      <Stack.Screen name="[orderId]/edit" options={{ headerShown: false }} />
      <Stack.Screen name="create" options={{ headerShown: false }} />
    </Stack>
  );
}
