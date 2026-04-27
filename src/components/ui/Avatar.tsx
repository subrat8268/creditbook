import { useTheme } from "@/src/utils/ThemeProvider";
import { lightColors, spacing } from "@/src/utils/theme";
import React, { memo } from "react";
import { Text, View } from "react-native";

// Avatar size options
export type AvatarSize = 'xs' | 'sm' | 'md' | 'lg';

const DEFAULT_AVATAR_COLORS = lightColors.avatarPalette;
const DEFAULT_FALLBACK_COLOR = lightColors.textSecondary;

// Generate deterministic color from name
export function getAvatarColor(
  name: string,
  palette: readonly string[] = DEFAULT_AVATAR_COLORS,
  fallbackColor: string = DEFAULT_FALLBACK_COLOR,
): string {
  if (!name) return fallbackColor;
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  return palette[Math.abs(hash) % palette.length] as string;
}

// Get initials from name
export function getInitials(name: string | null | undefined): string {
  if (!name) return "?";
  const parts = name.trim().split(/\s+/).slice(0, 2);
  if (parts.length >= 2) {
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  }
  return name.substring(0, 2).toUpperCase();
}

// Size configurations
const SIZES: Record<AvatarSize, { container: number; text: number }> = {
  xs: { container: spacing.avatarXs, text: 11 },
  sm: { container: spacing.avatarSm, text: 12 },
  md: { container: spacing.avatarMd, text: 15 },
  lg: { container: spacing.avatarLg, text: 18 },
};

interface AvatarProps {
  name: string;
  size?: AvatarSize;
  color?: string; // optional override
}

export default memo(function Avatar({ name, size = 'md', color }: AvatarProps) {
  const { colors } = useTheme();
  const bgColor = color ?? getAvatarColor(name, colors.avatarPalette, colors.textSecondary);
  const initials = getInitials(name);
  const { container, text } = SIZES[size];

  return (
    <View
      className="rounded-full items-center justify-center"
      style={{
        width: container,
        height: container,
        backgroundColor: bgColor,
      }}
    >
      <Text
        className="font-bold text-white"
        style={{ fontSize: text }}
      >
        {initials}
      </Text>
    </View>
  );
});
