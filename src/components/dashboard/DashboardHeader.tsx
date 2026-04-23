import { useAuthStore } from "@/src/store/authStore";
import { colors, spacing } from "@/src/utils/theme";
import { Bell, Settings } from "lucide-react-native";
import { memo, useMemo } from "react";
import { Text, TouchableOpacity, View } from "react-native";

type Props = {
  overdueCount?: number;
  showActions?: boolean;
  onPressNotifications?: () => void;
  onPressSettings?: () => void;
};

const getInitials = (name: string): string => {
  const parts = name.trim().split(" ").slice(0, 2);
  return parts.map((w) => w[0]?.toUpperCase() || "").join("") || "CB";
};

const getGreeting = (): string => {
  const h = new Date().getHours();
  if (h < 12) return "Good morning 👋";
  if (h < 17) return "Good afternoon 👋";
  return "Good evening 👋";
};

export default memo(function DashboardHeader({
  overdueCount = 0,
  showActions = true,
  onPressNotifications,
  onPressSettings,
}: Props) {
  const { profile } = useAuthStore();
  const businessName = profile?.business_name ?? profile?.name ?? "My Business";
  const initials = useMemo(() => getInitials(businessName), [businessName]);

  // No dedicated token yet; keep visual size stable but derived from avatar tokens.
  const iconButtonSize = spacing.avatarSm + 2; // 36 + 2 = 38

  const iconButtonShadow = {
    shadowColor: colors.textPrimary,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 2,
  } as const;

  return (
    <View
      className="flex-row items-center"
      style={{
        paddingTop: 14,
        paddingHorizontal: spacing.screenPadding - 2,
        paddingBottom: spacing.md,
        backgroundColor: colors.background,
      }}
    >
      {/* Initials avatar */}
      <View
        className="items-center justify-center rounded-full"
        style={{
          width: spacing.avatarSm,
          height: spacing.avatarSm,
          marginRight: spacing.md,
          backgroundColor: colors.primary,
        }}
      >
        <Text
          className="font-bold"
          style={{
            fontSize: 14,
            color: colors.surface,
          }}
        >
          {initials}
        </Text>
      </View>

      <View className="flex-1">
        <Text
          className="font-bold"
          numberOfLines={1}
          style={{
            fontSize: 16,
            color: colors.textPrimary,
          }}
        >
          {businessName}
        </Text>
        <Text
          style={{
            fontSize: 12,
            color: colors.textSecondary,
          }}
        >
          {getGreeting()}
        </Text>
      </View>

      {showActions && (
        <>
          {/* Bell */}
          <TouchableOpacity
            className="items-center justify-center rounded-full"
            style={{
              width: iconButtonSize,
              height: iconButtonSize,
              marginRight: spacing.sm,
              backgroundColor: colors.surface,
              ...iconButtonShadow,
            }}
            onPress={onPressNotifications}
          >
            <View style={{ position: "relative" }}>
              <Bell size={22} color={colors.textPrimary} strokeWidth={1.75} />
              {overdueCount > 0 && (
                <View
                  style={{
                    position: "absolute",
                    top: -2,
                    right: -2,
                    width: 8,
                    height: 8,
                    borderRadius: 4,
                    backgroundColor: colors.danger,
                  }}
                />
              )}
            </View>
          </TouchableOpacity>

          {/* Settings */}
          <TouchableOpacity
            className="items-center justify-center rounded-full"
            style={{
              width: iconButtonSize,
              height: iconButtonSize,
              backgroundColor: colors.surface,
              ...iconButtonShadow,
            }}
            onPress={onPressSettings}
          >
            <Settings size={20} color={colors.textPrimary} strokeWidth={1.8} />
          </TouchableOpacity>
        </>
      )}
    </View>
  );
});
