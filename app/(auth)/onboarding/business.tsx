// Step 3 of onboarding — Business Setup (Step 1 of 2)
import Button from "@/src/components/ui/Button";
import { supabase } from "@/src/services/supabase";
import { useAuthStore } from "@/src/store/authStore";
import { colors } from "@/src/utils/theme";
import { useRouter } from "expo-router";
import { useState } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { ArrowLeft, ChevronDown, ChevronUp } from "lucide-native";

export default function OnboardingBusiness() {
  const router = useRouter();
  const { user, profile, setProfile } = useAuthStore();

  const [businessName, setBusinessName] = useState(
    profile?.business_name ?? "",
  );
  const [gstin, setGstin] = useState(profile?.gstin ?? "");
  const [billPrefix, setBillPrefix] = useState(
    profile?.bill_number_prefix ?? "INV",
  );
  const [nameError, setNameError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [showAdvanced, setShowAdvanced] = useState(false);

  const handleContinue = async () => {
    if (!businessName.trim()) {
      setNameError("Business name is required.");
      return;
    }
    if (!user) return;
    setNameError(null);
    setLoading(true);
    try {
      const updates: Record<string, string> = {
        business_name: businessName.trim(),
        bill_number_prefix: billPrefix.trim().toUpperCase() || "INV",
      };
      if (gstin.trim()) updates.gstin = gstin.trim().toUpperCase();
      const { error: dbErr } = await supabase
        .from("profiles")
        .update(updates)
        .eq("user_id", user.id);
      if (dbErr) throw dbErr;
      const current = useAuthStore.getState().profile;
      if (current) setProfile({ ...current, ...updates });
      router.push("/(auth)/onboarding/bank" as any);
    } catch (e: any) {
      setNameError(e.message ?? "Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  const handleSkip = () => {
    router.push("/(auth)/onboarding/ready" as any);
  };

  return (
    <SafeAreaView className="flex-1 bg-background" edges={["top", "bottom"]}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={{ flex: 1 }}
        keyboardVerticalOffset={Platform.OS === "ios" ? 40 : 0}
      >
        <ScrollView
          className="flex-1"
          contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 140 }}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <TouchableOpacity
            onPress={() => router.back()}
            className="w-10 h-10 rounded-full border border-border items-center justify-center mt-2 mb-5"
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            <ArrowLeft size={20} color={colors.textPrimary} strokeWidth={2} />
          </TouchableOpacity>
          {/* ── Progress ── */}
          <View className="mt-5 mb-6">
            <Text className="text-[13px] text-textSecondary mb-2">
              Step 1 of 2
            </Text>
            <View className="flex-row gap-1.5">
              <View className="flex-1 h-1 rounded-full bg-primary" />
              <View className="flex-1 h-1 rounded-full bg-neutral-200" />
            </View>
          </View>

          {/* ── Heading ── */}
          <Text className="text-2xl font-extrabold text-textDark mb-1">
            Set up your business
          </Text>
          <Text className="text-sm text-textSecondary mb-6">
            Just your business name is enough to get started!
          </Text>

          {/* ── Card ── */}
          <View
            className="bg-white rounded-2xl p-5"
            style={{
              shadowColor: "#000",
              shadowOffset: { width: 0, height: 1 },
              shadowOpacity: 0.05,
              shadowRadius: 4,
              elevation: 2,
            }}
          >
            {/* Business Name */}
            <Text className="text-sm font-semibold text-neutral-800 mb-2">
              Business Name <Text className="text-danger-strong">*</Text>
            </Text>
            <TextInput
              placeholder="e.g. Acme Corp"
              placeholderTextColor="#AEAEB2"
              value={businessName}
              onChangeText={(t) => {
                setBusinessName(t);
                setNameError(null);
              }}
              className="border-[1.5px] rounded-xl px-3.5 py-3 text-[15px] text-textDark bg-white"
              style={{ borderColor: nameError ? "#DC2626" : "#E5E7EB" }}
            />
            {nameError && (
              <Text className="text-danger-strong text-xs mt-1">{nameError}</Text>
            )}

            {/* Advanced Settings Toggle */}
            <TouchableOpacity
              onPress={() => setShowAdvanced(!showAdvanced)}
              className="flex-row items-center justify-between mt-5 py-2"
              activeOpacity={0.7}
            >
              <Text className="text-sm font-semibold text-textSecondary">
                Advanced Settings (optional)
              </Text>
              {showAdvanced ? (
                <View style={{ transform: [{ rotate: "180deg" }] }}>
                  <ChevronDown size={18} color={colors.textSecondary} />
                </View>
              ) : (
                <ChevronDown size={18} color={colors.textSecondary} />
              )}
            </TouchableOpacity>

            {showAdvanced && (
              <>
                {/* GSTIN */}
                <View className="flex-row items-center mt-4 mb-2 gap-2">
                  <Text className="text-sm font-semibold text-neutral-800">
                    GSTIN
                  </Text>
                  <View className="bg-neutral-100 rounded-md px-2 py-0.5">
                    <Text className="text-[11px] font-semibold text-textSecondary uppercase tracking-wide">
                      OPTIONAL
                    </Text>
                  </View>
                </View>
                <TextInput
                  placeholder="27AAAAA0000A1Z5"
                  placeholderTextColor="#AEAEB2"
                  value={gstin}
                  onChangeText={(t) => setGstin(t.toUpperCase())}
                  autoCapitalize="characters"
                  className="border-[1.5px] border-border rounded-xl px-3.5 py-3 text-[15px] text-textDark bg-white"
                />
                <Text className="text-xs text-textMuted mt-1.5">
                  You can add this later from Profile → Settings
                </Text>

                {/* Entry Prefix */}
                <Text className="text-sm font-semibold text-neutral-800 mt-5 mb-2">
                  Entry Prefix
                </Text>
                <TextInput
                  placeholder="INV"
                  placeholderTextColor="#AEAEB2"
                  value={billPrefix}
                  onChangeText={(t) => setBillPrefix(t.toUpperCase())}
                  autoCapitalize="characters"
                  className="border-[1.5px] border-border rounded-xl px-3.5 py-3 text-[15px] text-textDark bg-white"
                />
                <Text className="text-xs text-textMuted mt-1.5">
                  Your entries will be numbered {billPrefix || "INV"}-001,{" "}
                  {billPrefix || "INV"}-002...
                </Text>
              </>
            )}
          </View>
        </ScrollView>

        <View className="px-5 pb-6">
          <Button
            title={loading ? "Saving…" : "Continue"}
            onPress={handleContinue}
            disabled={loading}
            loading={loading}
          />
          <TouchableOpacity onPress={handleSkip} className="items-center mt-3">
            <Text className="text-textSecondary text-sm font-medium">
              Skip for now
            </Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
