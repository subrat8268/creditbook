import Button from "@/src/components/ui/Button";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";
import { Image, Text, View } from "react-native";

export default function WelcomePage() {
  const router = useRouter();

  const handleStart = async () => {
    await AsyncStorage.setItem("hasSeenWelcome", "true");
    router.replace("/(auth)/login");
  };
  return (
    <View className="flex-1 bg-white justify-center py-6 items-center">
      {/* Logo */}
      <Image
        source={require("../assets/images/logo.png")} // replace with your logo
        className="w-40"
        resizeMode="contain"
      />

      {/* Illustration */}
      <Image
        source={require("../assets/images/shop.png")} // replace with shop illustration
        className="w-full -mt-8"
        resizeMode="contain"
      />

      <View className="px-6 flex-1 items-center w-full">
        {/* Title */}
        <Text className="text-h1 w-48 font-bold text-center mb-2 text-neutral-900">
          Welcome to CreditBook!
        </Text>

        {/* Subtitle */}
        <Text className="text-body text-neutral-700 text-center mb-6">
          Your seamless partner for managing customer ledgers and growing your
          business.
        </Text>

        {/* CTA Button */}
        <Button title="Get Started" className="w-full" onPress={handleStart} />

        {/* Footer */}
        <Text className="text-caption text-neutral-400 text-center mt-4">
          Your simple ledger for managing daily sales.
        </Text>
      </View>
    </View>
  );
}
