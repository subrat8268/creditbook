import { uploadImage } from "@/src/api/upload";
import ImagePickerField from "@/src/components/ImagePickerField";
import ScreenWrapper from "@/src/components/ScreenWrapper";
import SubscriptionCard from "@/src/components/SubscriptionCard";
import { supabase } from "@/src/services/supabase";
import { useAuthStore } from "@/src/store/authStore";
import { useLanguageStore } from "@/src/store/languageStore";
import { Profile } from "@/src/types/auth";
import { useTranslation } from "react-i18next";
import {
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

export default function ProfileScreen() {
  const { profile, setProfile, logout } = useAuthStore();
  const { language, setLanguage } = useLanguageStore();
  const { t } = useTranslation();

  const updateField = async (field: string, value: any) => {
    const { error } = await supabase
      .from("profiles")
      .update({ [field]: value })
      .eq("id", profile!.id);

    if (!error) {
      setProfile({ ...profile!, [field]: value } as Profile);
    }
  };

  const handleImage = async (uri: string, field: string) => {
    const uploadedUrl = await uploadImage(uri);
    updateField(field, uploadedUrl);
  };

  if (!profile) return null;

  return (
    <ScreenWrapper>
      <ScrollView showsVerticalScrollIndicator={false}>
        <Text className="text-2xl font-bold text-gray-900 mb-6">
          {t("profile.title")}
        </Text>

        {/* Subscription */}
        <SubscriptionCard profile={profile} />

        {/* Avatar */}
        <ImagePickerField
          label={t("profile.yourPhoto")}
          value={profile.avatar_url ?? null}
          onPick={(uri) => handleImage(uri, "avatar_url")}
        />

        {/* Business Logo */}
        <ImagePickerField
          label={t("profile.businessLogo")}
          value={profile.business_logo_url ?? null}
          onPick={(uri) => handleImage(uri, "business_logo_url")}
        />

        {/* Business Fields */}
        <Text className="mt-3 font-semibold text-gray-900 mb-1">
          {t("profile.businessName")}
        </Text>
        <TextInput
          className="p-3 bg-gray-100 rounded-xl mb-4"
          value={profile.business_name ?? ""}
          onChangeText={(t) => updateField("business_name", t)}
        />

        <Text className="font-semibold text-gray-900 mb-1">
          {t("profile.businessAddress")}
        </Text>
        <TextInput
          className="p-3 bg-gray-100 rounded-xl mb-4"
          multiline
          value={profile.business_address ?? ""}
          onChangeText={(t) => updateField("business_address", t)}
        />

        <Text className="font-semibold text-gray-900 mb-1">
          {t("profile.gstin")}
        </Text>
        <TextInput
          className="p-3 bg-gray-100 rounded-xl mb-4"
          value={profile.gstin ?? ""}
          onChangeText={(t) => updateField("gstin", t)}
        />

        <Text className="font-semibold text-gray-900 mb-1">
          {t("profile.upiId")}
        </Text>
        <TextInput
          className="p-3 bg-gray-100 rounded-xl mb-8"
          value={profile.upi_id ?? ""}
          onChangeText={(t) => updateField("upi_id", t)}
        />

        {/* Bill Settings */}
        <View className="mb-2">
          <Text className="text-lg font-bold text-gray-900">
            {t("profile.billSettings")}
          </Text>
          <Text className="text-xs text-gray-500 mt-0.5">
            {t("profile.billSettingsDesc")}
          </Text>
        </View>

        <Text className="font-semibold text-gray-900 mb-1 mt-3">
          {t("profile.billNumberPrefix")}
        </Text>
        <TextInput
          className="p-3 bg-gray-100 rounded-xl mb-8"
          placeholder="e.g. INV, BILL, CB"
          placeholderTextColor="#9ca3af"
          autoCapitalize="characters"
          maxLength={10}
          value={profile.bill_number_prefix ?? "INV"}
          onEndEditing={(e) =>
            updateField(
              "bill_number_prefix",
              e.nativeEvent.text.toUpperCase() || "INV",
            )
          }
          onChangeText={(t) =>
            setProfile({
              ...profile!,
              bill_number_prefix: t.toUpperCase(),
            })
          }
        />

        {/* Bank Account Details */}
        <View className="mb-2 mt-2">
          <Text className="text-lg font-bold text-gray-900">
            {t("profile.bankDetails")}
          </Text>
          <Text className="text-xs text-gray-500 mt-0.5">
            {t("profile.bankDetailsDesc")}
          </Text>
        </View>

        <Text className="font-semibold text-gray-900 mb-1 mt-3">
          {t("profile.bankName")}
        </Text>
        <TextInput
          className="p-3 bg-gray-100 rounded-xl mb-4"
          placeholder="e.g. State Bank of India"
          placeholderTextColor="#9ca3af"
          value={profile.bank_name ?? ""}
          onEndEditing={(e) => updateField("bank_name", e.nativeEvent.text)}
          onChangeText={(t) => setProfile({ ...profile!, bank_name: t })}
        />

        <Text className="font-semibold text-gray-900 mb-1">
          {t("profile.accountNumber")}
        </Text>
        <TextInput
          className="p-3 bg-gray-100 rounded-xl mb-4"
          placeholder="e.g. 00112233445566"
          placeholderTextColor="#9ca3af"
          keyboardType="numeric"
          value={profile.account_number ?? ""}
          onEndEditing={(e) =>
            updateField("account_number", e.nativeEvent.text)
          }
          onChangeText={(t) => setProfile({ ...profile!, account_number: t })}
        />

        <Text className="font-semibold text-gray-900 mb-1">
          {t("profile.ifscCode")}
        </Text>
        <TextInput
          className="p-3 bg-gray-100 rounded-xl mb-8"
          placeholder="e.g. SBIN0001234"
          placeholderTextColor="#9ca3af"
          autoCapitalize="characters"
          value={profile.ifsc_code ?? ""}
          onEndEditing={(e) =>
            updateField("ifsc_code", e.nativeEvent.text.toUpperCase())
          }
          onChangeText={(t) =>
            setProfile({ ...profile!, ifsc_code: t.toUpperCase() })
          }
        />

        {/* Dashboard Mode */}
        <View className="mb-2 mt-2">
          <Text className="text-lg font-bold text-gray-900">
            {t("profile.dashboardMode")}
          </Text>
          <Text className="text-xs text-gray-500 mt-0.5">
            {t("profile.dashboardModeDesc")}
          </Text>
        </View>

        <View className="flex-row gap-2 mb-8 mt-3">
          {(["seller", "distributor", "both"] as const).map((m) => {
            const labels: Record<string, string> = {
              seller: t("profile.seller"),
              distributor: t("profile.distributor"),
              both: t("profile.both"),
            };
            const isActive = (profile.dashboard_mode ?? "both") === m;
            return (
              <TouchableOpacity
                key={m}
                onPress={() => updateField("dashboard_mode", m)}
                className={`flex-1 py-3 rounded-xl border items-center ${
                  isActive
                    ? "bg-primary border-primary"
                    : "bg-gray-100 border-gray-200"
                }`}
              >
                <Text
                  className={`font-semibold text-sm ${
                    isActive ? "text-white" : "text-gray-600"
                  }`}
                >
                  {labels[m]}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Language Toggle */}
        <View className="mb-2 mt-2">
          <Text className="text-lg font-bold text-gray-900">
            {t("profile.language")}
          </Text>
          <Text className="text-xs text-gray-500 mt-0.5">
            {t("profile.languageDesc")}
          </Text>
        </View>

        <View className="flex-row gap-2 mb-8 mt-3">
          {(["en", "hi"] as const).map((lang) => {
            const isActive = language === lang;
            const label =
              lang === "en" ? t("profile.english") : t("profile.hindi");
            return (
              <TouchableOpacity
                key={lang}
                onPress={() => setLanguage(lang)}
                className={`flex-1 py-3 rounded-xl border items-center ${
                  isActive
                    ? "bg-primary border-primary"
                    : "bg-gray-100 border-gray-200"
                }`}
              >
                <Text
                  className={`font-semibold text-sm ${
                    isActive ? "text-white" : "text-gray-600"
                  }`}
                >
                  {label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Logout */}
        <TouchableOpacity
          className="bg-red-100 border border-red-300 py-3 rounded-xl"
          onPress={logout}
        >
          <Text className="text-red-700 text-center font-semibold">
            {t("common.logout")}
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </ScreenWrapper>
  );
}
