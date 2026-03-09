import { clsx } from "clsx";
import React from "react";
import { ActivityIndicator, Text, TouchableOpacity, View } from "react-native";

type Props = {
  title: string;
  className?: string;
  onPress: () => void;
  variant?: "primary" | "secondary" | "danger" | "outline";
  loading?: boolean;
  disabled?: boolean;
  icon?: React.ReactNode;
  iconPosition?: "left" | "right";
};

export default function Button({
  title,
  className,
  onPress,
  variant = "primary",
  loading,
  disabled,
  icon,
  iconPosition = "left",
}: Props) {
  const baseStyle =
    "w-full py-3 rounded-xl items-center justify-center h-14 flex-row";

  const variantStyle = clsx({
    "bg-primary": variant === "primary" && !disabled,
    "bg-secondary": variant === "secondary" && !disabled,
    "bg-danger": variant === "danger" && !disabled,
    "bg-white border border-primary": variant === "outline" && !disabled,
    "bg-neutral-300": disabled,
  });

  const textStyle = clsx("font-semibold text-lg", {
    "text-white": variant !== "outline" && !disabled,
    "text-primary": variant === "outline" && !disabled,
    "text-neutral-500": disabled,
  });

  return (
    <TouchableOpacity
      className={`${baseStyle} ${variantStyle} ${className}`}
      onPress={onPress}
      disabled={disabled || loading}
      activeOpacity={0.8}
    >
      {loading ? (
        <ActivityIndicator
          color={variant === "outline" ? colors.primary.DEFAULT : colors.white}
        />
      ) : (
        <View className="flex-row items-center justify-center">
          {icon && iconPosition === "left" && (
            <View className="mr-2">{icon}</View>
          )}

          <Text className={textStyle}>{title}</Text>

          {icon && iconPosition === "right" && (
            <View className="ml-2">{icon}</View>
          )}
        </View>
      )}
    </TouchableOpacity>
  );
}
