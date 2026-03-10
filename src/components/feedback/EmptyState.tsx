import { CircleOff } from "lucide-react-native";
import React from "react";
import { Text, TouchableOpacity, View } from "react-native";

interface EmptyStateProps {
  /** Legacy single-line message (falls back to subtitle when no title is set) */
  message?: string;
  /** Bold headline, e.g. "Your customer list is empty" */
  title?: string;
  /** Softer supporting text */
  description?: string;
  /** CTA button label */
  cta?: string;
  onCta?: () => void;
  /** Custom icon node — replaces default CircleOff */
  icon?: React.ReactNode;
  /** Background colour of the icon container circle (default: neutral bg) */
  iconBgColor?: string;
  /** Diameter of the icon container circle in px (default: 72) */
  iconSize?: number;
  /** Icon rendered to the left of the CTA button label */
  ctaIcon?: React.ReactNode;
}

export default function EmptyState({
  message,
  title,
  description,
  cta,
  onCta,
  icon,
  iconBgColor,
  iconSize,
  ctaIcon,
}: EmptyStateProps) {
  const heading = title ?? message ?? "Nothing here yet";
  const sub = title ? (description ?? message) : undefined;
  const containerSize = iconSize ?? 72;
  const containerBg = iconBgColor ?? "#F6F7F9";

  return (
    <View className="flex-1 items-center justify-center px-8 py-12">
      {/* Icon container circle */}
      <View
        className="rounded-full items-center justify-center mb-6"
        style={{
          width: containerSize,
          height: containerSize,
          backgroundColor: containerBg,
        }}
      >
        {icon ?? <CircleOff size={36} color="#AEAEB2" strokeWidth={1.5} />}
      </View>

      <Text className="text-[17px] font-bold text-textDark text-center mb-2">
        {heading}
      </Text>

      {sub ? (
        <Text className="text-[14px] text-textSecondary text-center leading-[22px] mb-6">
          {sub}
        </Text>
      ) : null}

      {cta && onCta ? (
        <TouchableOpacity
          className="mt-1 rounded-full bg-primary flex-row items-center justify-center h-[52px] px-8"
          style={{ gap: 8 }}
          onPress={onCta}
          activeOpacity={0.8}
        >
          {ctaIcon ?? null}
          <Text className="text-white text-[15px] font-bold">{cta}</Text>
        </TouchableOpacity>
      ) : null}
    </View>
  );
}
