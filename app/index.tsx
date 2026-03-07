import Button from "@/src/components/ui/Button";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import {
    Image,
    Platform,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const VALUE_CHIPS = [
  "📒  Credit Ledger",
  "🧾  Quick Bills",
  "🚚  Supplier Tracking",
  "📊  Daily Reports",
];

export default function WelcomePage() {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const handleStart = async () => {
    await AsyncStorage.setItem("hasSeenWelcome", "true");
    router.replace("/(auth)/login");
  };

  return (
    <LinearGradient colors={["#F0FDF4", "#FFFFFF"]} style={styles.gradient}>
      {/* Upper area — logo + illustration */}
      <View style={[styles.upper, { paddingTop: insets.top + 24 }]}>
        {/* Logo */}
        <Image
          source={require("../assets/images/logo.png")}
          style={styles.logo}
          resizeMode="contain"
        />

        {/* Illustration */}
        <Image
          source={require("../assets/images/shop.png")}
          style={styles.illustration}
          resizeMode="contain"
        />
      </View>

      {/* Bottom card */}
      <View style={[styles.card, { paddingBottom: 40 + insets.bottom }]}>
        {/* Title */}
        <Text style={styles.title}>Welcome to CreditBook!</Text>

        {/* Subtitle */}
        <Text style={styles.subtitle}>
          Your seamless partner for managing customer ledgers and growing your
          business.
        </Text>

        {/* Value chips */}
        <View style={styles.chipsRow}>
          {VALUE_CHIPS.map((chip) => (
            <View key={chip} style={styles.chip}>
              <Text style={styles.chipText}>{chip}</Text>
            </View>
          ))}
        </View>

        {/* CTA */}
        <Button title="Get Started" className="w-full" onPress={handleStart} />

        {/* Login link */}
        <TouchableOpacity
          onPress={() => router.replace("/(auth)/login")}
          activeOpacity={0.7}
        >
          <Text style={styles.loginLink}>
            Already have an account?{" "}
            <Text style={styles.loginLinkBold}>Log in</Text>
          </Text>
        </TouchableOpacity>
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  gradient: {
    flex: 1,
  },
  upper: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  logo: {
    width: 160,
    height: 56,
  },
  illustration: {
    width: "100%",
    height: undefined,
    aspectRatio: 1.4,
    marginTop: -16,
  },
  card: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: "#FFFFFF",
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    paddingTop: 28,
    paddingHorizontal: 24,
    ...Platform.select({
      android: { elevation: 8 },
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: -2 },
        shadowOpacity: 0.08,
        shadowRadius: 12,
      },
    }),
  },
  title: {
    fontSize: 24,
    fontWeight: "700",
    color: "#111827",
    textAlign: "center",
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    color: "#6B7280",
    textAlign: "center",
    lineHeight: 20,
    marginBottom: 20,
  },
  chipsRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    justifyContent: "center",
    marginBottom: 24,
  },
  chip: {
    backgroundColor: "#F0FDF4",
    borderWidth: 1,
    borderColor: "#BBF7D0",
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  chipText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#16A34A",
  },
  loginLink: {
    fontSize: 13,
    color: "#9CA3AF",
    textAlign: "center",
    marginTop: 16,
  },
  loginLinkBold: {
    color: "#22C55E",
    fontWeight: "700",
  },
});
