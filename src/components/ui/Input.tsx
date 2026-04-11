import { colors } from "@/src/utils/theme";
import { clsx } from "clsx";
import React from "react";
import { Text, TextInput, View } from "react-native";

type Props = {
  label?: string;
  placeholder: string;
  value: string;
  onChangeText: (text: string) => void;
  secureTextEntry?: boolean;
  error?: string;
  icon?: React.ReactNode;
  iconPosition?: "left" | "right";
  variant?: "neutral" | "white";
  height?: number;
  keyboardType?: "default" | "decimal-pad" | "numeric" | "email-address";
  testID?: string;
};

export default function Input({
  label,
  placeholder,
  value,
  onChangeText,
  secureTextEntry,
  error,
  icon,
  iconPosition = "left",
  variant = "neutral",
  height = 48,
  keyboardType = "default",
  testID,
}: Props) {
  const containerStyle = clsx(
    "flex-row items-center border rounded-xl px-4",
    variant === "neutral" ? "bg-background" : "bg-surface",
  );

  return (
    <View className="w-full">
      {label && (
        <Text className="mb-1 text-sm text-textSecondary font-medium">
          {label}
        </Text>
      )}

      <View className={containerStyle} style={{ height, borderColor: error ? colors.danger : colors.border }}>
        {icon && iconPosition === "left" && (
          <View className="mr-2">{icon}</View>
        )}

        <View style={{ flex: 1, justifyContent: "center", height: "100%" }}>
          <TextInput
            placeholder={placeholder}
            value={value}
            onChangeText={onChangeText}
            secureTextEntry={secureTextEntry}
            keyboardType={keyboardType}
            placeholderTextColor={colors.textSecondary}
            testID={testID}
            style={{
              flex: 1,
              color: colors.textPrimary,
              fontSize: 16,
              paddingVertical: 0, // ✅ ensures true vertical centering
            }}
          />
        </View>

        {icon && iconPosition === "right" && (
          <View className="ml-2">{icon}</View>
        )}
      </View>

      {error && <Text className="text-danger text-xs mt-1">{error}</Text>}
    </View>
  );
}
