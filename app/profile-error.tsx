import { useAuthStore } from "@/src/store/authStore";
import { AlertTriangle } from "lucide-react-native";
import { useState } from "react";
import { ActivityIndicator, Text, TouchableOpacity, View } from "react-native";

/**
 * AuthProfileErrorScreen
 *
 * Rendered when: user session is valid BUT profile fetch returned null
 * and profileLoading is false (i.e. the fetch completed with no data).
 *
 * This prevents the blank-screen dead state in the root layout's
 * conditional Stack.Screen guard.
 */
export default function AuthProfileErrorScreen() {
  const { fetchProfile, logout } = useAuthStore();
  const [retrying, setRetrying] = useState(false);

  const handleRetry = async () => {
    setRetrying(true);
    try {
      await fetchProfile();
    } finally {
      setRetrying(false);
    }
  };

  return (
    <View className="flex-1 bg-background items-center justify-center px-6">
      {/* Icon */}
      <View className="bg-danger-bg rounded-full p-5 mb-6">
        <AlertTriangle size={40} color="#DC2626" />
      </View>

      {/* Title */}
      <Text className="text-textDark text-2xl font-bold text-center mb-3">
        Failed to load your profile
      </Text>

      {/* Description */}
      <Text className="text-textSecondary text-base text-center mb-8 leading-6">
        We could not load your account data.{"\n"}
        Please check your connection and try again.
      </Text>

      {/* Retry button */}
      <TouchableOpacity
        onPress={handleRetry}
        disabled={retrying}
        className="w-full bg-primary rounded-xl py-4 items-center mb-4"
        style={{ opacity: retrying ? 0.7 : 1 }}
      >
        {retrying ? (
          <ActivityIndicator color="#FFFFFF" />
        ) : (
          <Text className="text-white font-semibold text-base">Retry</Text>
        )}
      </TouchableOpacity>

      {/* Logout button */}
      <TouchableOpacity
        onPress={logout}
        disabled={retrying}
        className="w-full border border-border rounded-xl py-4 items-center"
        style={{ opacity: retrying ? 0.5 : 1 }}
      >
        <Text className="text-textPrimary font-semibold text-base">
          Log out
        </Text>
      </TouchableOpacity>
    </View>
  );
}
