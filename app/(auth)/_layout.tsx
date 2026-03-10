import { Stack } from "expo-router";
import { View } from "react-native";

const CustomHeader = () => (
  <View className="bg-white flex-1 border-b border-default" />
);

export default function AuthLayout() {
  return (
    <View className="flex-1 bg-white">
      <Stack
        screenOptions={{
          headerShown: false,
        }}
      >
        <Stack.Screen
          name="login"
          options={{
            headerShown: true,
            title: "Login",
            headerTitleAlign: "center",
            headerShadowVisible: false,
            headerTitleStyle: { fontWeight: "600", fontSize: 18 },
            headerBackground: CustomHeader,
          }}
        />
        <Stack.Screen
          name="signup"
          options={{
            headerShown: true,
            title: "Create Account",
            headerTitleAlign: "center",
            headerShadowVisible: false,
            headerTitleStyle: { fontWeight: "600", fontSize: 18 },
            headerBackground: CustomHeader,
          }}
        />
        <Stack.Screen
          name="resetPassword"
          options={{
            headerShown: true,
            title: "Reset Password",
            headerTitleAlign: "center",
            headerShadowVisible: false,
            headerTitleStyle: { fontWeight: "600", fontSize: 18 },
            headerBackground: CustomHeader,
          }}
        />
        <Stack.Screen name="onboarding" options={{ headerShown: false }} />
      </Stack>
    </View>
  );
}
