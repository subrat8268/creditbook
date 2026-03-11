import { useToast } from "@/src/components/feedback/Toast";
import { Sentry } from "@/src/services/sentry";
import { supabase } from "@/src/services/supabase";
import { useAuthStore } from "@/src/store/authStore";
import { useRouter } from "expo-router";
import { CalendarDays, CheckCircle2 } from "lucide-react-native";
import { useState } from "react";
import { Image, Text, TouchableOpacity, View } from "react-native";

export default function OnboardingReady() {
  const router = useRouter();
  const { show } = useToast();
  const { user, profile, setProfile } = useAuthStore();
  const [loading, setLoading] = useState<"customer" | "dashboard" | null>(null);

  const completeOnboarding = async (next: "customer" | "dashboard") => {
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

      Sentry.addBreadcrumb({
        category: "auth",
        message: "onboarding_complete",
        level: "info",
        data: { userId: user?.id, next },
      });

      if (next === "customer") {
        router.replace("/(main)/customers" as any);
      } else {
        router.replace("/(main)/dashboard");
      }
    } catch (e: any) {
      console.error("Onboarding completion failed:", e);
      show({
        message: "Failed to complete onboarding. Please try again.",
        type: "error",
      });
    } finally {
      setLoading(null);
    }
  };

  const businessLabel = `${profile?.business_name ?? "Business Name"} · ${profile?.bill_number_prefix ?? "INV"}`;

  return (
    <View className="flex-1 bg-background">
      <View className="flex-1 items-center justify-center px-8">
        <View className="items-center mb-8">
          <Image
            source={require("../../../assets/images/large-check.png")}
            style={{ width: 120, height: 120 }}
            resizeMode="contain"
          />

          <Image
            source={require("../../../assets/images/ready-image.png")}
            style={{ width: 80, height: 80 }}
            resizeMode="contain"
          />
        </View>

        {/* Title */}
        <Text className="text-2xl font-extrabold text-textDark text-center mb-3">
          {"You're all set!"}
        </Text>

        {/* Subtitle */}
        <Text className="text-[15px] text-textSecondary text-center leading-[22px] mb-7">
          {
            "CreditBook is ready to replace your khata book. Start by adding your first customer."
          }
        </Text>

        <View className="flex-row flex-wrap gap-2.5 justify-center">
          <View className="flex-row items-center gap-1.5 border-[1.5px] border-primary rounded-full px-3.5 py-[7px] bg-white">
            <CalendarDays size={14} color="#22C55E" strokeWidth={2} />
            <Text
              className="text-[13px] font-semibold text-primary"
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

      <View className="px-6 pb-16">
        <TouchableOpacity
          onPress={() => completeOnboarding("customer")}
          disabled={loading !== null}
          activeOpacity={0.85}
          className={`rounded-full py-[17px] items-center ${
            loading !== null ? "bg-neutral-300" : "bg-primary"
          }`}
        >
          <Text className="text-white text-base font-bold">
            {loading === "customer" ? "Loading…" : "Add Your First Customer"}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => completeOnboarding("dashboard")}
          disabled={loading !== null}
          className="items-center mt-4 py-1"
        >
          <Text className="text-sm font-semibold text-primary underline">
            {loading === "dashboard" ? "Loading…" : "Go to Dashboard"}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}
