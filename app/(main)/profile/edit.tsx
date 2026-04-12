/**
 * Profile Edit Screen - Manage business details after onboarding
 *
 * Allows users to update:
 * - Business info (name, address, GSTIN, bill prefix)
 * - Bank details (bank name, account number, IFSC)
 * - Payment info (UPI ID)
 * - Business logo (upload)
 * - Business Type (Retailer vs Distributor)
 */

import { uploadBusinessLogo } from "@/src/api/upload";
import { useToast } from "@/src/components/feedback/Toast";
import { supabase } from "@/src/services/supabase";
import { useAuthStore } from "@/src/store/authStore";
import { usePreferencesStore } from "@/src/store/preferencesStore";
import { pickImageFromLibrary } from "@/src/utils/imagePicker";
import { colors, spacing } from "@/src/utils/theme";
import { Stack, useRouter } from "expo-router";
import { ArrowLeft, Building2, Upload, Wallet } from "lucide-react-native";
import { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Image,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function ProfileEditScreen() {
  const router = useRouter();
  const { profile, setProfile } = useAuthStore();
  const { businessType: prefBusinessType, setBusinessType } =
    usePreferencesStore();
  const { show: showToast } = useToast();

  // Form state
  const [businessType, setLocalBusinessType] = useState<
    "seller" | "distributor"
  >(prefBusinessType || "seller");
  const [businessName, setBusinessName] = useState(
    profile?.business_name || "",
  );
  const [billingAddress, setBillingAddress] = useState(
    profile?.business_address || "",
  );
  const [gstin, setGstin] = useState(profile?.gstin || "");
  const [billPrefix, setBillPrefix] = useState(
    profile?.bill_number_prefix || "INV",
  );
  const [bankName, setBankName] = useState(profile?.bank_name || "");
  const [accountNumber, setAccountNumber] = useState(
    profile?.account_number || "",
  );
  const [ifscCode, setIfscCode] = useState(profile?.ifsc_code || "");
  const [upiId, setUpiId] = useState(profile?.upi_id || "");
  const [logoUrl, setLogoUrl] = useState(profile?.business_logo_url || "");
  const [logoUploading, setLogoUploading] = useState(false);

  const [isSaving, setIsSaving] = useState(false);
  const [expandedSection, setExpandedSection] = useState<string | null>(
    "business",
  );

  const toggleSection = (section: string) => {
    setExpandedSection(expandedSection === section ? null : section);
  };

  const handleLogoUpload = async () => {
    if (!profile?.id) {
      Alert.alert("Error", "Profile not found");
      return;
    }

    try {
      setLogoUploading(true);
      const uri = await pickImageFromLibrary();
      if (!uri) {
        setLogoUploading(false);
        return;
      }

      const uploadedUrl = await uploadBusinessLogo(uri, profile.id);
      const { data, error } = await supabase
        .from("profiles")
        .update({ business_logo_url: uploadedUrl })
        .eq("id", profile.id)
        .select()
        .single();

      if (error) throw error;

      setProfile(data);
      setLogoUrl(uploadedUrl);
      showToast({ message: "Logo updated", type: "success" });
    } catch (error: any) {
      console.error("Error uploading logo:", error);
      Alert.alert("Upload failed", error.message || "Failed to upload logo");
    } finally {
      setLogoUploading(false);
    }
  };

  const handleSave = async () => {
    if (!profile?.id) {
      Alert.alert("Error", "Profile not found");
      return;
    }

    // Validation
    if (!businessName.trim()) {
      Alert.alert("Required", "Business name is required");
      return;
    }

    setIsSaving(true);

    try {
      const { data, error } = await supabase
        .from("profiles")
        .update({
          business_name: businessName.trim(),
          business_address: billingAddress.trim() || null,
          gstin: gstin.trim() || null,
          bill_number_prefix: billPrefix.trim() || "INV",
          bank_name: bankName.trim() || "",
          account_number: accountNumber.trim() || "",
          ifsc_code: ifscCode.trim() || "",
          upi_id: upiId.trim() || null,
        })
        .eq("id", profile.id)
        .select()
        .single();

      if (error) throw error;

      // Update local stores
      setProfile(data);
      setBusinessType(businessType); // Persist business type preference

      showToast({ message: "Profile updated", type: "success" });
      router.back();
    } catch (error: any) {
      console.error("Error updating profile:", error);
      Alert.alert("Error", error.message || "Failed to update profile");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
      <Stack.Screen options={{ headerShown: false }} />

      {/* Header */}
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          paddingHorizontal: spacing.md,
          paddingVertical: spacing.sm,
          backgroundColor: colors.surface,
          borderBottomWidth: 1,
          borderBottomColor: colors.border,
        }}
      >
        <TouchableOpacity
          onPress={() => router.back()}
          style={{ padding: spacing.xs }}
        >
          <ArrowLeft size={24} color={colors.textPrimary} />
        </TouchableOpacity>
        <Text
          style={{
            flex: 1,
            marginLeft: spacing.sm,
            fontSize: 18,
            fontWeight: "600",
            color: colors.textPrimary,
          }}
        >
          Edit Profile
        </Text>
      </View>

      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={{ flex: 1 }}
      >
        <ScrollView
          style={{ flex: 1 }}
          contentContainerStyle={{ paddingBottom: 100 }}
          keyboardShouldPersistTaps="handled"
        >
          {/* Read-Only Info */}
          <View
            style={{
              backgroundColor: colors.surface,
              padding: spacing.md,
              marginBottom: spacing.sm,
            }}
          >
            <Text
              style={{
                fontSize: 12,
                color: colors.textSecondary,
                marginBottom: spacing.xs,
              }}
            >
              Name
            </Text>
            <Text
              style={{
                fontSize: 15,
                color: colors.textPrimary,
                fontWeight: "500",
              }}
            >
              {profile?.name || "Not set"}
            </Text>

            <Text
              style={{
                fontSize: 12,
                color: colors.textSecondary,
                marginTop: spacing.md,
                marginBottom: spacing.xs,
              }}
            >
              Phone
            </Text>
            <Text
              style={{
                fontSize: 15,
                color: colors.textPrimary,
                fontWeight: "500",
              }}
            >
              {profile?.phone || "Not set"}
            </Text>

            <Text
              style={{
                fontSize: 11,
                color: colors.textSecondary,
                marginTop: spacing.sm,
                fontStyle: "italic",
              }}
            >
              Name and phone cannot be changed
            </Text>
          </View>

          {/* Business Type Section */}
          <View
            style={{
              backgroundColor: colors.surface,
              marginBottom: spacing.sm,
            }}
          >
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                padding: spacing.md,
                borderBottomWidth: 1,
                borderBottomColor: colors.border,
              }}
            >
              <Building2 size={20} color={colors.primary} />
              <Text
                style={{
                  flex: 1,
                  marginLeft: spacing.sm,
                  fontSize: 15,
                  fontWeight: "600",
                  color: colors.textPrimary,
                }}
              >
                Business Type
              </Text>
            </View>

            <View style={{ padding: spacing.md }}>
              <Text
                style={{
                  fontSize: 12,
                  color: colors.textSecondary,
                  marginBottom: spacing.sm,
                }}
              >
                Select your business model
              </Text>

              {/* Retailer Option */}
              <TouchableOpacity
                onPress={() => setLocalBusinessType("seller")}
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  paddingVertical: spacing.sm,
                  paddingHorizontal: spacing.sm,
                  marginBottom: spacing.sm,
                  borderRadius: 8,
                  backgroundColor:
                    businessType === "seller"
                      ? colors.primaryLight
                      : colors.border + "20",
                }}
              >
                <View
                  style={{
                    width: 20,
                    height: 20,
                    borderRadius: 10,
                    borderWidth: 2,
                    borderColor:
                      businessType === "seller"
                        ? colors.primary
                        : colors.border,
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  {businessType === "seller" && (
                    <View
                      style={{
                        width: 10,
                        height: 10,
                        borderRadius: 5,
                        backgroundColor: colors.primary,
                      }}
                    />
                  )}
                </View>
                <View style={{ marginLeft: spacing.sm, flex: 1 }}>
                  <Text
                    style={{
                      fontSize: 14,
                      fontWeight: "500",
                      color: colors.textPrimary,
                    }}
                  >
                    Retailer
                  </Text>
                  <Text
                    style={{
                      fontSize: 12,
                      color: colors.textSecondary,
                      marginTop: spacing.xs,
                    }}
                  >
                    Manage customers who owe you money
                  </Text>
                </View>
              </TouchableOpacity>

              {/* Distributor Option */}
              <TouchableOpacity
                onPress={() => setLocalBusinessType("distributor")}
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  paddingVertical: spacing.sm,
                  paddingHorizontal: spacing.sm,
                  borderRadius: 8,
                  backgroundColor:
                    businessType === "distributor"
                      ? colors.primaryLight
                      : colors.border + "20",
                }}
              >
                <View
                  style={{
                    width: 20,
                    height: 20,
                    borderRadius: 10,
                    borderWidth: 2,
                    borderColor:
                      businessType === "distributor"
                        ? colors.primary
                        : colors.border,
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  {businessType === "distributor" && (
                    <View
                      style={{
                        width: 10,
                        height: 10,
                        borderRadius: 5,
                        backgroundColor: colors.primary,
                      }}
                    />
                  )}
                </View>
                <View style={{ marginLeft: spacing.sm, flex: 1 }}>
                  <Text
                    style={{
                      fontSize: 14,
                      fontWeight: "500",
                      color: colors.textPrimary,
                    }}
                  >
                    Distributor
                  </Text>
                  <Text
                    style={{
                      fontSize: 12,
                      color: colors.textSecondary,
                      marginTop: spacing.xs,
                    }}
                  >
                    Manage suppliers + customers. Buy and sell.
                  </Text>
                </View>
              </TouchableOpacity>
            </View>
          </View>

          {/* Business Details Section */}
          <View
            style={{
              backgroundColor: colors.surface,
              marginBottom: spacing.sm,
            }}
          >
            <TouchableOpacity
              onPress={() => toggleSection("business")}
              style={{
                flexDirection: "row",
                alignItems: "center",
                padding: spacing.md,
                borderBottomWidth: expandedSection === "business" ? 1 : 0,
                borderBottomColor: colors.border,
              }}
            >
              <Building2 size={20} color={colors.primary} />
              <Text
                style={{
                  flex: 1,
                  marginLeft: spacing.sm,
                  fontSize: 15,
                  fontWeight: "600",
                  color: colors.textPrimary,
                }}
              >
                Business Details
              </Text>
              <Text style={{ color: colors.textSecondary }}>
                {expandedSection === "business" ? "▲" : "▼"}
              </Text>
            </TouchableOpacity>

            {expandedSection === "business" && (
              <View style={{ padding: spacing.md }}>
                <Text style={styles.label}>Business Name *</Text>
                <TextInput
                  style={styles.input}
                  value={businessName}
                  onChangeText={setBusinessName}
                  placeholder="e.g. Sharma Traders"
                  placeholderTextColor={colors.textSecondary}
                />

                <Text style={styles.label}>Billing Address</Text>
                <TextInput
                  style={[styles.input, { height: 80 }]}
                  value={billingAddress}
                  onChangeText={setBillingAddress}
                  placeholder="Shop address for invoices"
                  placeholderTextColor={colors.textSecondary}
                  multiline
                  numberOfLines={3}
                  textAlignVertical="top"
                />

                <Text style={styles.label}>GSTIN (Optional)</Text>
                <TextInput
                  style={styles.input}
                  value={gstin}
                  onChangeText={(text) => setGstin(text.toUpperCase())}
                  placeholder="29ABCDE1234F1Z5"
                  placeholderTextColor={colors.textSecondary}
                  autoCapitalize="characters"
                  maxLength={15}
                />

                <Text style={styles.label}>Entry Number Prefix</Text>
                <TextInput
                  style={styles.input}
                  value={billPrefix}
                  onChangeText={(text) => setBillPrefix(text.toUpperCase())}
                  placeholder="INV"
                  placeholderTextColor={colors.textSecondary}
                  autoCapitalize="characters"
                  maxLength={10}
                />
                <Text
                  style={{
                    fontSize: 11,
                    color: colors.textSecondary,
                    marginTop: spacing.xs,
                  }}
                >
                  Entries will be numbered as {billPrefix || "INV"}-001,{" "}
                  {billPrefix || "INV"}-002, etc.
                </Text>
              </View>
            )}
          </View>

          {/* Bank Details Section */}
          <View
            style={{
              backgroundColor: colors.surface,
              marginBottom: spacing.sm,
            }}
          >
            <TouchableOpacity
              onPress={() => toggleSection("bank")}
              style={{
                flexDirection: "row",
                alignItems: "center",
                padding: spacing.md,
                borderBottomWidth: expandedSection === "bank" ? 1 : 0,
                borderBottomColor: colors.border,
              }}
            >
              <Wallet size={20} color={colors.primary} />
              <Text
                style={{
                  flex: 1,
                  marginLeft: spacing.sm,
                  fontSize: 15,
                  fontWeight: "600",
                  color: colors.textPrimary,
                }}
              >
                Bank Details
              </Text>
              <Text style={{ color: colors.textSecondary }}>
                {expandedSection === "bank" ? "▲" : "▼"}
              </Text>
            </TouchableOpacity>

            {expandedSection === "bank" && (
              <View style={{ padding: spacing.md }}>
                <Text style={styles.label}>Bank Name</Text>
                <TextInput
                  style={styles.input}
                  value={bankName}
                  onChangeText={setBankName}
                  placeholder="e.g. State Bank of India"
                  placeholderTextColor={colors.textSecondary}
                />

                <Text style={styles.label}>Account Number</Text>
                <TextInput
                  style={styles.input}
                  value={accountNumber}
                  onChangeText={setAccountNumber}
                  placeholder="1234567890"
                  placeholderTextColor={colors.textSecondary}
                  keyboardType="number-pad"
                />

                <Text style={styles.label}>IFSC Code</Text>
                <TextInput
                  style={styles.input}
                  value={ifscCode}
                  onChangeText={(text) => setIfscCode(text.toUpperCase())}
                  placeholder="SBIN0001234"
                  placeholderTextColor={colors.textSecondary}
                  autoCapitalize="characters"
                  maxLength={11}
                />

                <Text style={styles.label}>UPI ID</Text>
                <TextInput
                  style={styles.input}
                  value={upiId}
                  onChangeText={setUpiId}
                  placeholder="yourname@paytm"
                  placeholderTextColor={colors.textSecondary}
                  autoCapitalize="none"
                  keyboardType="email-address"
                />

                <Text
                  style={{
                    fontSize: 11,
                    color: colors.textSecondary,
                    marginTop: spacing.sm,
                    fontStyle: "italic",
                  }}
                >
                  Bank details appear on all invoices
                </Text>
              </View>
            )}
          </View>

          {/* Business Logo */}
          <View
            style={{
              backgroundColor: colors.surface,
              marginBottom: spacing.sm,
              padding: spacing.md,
            }}
          >
            <Text
              style={{
                fontSize: 12,
                fontWeight: "600",
                color: colors.textSecondary,
                marginBottom: spacing.sm,
              }}
            >
              Business Logo
            </Text>
            <View style={{ flexDirection: "row", alignItems: "center" }}>
              <View
                style={{
                  width: 64,
                  height: 64,
                  borderRadius: 12,
                  backgroundColor: colors.background,
                  borderWidth: 1,
                  borderColor: colors.border,
                  alignItems: "center",
                  justifyContent: "center",
                  overflow: "hidden",
                }}
              >
                {logoUrl ? (
                  <Image
                    source={{ uri: logoUrl }}
                    style={{ width: 64, height: 64 }}
                    resizeMode="cover"
                  />
                ) : (
                  <Upload size={24} color={colors.textSecondary} />
                )}
              </View>

              <View style={{ flex: 1, marginLeft: spacing.md }}>
                <Text
                  style={{
                    fontSize: 13,
                    color: colors.textSecondary,
                    marginBottom: spacing.xs,
                  }}
                >
                  Square image works best
                </Text>
                <TouchableOpacity
                  onPress={handleLogoUpload}
                  disabled={logoUploading}
                  style={{
                    alignSelf: "flex-start",
                    paddingHorizontal: spacing.md,
                    paddingVertical: spacing.xs,
                    borderRadius: 8,
                    backgroundColor: logoUploading
                      ? colors.border
                      : colors.primary,
                  }}
                >
                  {logoUploading ? (
                    <ActivityIndicator color={colors.surface} />
                  ) : (
                    <Text
                      style={{
                        color: colors.surface,
                        fontSize: 13,
                        fontWeight: "600",
                      }}
                    >
                      Upload Logo
                    </Text>
                  )}
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </ScrollView>

        {/* Save Button */}
        <View
          style={{
            position: "absolute",
            bottom: 0,
            left: 0,
            right: 0,
            padding: spacing.md,
            backgroundColor: colors.surface,
            borderTopWidth: 1,
            borderTopColor: colors.border,
          }}
        >
          <TouchableOpacity
            onPress={handleSave}
            disabled={isSaving || !businessName.trim()}
            style={{
              backgroundColor:
                isSaving || !businessName.trim()
                  ? colors.border
                  : colors.primary,
              paddingVertical: spacing.md,
              borderRadius: 8,
              alignItems: "center",
            }}
          >
            {isSaving ? (
              <ActivityIndicator color={colors.surface} />
            ) : (
              <Text
                style={{
                  color: colors.surface,
                  fontSize: 15,
                  fontWeight: "600",
                }}
              >
                Save Changes
              </Text>
            )}
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = {
  label: {
    fontSize: 12,
    fontWeight: "500" as const,
    color: colors.textSecondary,
    marginBottom: spacing.xs,
    marginTop: spacing.md,
  },
  input: {
    backgroundColor: colors.background,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    padding: spacing.sm,
    fontSize: 15,
    color: colors.textPrimary,
  },
};
