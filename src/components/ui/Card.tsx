import { colors, radius, spacing, typography } from "@/src/utils/theme";
import { clsx } from "clsx";
import React, { memo } from "react";
import { Text, View } from "react-native";

interface CardProps {
  title: string;
  value: string | number;
  icon?: React.ReactNode;
  className?: string;
}

const Card = memo(function Card({ title, value, icon, className }: CardProps) {
  return (
    <View
      className={clsx("flex-row justify-between items-center", className)}
      style={{
        backgroundColor: colors.surface,
        borderRadius: radius.lg,
        padding: spacing.cardPadding,
        borderWidth: 1,
        borderColor: colors.border,
        shadowColor: colors.textPrimary,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.04,
        shadowRadius: 8,
        elevation: 2,
      }}
    >
      <View>
        <Text style={[typography.caption, { marginBottom: spacing.xs }]}>{title}</Text>
        <Text style={typography.screenTitle}>{value}</Text>
      </View>
      {icon && (
        <View
          style={{
            backgroundColor: colors.iconBg,
            padding: spacing.md,
            borderRadius: radius.full,
          }}
        >
          {icon}
        </View>
      )}
    </View>
  );
});

export default Card;
