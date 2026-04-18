import { colors } from "@/src/utils/theme";
import { clsx } from "clsx";
import React, { memo, useRef } from "react";
import { ActivityIndicator, Animated, Text, TouchableOpacity, View } from "react-native";

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

export default memo(function Button({
  title,
  className,
  onPress,
  variant = "primary",
  loading,
  disabled,
  icon,
  iconPosition = "left",
}: Props) {
  const scaleAnim = useRef(new Animated.Value(1)).current;

  const handlePressIn = () => {
    Animated.spring(scaleAnim, {
      toValue: 0.96,
      useNativeDriver: true,
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(scaleAnim, {
      toValue: 1,
      friction: 3,
      useNativeDriver: true,
    }).start();
  };

  const baseStyle =
    "w-full py-3 rounded-[14px] items-center justify-center h-[52px] flex-row";

  const variantStyle = clsx({
    "bg-primary": variant === "primary" && !disabled,
    "bg-secondary": variant === "secondary" && !disabled,
    "bg-danger": variant === "danger" && !disabled,
    "bg-surface border border-primary": variant === "outline" && !disabled,
  });

  const textStyle = clsx("text-base font-bold", {
    "text-white": variant !== "outline" && !disabled,
    "text-primary": variant === "outline" && !disabled,
  });

  return (
    <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
      <TouchableOpacity
        className={`${baseStyle} ${variantStyle} ${className}`}
        onPress={onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        disabled={disabled || loading}
        activeOpacity={1}
        style={[
          variant === "primary" && !disabled
            ? {
                shadowColor: colors.primary,
                shadowOffset: { width: 0, height: 10 },
                shadowOpacity: 0.2,
                shadowRadius: 15,
                elevation: 8,
              }
            : undefined,
          disabled && { backgroundColor: "#E2E8F0" },
        ]}
      >
      {loading ? (
        <ActivityIndicator
          color={variant === "outline" ? colors.primary : colors.surface}
        />
      ) : (
        <View className="flex-row items-center justify-center">
          {icon && iconPosition === "left" && (
            <View className="mr-2">{icon}</View>
          )}

          <Text
            className={textStyle}
            style={disabled ? { color: colors.textMuted } : undefined}
          >
            {title}
          </Text>

          {icon && iconPosition === "right" && (
            <View className="ml-2">{icon}</View>
          )}
        </View>
      )}
    </TouchableOpacity>
    </Animated.View>
  );
}

export default memo(Button);
