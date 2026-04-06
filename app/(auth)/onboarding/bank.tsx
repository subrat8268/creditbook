// Step 4 of onboarding — Business Setup (Step 2 of 2) — Bank Details
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
import { ArrowLeft } from "lucide-react-native";

export default function OnboardingBank() {
  const router = useRouter();
  const { user, profile, setProfile } = useAuthStore();

  const [upiId, setUpiId] = useState(profile?.upi_id ?? "");
  const [bankName, setBankName] = useState(profile?.bank_name ?? "");
  const [accountNumber, setAccountNumber] = useState(
    profile?.account_number ?? "",
  );
  const [ifscCode, setIfscCode] = useState(profile?.ifsc_code ?? "");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleContinue = async () => {
    if (!user) return;
    setError(null);
    setLoading(true);
    try {
      // Only include fields that have a value — columns have NOT NULL constraints
      const updates: Record<string, string> = {};
      if (upiId.trim()) updates.upi_id = upiId.trim();
      if (bankName.trim()) updates.bank_name = bankName.trim();
      if (accountNumber.trim()) updates.account_number = accountNumber.trim();
      if (ifscCode.trim()) updates.ifsc_code = ifscCode.trim().toUpperCase();

      if (Object.keys(updates).length > 0) {
        const { error: dbErr } = await supabase
          .from("profiles")
          .update(updates)
          .eq("user_id", user.id);
        if (dbErr) throw dbErr;
        const current = useAuthStore.getState().profile;
        if (current) setProfile({ ...current, ...updates });
      }

      router.push("/(auth)/onboarding/ready" as any);
    } catch (e: any) {
      setError(e.message ?? "Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  const handleSkip = () => {
    router.push("/(auth)/onboarding/ready" as any);
  };

  const OptionalBadge = () => (
    <View className="bg-neutral-100 rounded-md px-2 py-0.5 ml-2">
      <Text className="text-[11px] font-semibold text-textSecondary uppercase tracking-wide">
        OPTIONAL
      </Text>
    </View>
  );

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
            Step 3 of 3
          </Text>
          <View className="flex-row gap-1.5">
            <View className="flex-1 h-1 rounded-full bg-primary" />
            <View className="flex-1 h-1 rounded-full bg-primary" />
            <View className="flex-1 h-1 rounded-full bg-primary" />
          </View>
        </View>

        {/* ── Heading ── */}
        <Text className="text-2xl font-extrabold text-textDark mb-1">
          Bank & Payment Info
        </Text>
        <Text className="text-sm text-textSecondary mb-6">
          Your customers will see this on their bills.
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
          {/* UPI ID */}
          <View className="flex-row items-center mb-2">
            <Text className="text-sm font-semibold text-neutral-800">
              UPI ID
            </Text>
            <OptionalBadge />
          </View>
          <TextInput
            placeholder="e.g. sharma@upi"
            placeholderTextColor="#AEAEB2"
            value={upiId}
            onChangeText={setUpiId}
            keyboardType="email-address"
            autoCapitalize="none"
            className="border-[1.5px] border-border rounded-xl px-3.5 py-3 text-[15px] text-textDark bg-white"
          />

          {/* Bank Name */}
          <View className="flex-row items-center mt-5 mb-2">
            <Text className="text-sm font-semibold text-neutral-800">
              Bank Name
            </Text>
            <OptionalBadge />
          </View>
          <TextInput
            placeholder="e.g. State Bank of India"
            placeholderTextColor="#AEAEB2"
            value={bankName}
            onChangeText={setBankName}
            className="border-[1.5px] border-border rounded-xl px-3.5 py-3 text-[15px] text-textDark bg-white"
          />

          {/* Account Number */}
          <View className="flex-row items-center mt-5 mb-2">
            <Text className="text-sm font-semibold text-neutral-800">
              Account Number
            </Text>
            <OptionalBadge />
          </View>
          <TextInput
            placeholder="e.g. 00112233445566"
            placeholderTextColor="#AEAEB2"
            value={accountNumber}
            onChangeText={setAccountNumber}
            keyboardType="numeric"
            className="border-[1.5px] border-border rounded-xl px-3.5 py-3 text-[15px] text-textDark bg-white"
          />

          {/* IFSC Code */}
          <View className="flex-row items-center mt-5 mb-2">
            <Text className="text-sm font-semibold text-neutral-800">
              IFSC Code
            </Text>
            <OptionalBadge />
          </View>
          <TextInput
            placeholder="e.g. SBIN0001234"
            placeholderTextColor="#AEAEB2"
            value={ifscCode}
            onChangeText={(t) => setIfscCode(t.toUpperCase())}
            autoCapitalize="characters"
            className="border-[1.5px] border-border rounded-xl px-3.5 py-3 text-[15px] text-textDark bg-white"
          />
        </View>

        {/* ── Error ── */}
        {error && (
          <Text className="text-danger-strong text-[13px] mt-3 text-center">
            {error}
          </Text>
        )}
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
