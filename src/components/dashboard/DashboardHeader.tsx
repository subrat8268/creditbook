import { useAuthStore } from "@/src/store/authStore";
import { useTheme } from "@/src/utils/ThemeProvider";
import { Bell } from "lucide-react-native";
import { memo, useMemo } from "react";
import { Pressable, Text, View } from "react-native";

type Props = {
  overdueCount?: number;
  showNotification?: boolean;
  onPressNotifications?: () => void;
};

const getInitials = (name: string): string => {
  const parts = name.trim().split(" ").slice(0, 2);
  return parts.map((w) => w[0]?.toUpperCase() || "").join("") || "KB";
};

const getGreeting = (): string => {
  const h = new Date().getHours();
  if (h < 12) return "Good morning";
  if (h < 17) return "Good afternoon";
  return "Good evening";
};

export default memo(function DashboardHeader({
  overdueCount = 0,
  showNotification = true,
  onPressNotifications,
}: Props) {
  const { profile } = useAuthStore();
  const { colors } = useTheme();
  const businessName = profile?.business_name ?? profile?.name ?? "My Business";
  const initials = useMemo(() => getInitials(businessName), [businessName]);

  return (
    <View className="flex-row items-center bg-background px-4 pb-3 pt-4 dark:bg-background-dark">
      <View className="h-10 w-10 items-center justify-center rounded-full bg-success">
        <Text className="text-caption font-inter-bold text-surface">{initials}</Text>
      </View>

      <View className="ml-3 flex-1">
        <Text className="text-card-title font-inter-bold text-textPrimary dark:text-textPrimary-dark" numberOfLines={1}>
          {businessName}
        </Text>
        <Text className="mt-0.5 text-caption text-textSecondary dark:text-textSecondary-dark">{getGreeting()} 👋</Text>
      </View>

      {showNotification ? (
        <Pressable
          className="h-10 w-10 items-center justify-center rounded-full bg-surface dark:bg-surface-dark"
          onPress={onPressNotifications}
        >
          <View className="relative">
            <Bell size={20} color={colors.textPrimary} strokeWidth={1.8} />
            {overdueCount > 0 ? <View className="absolute -right-0.5 -top-0.5 h-2 w-2 rounded-full bg-danger" /> : null}
          </View>
        </Pressable>
      ) : null}
    </View>
  );
});
