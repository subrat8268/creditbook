import StackHeader from "@/src/components/navigation/StackHeader";
import { Stack } from "expo-router";

export default function CustomersLayout() {
  return (
    <Stack>
      <Stack.Screen
        name="index"
        options={{
          header: () => <StackHeader title="Customers" />,
        }}
      />
      <Stack.Screen name="[customerId]" options={{ headerShown: false }} />
    </Stack>
  );
}
