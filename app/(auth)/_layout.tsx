import { Stack } from "expo-router";

export default function AuthLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="login" />
      <Stack.Screen name="signup" />
      <Stack.Screen name="resetPassword" />
      <Stack.Screen name="set-new-password" />
      <Stack.Screen name="onboarding" />
    </Stack>
  );
}
