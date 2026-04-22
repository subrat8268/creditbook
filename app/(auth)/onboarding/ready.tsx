import { useToast } from "@/src/components/feedback/Toast";
import Button from "@/src/components/ui/Button";
import { supabase } from "@/src/services/supabase";
import { useAuthStore } from "@/src/store/authStore";
import { colors, spacing, typography } from "@/src/utils/theme";
import { useRouter } from "expo-router";
import { CalendarDays, CheckCircle2 } from "lucide-react-native";
import { useState } from "react";
import { Image, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function OnboardingReady() {
  const { show } = useToast();
  const { user, profile, fetchProfile } = useAuthStore();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const completeOnboarding = async () => {
    if (!user) return false;
    setIsLoading(true);
    try {
      const { error: dbErr } = await supabase
        .from("profiles")
        .update({ onboarding_complete: true })
        .eq("user_id", user.id);
      if (dbErr) throw dbErr;
      // Sync global state — _layout.tsx routing guard will react and navigate.
      await fetchProfile(user.id);
      return true;
    } catch (e: any) {
      console.error("Onboarding completion failed:", e);
      show({
        message: "Failed to complete onboarding. Please try again.",
        type: "error",
      });
      setIsLoading(false);
      return false;
    }
  };

  const handleAddPerson = async () => {
    const ok = await completeOnboarding();
    if (ok) {
      router.replace({
        pathname: "/(main)/people",
        params: { action: "add" },
      });
    }
  };

  const handleGoDashboard = async () => {
    const ok = await completeOnboarding();
    if (ok) {
      router.replace("/(main)/dashboard" as any);
    }
  };

  const hasBusinessSetup = !!profile?.business_name;
  const businessLabel = hasBusinessSetup
    ? `${profile!.business_name} · ${profile?.bill_number_prefix ?? "INV"}`
    : "Setup pending";

  return (
    <SafeAreaView className="flex-1 bg-background" edges={["top", "bottom"]}>
      <View className="items-center justify-center flex-1 px-8">
        <View className="items-center mb-8">
          <Image
            source={require("../../../assets/images/large-check.png")}
            style={{ width: 120, height: 120 }}
            resizeMode="contain"
          />
        </View>

        {/* Title */}
        <Text style={[typography.screenTitle, { textAlign: "center", marginBottom: spacing.sm }]}> 
          {"You're all set!"}
        </Text>

        {/* Subtitle */}
        <Text style={[typography.body, { color: colors.textSecondary, textAlign: "center", lineHeight: 22, marginBottom: spacing.xl }]}> 
          {
            "KredBook is ready to replace your khata book. Start tracking credit instantly."
          }
        </Text>

        <View className="flex-row flex-wrap gap-2.5 justify-center">
          <View
            className="flex-row items-center gap-1.5 border rounded-full px-3.5 py-[7px] bg-white"
            style={{ borderColor: hasBusinessSetup ? colors.success : colors.border }}
          >
            <CalendarDays
              size={14}
              color={hasBusinessSetup ? colors.success : colors.textSecondary}
              strokeWidth={2}
            />
            <Text
              className="text-[13px] font-semibold"
              style={{ color: hasBusinessSetup ? colors.success : colors.textSecondary }}
              numberOfLines={1}
            >
              {businessLabel}
            </Text>
          </View>

          <View className="flex-row items-center gap-1.5 border rounded-full px-3.5 py-[7px] bg-white" style={{ borderColor: colors.primary }}>
            <CheckCircle2 size={14} color={colors.success} strokeWidth={2.5} />
            <Text className="text-[13px] font-semibold text-primary">
              Ledger ready
            </Text>
          </View>
        </View>
      </View>

      <View className="px-6 pb-10">
        <Button
          title={isLoading ? "Loading…" : "Add Your First Customer"}
          onPress={handleAddPerson}
          disabled={isLoading}
          loading={isLoading}
        />
        <View style={{ marginTop: spacing.md }}>
          <Button
            title="Go to Dashboard"
            onPress={handleGoDashboard}
            disabled={isLoading}
            variant="outline"
          />
        </View>
      </View>
    </SafeAreaView>
  );
}
