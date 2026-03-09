import OnboardingProgress from "@/src/components/onboarding/OnboardingProgress";
import Button from "@/src/components/ui/Button";
import { supabase } from "@/src/services/supabase";
import { useAuthStore } from "@/src/store/authStore";
import { colors } from "@/src/utils/theme";
import { useRouter } from "expo-router";
import {
  BadgeCheck,
  Building2,
  CheckCircle2,
  Circle,
  Info,
  Phone,
  QrCode,
  Receipt,
  Store,
} from "lucide-react-native";
import { useEffect, useRef, useState } from "react";
import {
  Animated,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

function ShimmerChip() {
  const opacity = useRef(new Animated.Value(0.4)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(opacity, {
          toValue: 1,
          duration: 700,
          useNativeDriver: true,
        }),
        Animated.timing(opacity, {
          toValue: 0.4,
          duration: 700,
          useNativeDriver: true,
        }),
      ]),
    ).start();
  }, [opacity]);

  return (
    <Animated.View
      style={{
        opacity,
        height: 32,
        width: 200,
        borderRadius: 999,
        backgroundColor: colors.neutral[200],
      }}
    />
  );
}

export default function OnboardingReady() {
  const router = useRouter();
  const { user, profile, setProfile } = useAuthStore();
  const [loading, setLoading] = useState<"bill" | "dashboard" | null>(null);

  const completeOnboarding = async (next: "bill" | "dashboard") => {
    if (!user) return;
    setLoading(next);
    try {
      const { error: dbErr } = await supabase
        .from("profiles")
        .update({ onboarding_complete: true })
        .eq("user_id", user.id);
      if (dbErr) throw dbErr;
      const current = useAuthStore.getState().profile;
      if (current) setProfile({ ...current, onboarding_complete: true });
      if (next === "bill") {
        router.replace("/(main)/orders/create");
      } else {
        router.replace("/(main)/dashboard");
      }
    } catch (e: any) {
      console.error("Failed to complete onboarding:", e);
    } finally {
      setLoading(null);
    }
  };

  const checks = [
    {
      Icon: Phone,
      label: "Phone number",
      value: profile?.phone ? `+91 ${profile.phone}` : "—",
      ok: !!profile?.phone,
    },
    {
      Icon: Building2,
      label: "Business name",
      value: profile?.business_name ?? "—",
      ok: !!profile?.business_name,
    },
    {
      Icon: Receipt,
      label: "Bill prefix",
      value: profile?.bill_number_prefix ?? "INV",
      ok: true,
    },
    {
      Icon: QrCode,
      label: "UPI ID",
      value: profile?.upi_id ?? "Not set",
      ok: !!profile?.upi_id,
    },
  ];

  return (
    <ScrollView
      contentContainerStyle={{ flexGrow: 1 }}
      showsVerticalScrollIndicator={false}
    >
      <View className="flex-1 bg-white px-6 pt-12 pb-10">
        {/* Back */}
        <TouchableOpacity
          onPress={() => router.back()}
          className="mb-6 self-start"
        >
          <Text className="text-primary font-inter-medium text-sm">← Back</Text>
        </TouchableOpacity>

        {/* Progress */}
        <OnboardingProgress current={4} />

        {/* Celebration heading */}
        <View className="items-center mt-8 mb-6">
          <View className="w-20 h-20 rounded-full bg-green-100 items-center justify-center mb-4">
            <BadgeCheck
              size={48}
              color={colors.primary.dark}
              strokeWidth={1.8}
            />
          </View>
          <Text className="text-3xl font-inter-bold text-neutral-900 text-center">
            You are all set!
          </Text>
          <Text className="text-neutral-500 font-inter text-center mt-2">
            CreditBook is ready. Here is what you have configured:
          </Text>

          {/* Business identity chip */}
          <View className="mt-5">
            {!profile ? (
              <ShimmerChip />
            ) : (
              <View
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  backgroundColor: colors.success.bg,
                  borderWidth: 1,
                  borderColor: colors.success.light,
                  borderRadius: 999,
                  paddingHorizontal: 16,
                  paddingVertical: 8,
                  gap: 6,
                }}
              >
                <Store size={15} color={colors.primary.dark} strokeWidth={2} />
                <Text
                  style={{
                    fontSize: 14,
                    fontWeight: "600",
                    color: colors.success.dark,
                  }}
                  numberOfLines={1}
                >
                  {profile.business_name ?? "Your Business"}
                  {" • "}
                  {profile.bill_number_prefix ?? "INV"}-
                </Text>
              </View>
            )}
          </View>
        </View>

        {/* Setup summary */}
        <View className="bg-neutral-50 rounded-xl p-4 mb-6 gap-3">
          {checks.map((item) => (
            <View key={item.label} className="flex-row items-center gap-3">
              <View className="w-9 h-9 rounded-full bg-white border border-neutral-200 items-center justify-center">
                <item.Icon
                  size={18}
                  color={colors.neutral[700]}
                  strokeWidth={1.8}
                />
              </View>
              <View className="flex-1">
                <Text className="text-xs text-neutral-400 font-inter">
                  {item.label}
                </Text>
                <Text className="text-sm font-inter-medium text-neutral-800">
                  {item.value}
                </Text>
              </View>
              {item.ok ? (
                <CheckCircle2
                  size={18}
                  color={colors.primary.dark}
                  strokeWidth={2}
                />
              ) : (
                <Circle
                  size={18}
                  color={colors.neutral[300]}
                  strokeWidth={1.5}
                />
              )}
            </View>
          ))}
        </View>

        {/* Bank details nudge */}
        <View className="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-8 flex-row gap-3 items-start">
          <Info size={20} color={colors.warning.dark} strokeWidth={2} />
          <Text className="text-sm text-amber-700 font-inter flex-1">
            <Text className="font-inter-semibold">Add bank details</Text> in
            Profile to show IFSC & account number on PDF bills — required for
            NEFT/RTGS payments from customers.
          </Text>
        </View>

        {/* CTAs */}
        <Button
          title="📄  Create My First Bill"
          onPress={() => completeOnboarding("bill")}
          loading={loading === "bill"}
          disabled={loading !== null}
        />

        <TouchableOpacity
          onPress={() => completeOnboarding("dashboard")}
          disabled={loading !== null}
          className="mt-4 py-3 items-center"
        >
          <Text className="text-primary font-inter-semibold text-base">
            {loading === "dashboard" ? "Loading…" : "Go to Dashboard →"}
          </Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}
