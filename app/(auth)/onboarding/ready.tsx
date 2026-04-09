import { useToast } from "@/src/components/feedback/Toast";
import { supabase } from "@/src/services/supabase";
import { useAuthStore } from "@/src/store/authStore";
import { CalendarDays, CheckCircle2 } from "lucide-react-native";
import { useState } from "react";
import { Image, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";

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
        pathname: "/(main)/customers",
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
        <Text className="mb-3 text-2xl font-extrabold text-center text-textDark">
          {"You're all set!"}
        </Text>

        {/* Subtitle */}
        <Text className="text-[15px] text-textSecondary text-center leading-[22px] mb-7">
          {
            "KredBook is ready to replace your khata book. Start tracking credit instantly."
          }
        </Text>

        <View className="flex-row flex-wrap gap-2.5 justify-center">
          <View
            className="flex-row items-center gap-1.5 border-[1.5px] rounded-full px-3.5 py-[7px] bg-white"
            style={{ borderColor: hasBusinessSetup ? "#22C55E" : "#D1D5DB" }}
          >
            <CalendarDays
              size={14}
              color={hasBusinessSetup ? "#22C55E" : "#9CA3AF"}
              strokeWidth={2}
            />
            <Text
              className={`text-[13px] font-semibold ${hasBusinessSetup ? "text-primary" : "text-textSecondary"}`}
              numberOfLines={1}
            >
              {businessLabel}
            </Text>
          </View>

          <View className="flex-row items-center gap-1.5 border-[1.5px] border-primary rounded-full px-3.5 py-[7px] bg-white">
            <CheckCircle2 size={14} color="#22C55E" strokeWidth={2.5} />
            <Text className="text-[13px] font-semibold text-primary">
              Ledger ready
            </Text>
          </View>
        </View>
      </View>

      <View className="px-6 pb-10">
        <TouchableOpacity
          onPress={handleAddPerson}
          disabled={isLoading}
          activeOpacity={0.85}
          className={`rounded-full py-[17px] items-center ${isLoading ? "bg-neutral-300" : "bg-primary"}`}
        >
          <Text className="text-base font-bold text-white">
            {isLoading ? "Loading…" : "Add Your First Person"}
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={handleGoDashboard}
          disabled={isLoading}
          className="items-center mt-4"
        >
          <Text className="text-primary font-semibold text-sm">
            Go to Dashboard
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}
