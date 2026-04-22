import { useState } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { Phone, AlertCircle, CheckCircle2 } from "lucide-react-native";
import Button from "@/src/components/ui/Button";
import Input from "@/src/components/ui/Input";
import { colors, spacing, typography } from "@/src/utils/theme";
import { usePhoneSetup } from "@/src/hooks/usePhoneSetup";
import { useAuthStore } from "@/src/store/authStore";

export default function PhoneSetup() {
  const router = useRouter();
  const { profile } = useAuthStore();
  const { loading, error, discoveredLedgers, savePhone, setError } =
    usePhoneSetup();

  const [phone, setPhone] = useState("");
  const [showLedgers, setShowLedgers] = useState(false);

  const handleContinue = async () => {
    const result = await savePhone(phone);

    if (result.success) {
      // Show discovered ledgers if any
      if (result.ledgers && result.ledgers.length > 0) {
        setShowLedgers(true);
      } else {
        // No ledgers found, proceed to onboarding or dashboard
        proceedToNext();
      }
    }
  };

  const proceedToNext = () => {
    // After phone setup, go directly to business setup (bypassing role selection)
    router.replace("/(auth)/onboarding/business" as any);
  };

  // If showing ledgers, render the ledgers view
  if (showLedgers && discoveredLedgers.length > 0) {
    return (
      <SafeAreaView className="flex-1 bg-background" edges={["top", "bottom"]}>
        <ScrollView
          contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 32 }}
          showsVerticalScrollIndicator={false}
        >
          {/* Success Icon */}
          <View className="items-center mt-8 mb-6">
            <View
              className="w-16 h-16 rounded-full items-center justify-center"
              style={{ backgroundColor: colors.successBg }}
            >
               <CheckCircle2 size={32} color={colors.success} strokeWidth={2} />
            </View>
          </View>

          {/* Title */}
           <Text style={[typography.screenTitle, { textAlign: "center", marginBottom: spacing.xs }]}> 
             Great news!
           </Text>
           <Text style={[typography.body, { textAlign: "center", color: colors.textSecondary, marginBottom: spacing.xl }]}> 
              We found {discoveredLedgers.length} business
             {discoveredLedgers.length > 1 ? "s" : ""} who already have your
             ledger
          </Text>

          {/* Ledgers List */}
          <View className="gap-3 mb-6">
            {discoveredLedgers.map((ledger, index) => (
              <View
                key={index}
                className="bg-surface rounded-2xl p-4 border border-border"
                style={{
                  shadowColor: colors.textPrimary,
                  shadowOffset: { width: 0, height: 1 },
                  shadowOpacity: 0.04,
                  shadowRadius: 4,
                  elevation: 2,
                }}
              >
                <View className="flex-row items-start justify-between mb-2">
                  <View className="flex-1">
                    <Text className="text-base font-bold text-textPrimary mb-0.5">
                      {ledger.vendor_name || "Unknown Vendor"}
                    </Text>
                    <Text className="text-[13px] text-textSecondary">
                      {ledger.vendor_business_name || "Business"}
                    </Text>
                  </View>
                  <View className="items-end">
                    <Text
                      className="text-base font-bold"
                      style={{
                        color:
                          ledger.balance >= 0 ? colors.primary : colors.danger,
                      }}
                    >
                      ₹{Math.abs(ledger.balance).toFixed(2)}
                    </Text>
                    <Text className="text-[11px] text-textSecondary">
                      {ledger.balance >= 0 ? "You'll give" : "You'll get"}
                    </Text>
                  </View>
                </View>
              </View>
            ))}
          </View>

          {/* Info box */}
           <View className="bg-primary-light rounded-xl p-4 mb-6">
             <Text style={[typography.body, { lineHeight: 22 }]}> 
               You can now view your ledgers from these vendors directly in your
               KredBook app. They can also share updated ledgers with you via
               WhatsApp.
            </Text>
          </View>

          {/* Continue button */}
          <Button title="Continue to KredBook" onPress={proceedToNext} />
        </ScrollView>
      </SafeAreaView>
    );
  }

  // Default phone entry view
  return (
    <SafeAreaView className="flex-1 bg-background" edges={["top", "bottom"]}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        className="flex-1"
      >
        <ScrollView
          contentContainerStyle={{
            paddingHorizontal: 20,
            paddingBottom: 32,
            flexGrow: 1,
          }}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* Icon */}
          <View className="items-center mt-12 mb-8">
            <View
              className="w-20 h-20 rounded-full items-center justify-center"
              style={{ backgroundColor: colors.primaryLight }}
            >
              <Phone size={36} color={colors.primary} strokeWidth={2} />
            </View>
          </View>

          {/* Title */}
           <Text style={[typography.screenTitle, { textAlign: "center", marginBottom: spacing.xs }]}> 
             One last thing!
           </Text>
           <Text style={[typography.body, { textAlign: "center", color: colors.textSecondary, marginBottom: spacing.xl }]}> 
             Add your phone number to automatically link your ledgers across
             vendors
           </Text>

          {/* Phone input */}
           <View className="mb-4">
             <Text style={[typography.caption, { color: colors.textPrimary, fontWeight: "600", marginBottom: spacing.sm }]}> 
               Phone Number
             </Text>
             <View className="flex-row items-center gap-2">
               <View
                 className="bg-surface border rounded-xl items-center justify-center"
                 style={{ width: 68, height: 48, borderColor: error ? colors.danger : colors.border }}
               >
                 <Text style={[typography.body, { color: colors.textSecondary }]}>+91</Text>
               </View>
               <View style={{ flex: 1 }}>
                 <Input
                   placeholder="9876543210"
                   value={phone}
                   onChangeText={(text) => {
                     setPhone(text);
                     setError(null);
                   }}
                   error={error ?? undefined}
                   keyboardType="numeric"
                   variant="white"
                 />
               </View>
             </View>
             {error && (
                <View className="flex-row items-center mt-2 gap-1.5">
                  <AlertCircle size={14} color={colors.danger} />
                <Text className="text-[13px] text-danger flex-1">{error}</Text>
              </View>
            )}
          </View>

          {/* Info box */}
           <View className="bg-surface border border-border rounded-xl p-4 mb-6">
             <Text style={[typography.caption, { color: colors.textPrimary, fontWeight: "600", marginBottom: spacing.sm }]}> 
               Why we need your phone number:
             </Text>
             <Text style={[typography.body, { color: colors.textSecondary, lineHeight: 22 }]}> 
               • Link your ledgers across different vendors automatically{"\n"}•
               Allow vendors to share your ledger via WhatsApp{"\n"}• Discover
               existing credit relationships
            </Text>
          </View>

          {/* Spacer to push button to bottom */}
          <View className="flex-1" />

          {/* Continue button */}
          <View className="mt-6">
            <Button
              title={loading ? "Saving..." : "Continue"}
              onPress={handleContinue}
              disabled={!phone.trim() || loading}
              loading={loading}
            />
          </View>

          {/* Skip option - only show if onboarding not complete */}
          {!profile?.onboarding_complete && (
            <TouchableOpacity
              onPress={proceedToNext}
              className="mt-4 py-3 items-center"
              disabled={loading}
            >
               <Text style={[typography.body, { color: colors.textSecondary }]}> 
                 Skip for now (you can add it later)
               </Text>
             </TouchableOpacity>
          )}
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
