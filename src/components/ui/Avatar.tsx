import { colors } from "@/src/utils/theme";
import React, { memo } from "react";
import { Text, View } from "react-native";

// Avatar size options
export type AvatarSize = 'sm' | 'md' | 'lg';

// Avatar color palette (consistent across app)
const AVATAR_COLORS = [
  colors.danger,
  colors.warning,
  colors.primary,
  ...colors.avatarPalette,
] as const;

// Generate deterministic color from name
export function getAvatarColor(name: string): string {
  if (!name) return colors.textSecondary;
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  return AVATAR_COLORS[Math.abs(hash) % AVATAR_COLORS.length] as string;
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
  sm: { container: 32, text: 12 },
  md: { container: 44, text: 15 },
  lg: { container: 56, text: 18 },
};

interface AvatarProps {
  name: string;
  size?: AvatarSize;
  color?: string; // optional override
}

export default function Avatar({ name, size = 'md', color }: AvatarProps) {
  const bgColor = color ?? getAvatarColor(name);
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
}

export default memo(Avatar);