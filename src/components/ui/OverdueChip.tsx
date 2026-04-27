import React, { memo } from "react";
import { Text, View } from "react-native";
import { useTheme } from "@/src/utils/ThemeProvider";

type Props = {
  days?: number;
  variant?: "badge" | "inline";
};

const OverdueChip = memo(({ days, variant = "badge" }: Props) => {
  const { colors } = useTheme();
  const label = days != null ? `${days}d overdue` : "Overdue";

  if (variant === "inline") {
    return (
      <Text style={{ color: colors.overdue.text, fontSize: 12, fontWeight: "600" }}>
        {label}
      </Text>
    );
  }

  return (
    <View
      style={{
        backgroundColor: colors.overdue.bg,
        borderRadius: 99,
        paddingHorizontal: 8,
        paddingVertical: 3,
      }}
    >
      <Text
        style={{
          color: colors.overdue.text,
          fontSize: 11,
          fontWeight: "700",
          letterSpacing: 0.3,
        }}
      >
        {label.toUpperCase()}
      </Text>
    </View>
  );
});

export default OverdueChip;