import { Stack } from "expo-router";

export default function OnboardingLayout() {
  return (
    <Stack
      screenOptions={{
        animation: "slide_from_right",
        headerTitleAlign: "center",
        headerShadowVisible: false,
        headerTitleStyle: { fontWeight: "600", fontSize: 18 },
      }}
    >
      <Stack.Screen name="role" options={{ title: "Select Role" }} />
      <Stack.Screen name="index" options={{ headerShown: false }} />
      <Stack.Screen name="business" options={{ title: "Setup (Step 1)" }} />
      <Stack.Screen name="bank" options={{ title: "Setup (Step 2)" }} />
      <Stack.Screen name="ready" options={{ title: "Setup Finished" }} />
    </Stack>
  );
}
