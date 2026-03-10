import { supabase } from "@/src/services/supabase";
import { useAuthStore } from "@/src/store/authStore";
import { useRouter } from "expo-router";
import { CalendarDays, CheckCircle2 } from "lucide-react-native";
import { useState } from "react";
import { Image, Text, TouchableOpacity, View } from "react-native";

export default function OnboardingReady() {
  const router = useRouter();
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
      if (next === "customer") {
        router.replace("/(main)/customers" as any);
      } else {
        router.replace("/(main)/dashboard");
      }
    } catch (e: any) {
      console.error("Failed to complete onboarding:", e);
    } finally {
      setLoading(null);
    }
  };

  const businessLabel = `${profile?.business_name ?? "Business Name"} ${profile?.bill_number_prefix ?? "INV"}-`;

  return (
    <View className="flex-1 bg-background">
      {/* ── Main content — centred vertically ── */}
      <View className="flex-1 items-center justify-center px-8">
        {/* Check circle + illustration stack */}
        <View className="items-center mb-8">
          {/* Green filled circle with check */}
          <View
            className="w-20 h-20 rounded-full bg-primary items-center justify-center"
            style={{
              zIndex: 2,
              shadowColor: "#22C55E",
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: 0.35,
              shadowRadius: 10,
              elevation: 6,
            }}
          >
            <CheckCircle2 size={44} color="#FFFFFF" strokeWidth={2.2} />
          </View>

          {/* Shopkeeper illustration — overlaps below the circle */}
          <View
            className="w-[88px] h-[88px] rounded-full bg-neutral-100 items-center justify-center overflow-hidden"
            style={{ marginTop: -16 }}
          >
            <Image
              source={require("../../../../assets/images/role-user.png")}
              style={{ width: 80, height: 80 }}
              resizeMode="contain"
            />
          </View>
        </View>

        {/* Title */}
        <Text className="text-2xl font-extrabold text-textDark text-center mb-3">
          You're all set!
        </Text>

        {/* Subtitle */}
        <Text className="text-[15px] text-textSecondary text-center leading-[22px] mb-7">
          CreditBook is ready to replace your khata book. Start by adding your
          first customer.
        </Text>

        {/* Info chips */}
        <View className="flex-row flex-wrap gap-2.5 justify-center">
          {/* Business + prefix chip */}
          <View className="flex-row items-center gap-1.5 border-[1.5px] border-primary rounded-full px-3.5 py-[7px] bg-white">
            <CalendarDays size={14} color="#22C55E" strokeWidth={2} />
            <Text
              className="text-[13px] font-semibold text-primary"
              numberOfLines={1}
            >
              {businessLabel}
            </Text>
          </View>

          {/* Ledger ready chip */}
          <View className="flex-row items-center gap-1.5 border-[1.5px] border-primary rounded-full px-3.5 py-[7px] bg-white">
            <CheckCircle2 size={14} color="#22C55E" strokeWidth={2.5} />
            <Text className="text-[13px] font-semibold text-primary">
              Ledger ready
            </Text>
          </View>
        </View>
      </View>

      {/* ── Bottom actions ── */}
      <View className="px-6 pb-10">
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
