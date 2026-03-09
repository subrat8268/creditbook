// Step 3 of 4 — Business setup
import OnboardingProgress from "@/src/components/onboarding/OnboardingProgress";
import Button from "@/src/components/ui/Button";
import Input from "@/src/components/ui/Input";
import { supabase } from "@/src/services/supabase";
import { useAuthStore } from "@/src/store/authStore";
import { colors } from "@/src/utils/theme";
import { useRouter } from "expo-router";
import { useState } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

export default function OnboardingBusiness() {
  const router = useRouter();
  const { user, profile, setProfile } = useAuthStore();

  const [businessName, setBusinessName] = useState(
    profile?.business_name ?? "",
  );
  const [gstin, setGstin] = useState(profile?.gstin ?? "");
  const [upiId, setUpiId] = useState(profile?.upi_id ?? "");
  const [bankName, setBankName] = useState(profile?.bank_name ?? "");
  const [accountNumber, setAccountNumber] = useState(
    profile?.account_number ?? "",
  );
  const [ifscCode, setIfscCode] = useState(profile?.ifsc_code ?? "");
  const [billPrefix, setBillPrefix] = useState(
    profile?.bill_number_prefix ?? "INV",
  );
  const [nameError, setNameError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleContinue = async () => {
    if (!businessName.trim()) {
      setNameError("Business name is required.");
      return;
    }
    if (!user) return;
    setNameError(null);
    setLoading(true);
    try {
      const updates = {
        business_name: businessName.trim(),
        gstin: gstin.trim() || null,
        upi_id: upiId.trim() || null,
        bank_name: bankName.trim() || null,
        account_number: accountNumber.trim() || null,
        ifsc_code: ifscCode.trim().toUpperCase() || null,
        bill_number_prefix: billPrefix.trim().toUpperCase() || "INV",
      };
      const { error: dbErr } = await supabase
        .from("profiles")
        .update(updates)
        .eq("user_id", user.id);
      if (dbErr) throw dbErr;
      const current = useAuthStore.getState().profile;
      if (current) setProfile({ ...current, ...updates });
      router.push("/(auth)/onboarding/ready" as any);
    } catch (e: any) {
      setNameError(e.message ?? "Something went wrong.");
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
          {/* Back */}
          <TouchableOpacity
            onPress={() => router.back()}
            className="mb-6 self-start"
          >
            <Text className="text-primary font-inter-medium text-sm">
              ← Back
            </Text>
          </TouchableOpacity>

          {/* Progress */}
          <OnboardingProgress current={3} />

          {/* Heading */}
          <Text className="text-2xl font-inter-bold text-neutral-900 mt-6 mb-1">
            Tell us about your business
          </Text>
          <Text className="text-neutral-500 font-inter mb-8">
            This appears on all your bills and PDFs.
          </Text>

          {/* Business Name */}
          <Text className="font-inter-semibold text-neutral-800 mb-2">
            Business Name <Text className="text-red-500">*</Text>
          </Text>
          <Input
            placeholder="e.g. Sharma General Store"
            value={businessName}
            onChangeText={(t) => {
              setBusinessName(t);
              setNameError(null);
            }}
            error={nameError ?? undefined}
          />

          {/* GSTIN */}
          <Text className="font-inter-semibold text-neutral-800 mb-2 mt-5">
            GSTIN{" "}
            <Text className="text-neutral-400 font-inter text-sm">
              (optional)
            </Text>
          </Text>
          <Input
            placeholder="e.g. 22AAAAA0000A1Z5"
            value={gstin}
            onChangeText={(t) => setGstin(t.toUpperCase())}
          />

          {/* UPI ID */}
          <View className="flex-row items-center mb-2 mt-5">
            <Text className="font-inter-semibold text-neutral-800">UPI ID</Text>
            <View style={styles.optionalBadge}>
              <Text style={styles.optionalText}>optional</Text>
            </View>
          </View>
          <Input
            placeholder="e.g. sharma@upi"
            value={upiId}
            onChangeText={setUpiId}
            keyboardType="email-address"
          />

          {/* Bank Name */}
          <View className="flex-row items-center mb-2 mt-5">
            <Text className="font-inter-semibold text-neutral-800">
              Bank Name
            </Text>
            <View style={styles.optionalBadge}>
              <Text style={styles.optionalText}>optional</Text>
            </View>
          </View>
          <Input
            placeholder="e.g. State Bank of India"
            value={bankName}
            onChangeText={setBankName}
          />

          {/* Account Number */}
          <View className="flex-row items-center mb-2 mt-5">
            <Text className="font-inter-semibold text-neutral-800">
              Account Number
            </Text>
            <View style={styles.optionalBadge}>
              <Text style={styles.optionalText}>optional</Text>
            </View>
          </View>
          <Input
            placeholder="e.g. 00112233445566"
            value={accountNumber}
            onChangeText={setAccountNumber}
            keyboardType="numeric"
          />

          {/* IFSC Code */}
          <View className="flex-row items-center mb-2 mt-5">
            <Text className="font-inter-semibold text-neutral-800">
              IFSC Code
            </Text>
            <View style={styles.optionalBadge}>
              <Text style={styles.optionalText}>optional</Text>
            </View>
          </View>
          <Input
            placeholder="e.g. SBIN0001234"
            value={ifscCode}
            onChangeText={(t) => setIfscCode(t.toUpperCase())}
          />

          {/* Bill Prefix */}
          <Text className="font-inter-semibold text-neutral-800 mb-2 mt-5">
            Bill Number Prefix{" "}
            <Text className="text-neutral-400 font-inter text-sm">
              (e.g. INV, BILL, CB)
            </Text>
          </Text>
          <Input
            placeholder="INV"
            value={billPrefix}
            onChangeText={(t) => setBillPrefix(t.toUpperCase())}
          />
          <Text className="text-xs text-neutral-400 font-inter mt-1 mb-8">
            Your bills will be numbered INV-001, INV-002 etc.
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

const styles = StyleSheet.create({
  optionalBadge: {
    marginLeft: 8,
    backgroundColor: colors.neutral.bg,
    borderRadius: 999,
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  optionalText: {
    fontSize: 11,
    color: colors.neutral[500],
  },
});
