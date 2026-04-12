import { Stack } from "expo-router";

export default function CustomersLayout() {
  return (
    <Stack>
      <Stack.Screen name="index" options={{ headerShown: false }} />
      <Stack.Screen name="[customerId]" options={{ headerShown: false }} />
    </Stack>
  );
}
