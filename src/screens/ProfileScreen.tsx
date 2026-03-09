import { uploadImage } from "@/src/api/upload";
import ImagePickerField from "@/src/components/ImagePickerField";
import ScreenWrapper from "@/src/components/ScreenWrapper";
import SubscriptionCard from "@/src/components/SubscriptionCard";
import Loader from "@/src/components/feedback/Loader";
import { supabase } from "@/src/services/supabase";
import { useAuthStore } from "@/src/store/authStore";
import { useLanguageStore } from "@/src/store/languageStore";
import { colors } from "@/src/utils/theme";
import { useRouter } from "expo-router";
import { ChevronRight, Download } from "lucide-react-native";
import { useTranslation } from "react-i18next";
import {
    ScrollView,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";

const getInitials = (name?: string | null): string => {
  if (!name) return "CB";
  const parts = name.trim().split(/\s+/).slice(0, 2);
  return parts.map((w) => w[0]?.toUpperCase() || "").join("");
};

export default function ProfileScreen() {
  const { user, profile, setProfile, logout } = useAuthStore();
  const { language, setLanguage } = useLanguageStore();
  const { t } = useTranslation();
  const router = useRouter();

  const updateField = async (field: string, value: any) => {
    if (!user) return;
    const { error } = await supabase
      .from("profiles")
      .update({ [field]: value })
      .eq("user_id", user.id);

    if (!error) {
      const current = useAuthStore.getState().profile;
      if (current) setProfile({ ...current, [field]: value });
    }
  };

  const handleImage = async (uri: string, field: string) => {
    const uploadedUrl = await uploadImage(uri);
    updateField(field, uploadedUrl);
  };

  if (!profile) return <Loader />;

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    logout();
    router.replace("/(auth)/login");
  };

  return (
    <ScreenWrapper>
      <ScrollView showsVerticalScrollIndicator={false}>
        <Text className="text-2xl font-bold text-textDark mb-6">
          {t("profile.title")}
        </Text>

        {/* Profile Avatar */}
        <View style={{ alignItems: "center", marginBottom: 24 }}>
          <View className="w-[72px] h-[72px] rounded-full bg-primary items-center justify-center">
            <Text
              style={{ color: colors.white, fontSize: 22, fontWeight: "700" }}
            >
              {getInitials(profile.business_name)}
            </Text>
          </View>
          {profile.business_name ? (
            <Text
              className="mt-2 text-base font-bold text-textDark"
              numberOfLines={1}
            >
              {profile.business_name}
            </Text>
          ) : null}
        </View>

        {/* Subscription */}
        <SubscriptionCard profile={profile} />

        {/* Avatar */}
        <ImagePickerField
          label={t("profile.yourPhoto")}
          value={profile.avatar_url ?? null}
          onPick={(uri) => handleImage(uri, "avatar_url")}
          name={profile.name ?? undefined}
        />

        {/* Business Logo */}
        <ImagePickerField
          label={t("profile.businessLogo")}
          value={profile.business_logo_url ?? null}
          onPick={(uri) => handleImage(uri, "business_logo_url")}
        />

        {/* Business Fields */}
        <Text className="mt-3 font-semibold text-textDark mb-1">
          {t("profile.businessName")}
        </Text>
        <TextInput
          className="p-3 bg-background rounded-xl mb-4"
          value={profile.business_name ?? ""}
          onChangeText={(t) => updateField("business_name", t)}
        />

        <Text className="font-semibold text-textDark mb-1">
          {t("profile.businessAddress")}
        </Text>
        <TextInput
          className="p-3 bg-background rounded-xl mb-4"
          multiline
          value={profile.business_address ?? ""}
          onChangeText={(t) => updateField("business_address", t)}
        />

        <Text className="font-semibold text-textDark mb-1">
          {t("profile.gstin")}
        </Text>
        <TextInput
          className="p-3 bg-background rounded-xl mb-4"
          value={profile.gstin ?? ""}
          onChangeText={(t) => updateField("gstin", t)}
        />

        <Text className="font-semibold text-textDark mb-1">
          {t("profile.upiId")}
        </Text>
        <TextInput
          className="p-3 bg-background rounded-xl mb-8"
          value={profile.upi_id ?? ""}
          onChangeText={(t) => updateField("upi_id", t)}
        />

        {/* Bill Settings */}
        <View className="mb-2">
          <Text className="text-lg font-bold text-textDark">
            {t("profile.billSettings")}
          </Text>
          <Text className="text-xs text-textSecondary mt-0.5">
            {t("profile.billSettingsDesc")}
          </Text>
        </View>

        <Text className="font-semibold text-textDark mb-1 mt-3">
          {t("profile.billNumberPrefix")}
        </Text>
        <TextInput
          className="p-3 bg-background rounded-xl mb-8"
          placeholder="e.g. INV, BILL, CB"
          placeholderTextColor={colors.neutral[400]}
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
          <Text className="text-lg font-bold text-textDark">
            {t("profile.bankDetails")}
          </Text>
          <Text className="text-xs text-textSecondary mt-0.5">
            {t("profile.bankDetailsDesc")}
          </Text>
        </View>

        <Text className="font-semibold text-textDark mb-1 mt-3">
          {t("profile.bankName")}
        </Text>
        <TextInput
          className="p-3 bg-background rounded-xl mb-4"
          placeholder="e.g. State Bank of India"
          placeholderTextColor={colors.neutral[400]}
          value={profile.bank_name ?? ""}
          onEndEditing={(e) => updateField("bank_name", e.nativeEvent.text)}
          onChangeText={(t) => setProfile({ ...profile!, bank_name: t })}
        />

        <Text className="font-semibold text-textDark mb-1">
          {t("profile.accountNumber")}
        </Text>
        <TextInput
          className="p-3 bg-background rounded-xl mb-4"
          placeholder="e.g. 00112233445566"
          placeholderTextColor={colors.neutral[400]}
          keyboardType="numeric"
          value={profile.account_number ?? ""}
          onEndEditing={(e) =>
            updateField("account_number", e.nativeEvent.text)
          }
          onChangeText={(t) => setProfile({ ...profile!, account_number: t })}
        />

        <Text className="font-semibold text-textDark mb-1">
          {t("profile.ifscCode")}
        </Text>
        <TextInput
          className="p-3 bg-background rounded-xl mb-8"
          placeholder="e.g. SBIN0001234"
          placeholderTextColor={colors.neutral[400]}
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
          <Text className="text-lg font-bold text-textDark">
            {t("profile.dashboardMode")}
          </Text>
          <Text className="text-xs text-textSecondary mt-0.5">
            {t("profile.dashboardModeDesc")}
          </Text>
        </View>

        <View className="flex-row gap-2 mb-8 mt-3">
          {(
            [
              { value: "seller", label: "Seller" },
              { value: "distributor", label: "Distributor" },
              { value: "both", label: "Both" },
            ] as const
          ).map(({ value, label }) => {
            const isActive = (profile.dashboard_mode ?? "seller") === value;
            return (
              <TouchableOpacity
                key={value}
                onPress={() => updateField("dashboard_mode", value)}
                className={`flex-1 py-3 rounded-xl border items-center ${
                  isActive
                    ? "bg-primary border-primary"
                    : "bg-background border-gray-200"
                }`}
              >
                <Text
                  className={`font-semibold text-sm ${
                    isActive ? "text-white" : "text-textPrimary"
                  }`}
                >
                  {label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Language Toggle */}
        <View className="mb-2 mt-2">
          <Text className="text-lg font-bold text-textDark">
            {t("profile.language")}
          </Text>
          <Text className="text-xs text-textSecondary mt-0.5">
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
                    : "bg-background border-gray-200"
                }`}
              >
                <Text
                  className={`font-semibold text-sm ${
                    isActive ? "text-white" : "text-textPrimary"
                  }`}
                >
                  {label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Export Data */}
        <TouchableOpacity
          className="bg-success-bg border border-success-light py-3 px-4 rounded-xl mb-3 flex-row items-center justify-between"
          onPress={() => router.push("/(main)/export" as any)}
        >
          <View className="flex-row items-center gap-3">
            <Download size={20} color={colors.primary.dark} strokeWidth={2} />
            <View>
              <Text className="font-semibold text-success-text">
                {t("export.title")}
              </Text>
              <Text className="text-xs text-primary-dark">
                {t("export.profileDesc")}
              </Text>
            </View>
          </View>
          <ChevronRight size={18} color={colors.primary.dark} strokeWidth={2} />
        </TouchableOpacity>

        {/* Logout */}
        <TouchableOpacity
          className="bg-danger-light border border-danger-dark py-3 rounded-xl"
          onPress={handleSignOut}
        >
          <Text className="text-danger-text text-center font-semibold">
            {t("common.logout")}
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </ScreenWrapper>
  );
}
