import StackHeader from "@/src/components/navigation/StackHeader";
import { Stack } from "expo-router";

export default function SuppliersLayout() {
  return (
    <Stack>
      <Stack.Screen
        name="index"
        options={{
          header: () => <StackHeader title="Suppliers" />,
        }}
      />
      <Stack.Screen name="[supplierId]" options={{ headerShown: false }} />
    </Stack>
  );
}
