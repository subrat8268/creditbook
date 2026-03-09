import { colors } from "@/src/utils/theme";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";
import { Eye, ShieldCheck, WifiOff, Zap } from "lucide-react-native";
import { Image, Text, TouchableOpacity, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const FEATURE_CHIPS = [
  {
    icon: (
      <Zap
        size={14}
        color={colors.primary.dark}
        strokeWidth={2.2}
        fill={colors.primary.dark}
      />
    ),
    label: "Fast Entry",
  },
  {
    icon: <Eye size={14} color={colors.primary.dark} strokeWidth={2} />,
    label: "Always Visible",
  },
  {
    icon: <WifiOff size={14} color={colors.primary.dark} strokeWidth={2} />,
    label: "Works Offline",
  },
];

export default function WelcomePage() {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const handleStart = async () => {
    await AsyncStorage.setItem("hasSeenWelcome", "true");
    router.replace("/(auth)/login");
  };

  return (
    <View
      className="flex-1 bg-white items-center px-6"
      style={{ paddingTop: insets.top + 16, paddingBottom: insets.bottom + 24 }}
    >
      {/* Logo */}
      <Image
        source={require("../assets/images/logo.png")}
        className="w-36"
        resizeMode="contain"
      />

      {/* Illustration */}
      <View className="w-[342px] h-[260px] items-center justify-center">
        <Image
          source={require("../assets/images/welcome.png")}
          className="w-[342px] h-[260px]"
          resizeMode="contain"
        />
      </View>

      {/* Tagline */}
      <Text className="text-xl font-bold text-gray-900 text-center leading-[30px] mb-5 -tracking-[0.3px]">
        Track Credit. Get Paid Faster.
      </Text>

      {/* Feature chips */}
      <View className="flex-row gap-2.5 justify-center flex-wrap">
        {FEATURE_CHIPS.map((chip) => (
          <View
            key={chip.label}
            className="flex-row items-center gap-1 bg-primary-light border border-success-light rounded-full px-3.5 py-[7px]"
          >
            {chip.icon}
            <Text className="text-[13px] font-semibold text-primary-dark">
              {chip.label}
            </Text>
          </View>
        ))}
      </View>

      {/* Spacer */}
      <View className="flex-1" />

      {/* CTA button */}
      <TouchableOpacity
        className="w-full bg-primary rounded-[14px] h-14 items-center justify-center mb-4"
        style={{
          shadowColor: colors.primary.DEFAULT,
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.3,
          shadowRadius: 8,
          elevation: 4,
        }}
        onPress={handleStart}
        activeOpacity={0.85}
      >
        <Text className="text-[17px] font-bold text-white tracking-wide">
          Get Started →
        </Text>
      </TouchableOpacity>

      {/* Login link */}
      <Text className="text-sm text-textSecondary text-center mb-5">
        Already have an account?{" "}
        <Text
          className="text-primary font-bold"
          onPress={() => router.replace("/(auth)/login")}
        >
          Log In
        </Text>
      </Text>

      {/* Security badge */}
      <View className="flex-row items-center gap-1">
        <ShieldCheck size={13} color={colors.neutral[400]} strokeWidth={2} />
        <Text className="text-[11px] text-gray-400 font-semibold tracking-widest">
          SECURE &amp; ENCRYPTED
        </Text>
      </View>
    </View>
  );
}
