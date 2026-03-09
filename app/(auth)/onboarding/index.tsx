import OnboardingProgress from "@/src/components/onboarding/OnboardingProgress";
import Button from "@/src/components/ui/Button";
import Input from "@/src/components/ui/Input";
import { supabase } from "@/src/services/supabase";
import { useAuthStore } from "@/src/store/authStore";
import { colors } from "@/src/utils/theme";
import { useRouter } from "expo-router";
import { Phone } from "lucide-react-native";
import { useEffect, useState } from "react";
import {
  Image,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Text,
  View,
} from "react-native";

export default function OnboardingPhone() {
  const router = useRouter();
  const { user, profile, setProfile, loading: profileLoading } = useAuthStore();
  const [phone, setPhone] = useState(profile?.phone ?? "");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // Guard: only redirect to role screen once profile is fully loaded
  useEffect(() => {
    if (!profileLoading && profile !== null && !profile.role) {
      router.replace("/(auth)/onboarding/role" as any);
    }
  }, [profile, profileLoading, router]);

  const handleContinue = async () => {
    const cleaned = phone.trim().replace(/\D/g, "");
    if (cleaned.length < 10) {
      setError("Enter a valid 10-digit mobile number.");
      return;
    }
    if (!user) return;
    setError(null);
    setLoading(true);
    try {
      const { error: dbErr } = await supabase
        .from("profiles")
        .update({ phone: cleaned })
        .eq("user_id", user.id);
      if (dbErr) throw dbErr;
      const current = useAuthStore.getState().profile;
      if (current) setProfile({ ...current, phone: cleaned });
      router.push("/(auth)/onboarding/business" as any);
    } catch (e: any) {
      setError(e.message ?? "Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={{ flex: 1 }}
    >
      <ScrollView
        contentContainerStyle={{ flexGrow: 1 }}
        keyboardShouldPersistTaps="handled"
      >
        <View className="flex-1 bg-white px-6 pt-12 pb-8">
          {/* Logo */}
          <Image
            source={require("../../../assets/images/logo.png")}
            className="w-40 mb-8 self-center"
            resizeMode="contain"
          />

          {/* Progress */}
          <OnboardingProgress current={2} />

          {/* Heading */}
          <Text className="text-2xl font-inter-bold text-neutral-900 mt-6 mb-1">
            What is your phone number?
          </Text>
          <Text className="text-neutral-500 font-inter mb-8">
            Your customers will see this number on bills and reminders.
          </Text>

          {/* Input */}
          <Text className="font-inter-semibold text-neutral-800 mb-2">
            Mobile Number
          </Text>
          <Input
            placeholder="e.g. 9876543210"
            value={phone}
            onChangeText={(t) => {
              setPhone(t);
              setError(null);
            }}
            keyboardType="numeric"
            icon={
              <Phone size={20} color={colors.neutral[500]} strokeWidth={1.8} />
            }
            iconPosition="left"
            error={error ?? undefined}
          />
          <Text className="text-xs text-neutral-400 font-inter mt-1 mb-8">
            Indian numbers only — no country code needed.
          </Text>

          <Button
            title="Continue →"
            onPress={handleContinue}
            loading={loading}
          />
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
