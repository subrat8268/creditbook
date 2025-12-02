import { Text, TouchableOpacity, ScrollView, TextInput } from "react-native";
import ScreenWrapper from "@/src/components/ScreenWrapper";
import { useAuthStore } from "@/src/store/authStore";
import ImagePickerField from "@/src/components/ImagePickerField";
import SubscriptionCard from "@/src/components/SubscriptionCard";
import { uploadImage } from "@/src/utils/upload";
import { supabase } from "@/src/services/supabase";

export default function ProfileScreen() {
  const { profile, setProfile, logout } = useAuthStore();

  const updateField = async (field: string, value: any) => {
    const { data, error } = await supabase
      .from("profiles")
      .update({ [field]: value })
      .eq("id", profile!.id)
      .select()
      .single();

    if (!error) {
      setProfile({ ...profile, [field]: value });
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
        <Text className="text-2xl font-bold text-gray-900 mb-6">Profile</Text>

        {/* Subscription */}
        <SubscriptionCard profile={profile} />

        {/* Avatar */}
        <ImagePickerField
          label="Your Photo"
          value={profile.avatar_url}
          onPick={(uri) => handleImage(uri, "avatar_url")}
        />

        {/* Business Logo */}
        <ImagePickerField
          label="Business Logo"
          value={profile.business_logo_url}
          onPick={(uri) => handleImage(uri, "business_logo_url")}
        />

        {/* Business Fields */}
        <Text className="mt-3 font-semibold text-gray-900 mb-1">
          Business Name
        </Text>
        <TextInput
          className="p-3 bg-gray-100 rounded-xl mb-4"
          value={profile.business_name ?? ""}
          onChangeText={(t) => updateField("business_name", t)}
        />

        <Text className="font-semibold text-gray-900 mb-1">
          Billing Address
        </Text>
        <TextInput
          className="p-3 bg-gray-100 rounded-xl mb-4"
          multiline
          value={profile.billing_address ?? ""}
          onChangeText={(t) => updateField("billing_address", t)}
        />

        <Text className="font-semibold text-gray-900 mb-1">GSTIN</Text>
        <TextInput
          className="p-3 bg-gray-100 rounded-xl mb-4"
          value={profile.gstin ?? ""}
          onChangeText={(t) => updateField("gstin", t)}
        />

        <Text className="font-semibold text-gray-900 mb-1">
          UPI ID (used for QR on bills)
        </Text>
        <TextInput
          className="p-3 bg-gray-100 rounded-xl mb-8"
          value={profile.upi_id ?? ""}
          onChangeText={(t) => updateField("upi_id", t)}
        />

        {/* Logout */}
        <TouchableOpacity
          className="bg-red-100 border border-red-300 py-3 rounded-xl"
          onPress={logout}
        >
          <Text className="text-red-700 text-center font-semibold">Logout</Text>
        </TouchableOpacity>
      </ScrollView>
    </ScreenWrapper>
  );
}
