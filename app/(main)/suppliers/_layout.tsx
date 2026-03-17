import { Stack } from "expo-router";

export default function SuppliersLayout() {
  return (
    <Stack>
      <Stack.Screen name="index" options={{ headerShown: false }} />
      <Stack.Screen name="[supplierId]" options={{ headerShown: false }} />
    </Stack>
  );
}
