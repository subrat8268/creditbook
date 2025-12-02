import { LinearGradient } from "expo-linear-gradient";
import { StyleSheet, Text, View } from "react-native";
import Animated, { FadeInUp } from "react-native-reanimated";

export default function SubscriptionCard({ profile }: any) {
  const { isSubscribed, daysRemaining, subscription_plan } = profile;

  const gradientColors: readonly [string, string, ...string[]] = isSubscribed
    ? ["#16A34A", "#4ADE80"]
    : ["#EF4444", "#F87171"];

  return (
    <Animated.View
      entering={FadeInUp.duration(400)}
      className="rounded-2xl overflow-hidden shadow-lg mb-6"
    >
      <LinearGradient colors={gradientColors} style={styles.gradient}>
        <Text className="text-white text-lg font-bold">
          {subscription_plan ?? "Free Plan"}
        </Text>

        {isSubscribed ? (
          <Text className="text-white mt-1">
            Active — {daysRemaining} days remaining
          </Text>
        ) : (
          <Text className="text-white mt-1">Not subscribed</Text>
        )}

        <View className="mt-4 py-2 px-4 bg-white/20 rounded-xl">
          <Text className="text-white font-semibold text-center">
            {isSubscribed ? "Renew Subscription" : "Upgrade to Premium"}
          </Text>
        </View>
      </LinearGradient>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  gradient: {
    padding: 20,
  },
});
