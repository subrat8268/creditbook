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
          headerTitleAlign: "center",
          headerShadowVisible: false,
          headerTitleStyle: {
            fontWeight: "600",
            fontSize: 18,
          },
          headerBackground: CustomHeader,
        }}
      >
        <Stack.Screen
          name="login"
          options={{
            title: "Login",
          }}
        />
        <Stack.Screen
          name="signup"
          options={{
            title: "Create Account",
          }}
        />
        <Stack.Screen
          name="resetPassword"
          options={{
            title: "Reset Password",
          }}
        />
      </Stack>
    </View>
  );
}
