import { colors, spacing, typography } from "@/src/utils/theme";
import { clsx } from "clsx";
import React, { memo } from "react";
import {
  StyleSheet,
  Text,
  TextInput,
  type TextInputProps,
  View,
} from "react-native";

type Props = {
  label?: string;
  placeholder: string;
  value: string;
  onChangeText: (text: string) => void;
  onBlur?: TextInputProps["onBlur"];
  secureTextEntry?: boolean;
  error?: string;
  icon?: React.ReactNode;
  iconPosition?: "left" | "right";
  variant?: "neutral" | "white";
  height?: number;
  keyboardType?: "default" | "decimal-pad" | "numeric" | "email-address";
  multiline?: boolean;
  numberOfLines?: number;
  maxLength?: number;
  autoCapitalize?: TextInputProps["autoCapitalize"];
  autoFocus?: boolean;
  returnKeyType?: TextInputProps["returnKeyType"];
  onSubmitEditing?: TextInputProps["onSubmitEditing"];
  editable?: boolean;
  textAlign?: TextInputProps["textAlign"];
};

export default memo(function Input({
  label,
  placeholder,
  value,
  onChangeText,
  onBlur,
  secureTextEntry,
  error,
  icon,
  iconPosition = "left",
  variant = "neutral",
  height = 48,
  keyboardType = "default",
  multiline = false,
  numberOfLines,
  maxLength,
  autoCapitalize = "none",
  autoFocus = false,
  returnKeyType,
  onSubmitEditing,
  editable = true,
  textAlign,
}: Props) {
  const containerStyle = clsx(
    "flex-row items-center border rounded-xl px-4",
    variant === "neutral" ? "bg-background" : "bg-surface",
  );

  return (
    <View className="w-full">
      {label && (
        <Text style={styles.label}>
          {label}
        </Text>
      )}

      <View
        className={containerStyle}
        style={[
          styles.container,
          {
            minHeight: height,
            borderColor: error ? colors.danger : colors.border,
          },
          multiline ? styles.multilineContainer : null,
        ]}
      >
        {icon && iconPosition === "left" && (
          <View className="mr-2">{icon}</View>
        )}

        <View style={[styles.inputWrap, multiline ? styles.inputWrapMultiline : null]}>
          <TextInput
            placeholder={placeholder}
            value={value}
            onChangeText={onChangeText}
            onBlur={onBlur}
            secureTextEntry={secureTextEntry}
            keyboardType={keyboardType}
            placeholderTextColor={colors.textSecondary}
            multiline={multiline}
            numberOfLines={numberOfLines}
            maxLength={maxLength}
            autoCapitalize={autoCapitalize}
            autoFocus={autoFocus}
            returnKeyType={returnKeyType}
            onSubmitEditing={onSubmitEditing}
            editable={editable}
            textAlign={textAlign}
            textAlignVertical={multiline ? "top" : "center"}
            style={[
              styles.input,
              multiline ? styles.inputMultiline : null,
            ]}
          />
        </View>

        {icon && iconPosition === "right" && (
          <View className="ml-2">{icon}</View>
        )}
      </View>

      {error && <Text style={styles.error}>{error}</Text>}
    </View>
  );
});

const styles = StyleSheet.create({
  label: {
    ...typography.label,
    color: colors.textSecondary,
    marginBottom: spacing.xs,
  },
  container: {
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: spacing.md,
  },
  multilineContainer: {
    paddingVertical: spacing.sm,
  },
  inputWrap: {
    flex: 1,
    justifyContent: "center",
    minHeight: 44,
  },
  inputWrapMultiline: {
    justifyContent: "flex-start",
  },
  input: {
    color: colors.textPrimary,
    fontSize: 16,
    paddingVertical: 0,
    minHeight: 24,
  },
  inputMultiline: {
    paddingTop: spacing.xs,
    minHeight: 72,
  },
  error: {
    ...typography.small,
    color: colors.danger,
    marginTop: spacing.xs,
  },
});
