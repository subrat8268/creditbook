import { useTheme } from "@/src/utils/ThemeProvider";
import React, { memo } from "react";
import { Text, TextProps } from "react-native";

type Variant = "hero" | "title" | "body" | "caption";

export type MoneyAmountProps = {
  value: number;
  /** Defaults to INR formatting with en-IN grouping */
  currencySymbol?: string;
  /** Show '+' for positive values (useful for payments) */
  showPlusForPositive?: boolean;
  /** Clamp decimals (default: 0) */
  maximumFractionDigits?: number;
  variant?: Variant;
  /** Override text color if needed */
  color?: string;
} & Omit<TextProps, "children">;

const inrFormatter = new Intl.NumberFormat("en-IN", {
  minimumFractionDigits: 0,
  maximumFractionDigits: 0,
});

function fmtAmount(
  value: number,
  maximumFractionDigits: number,
  currencySymbol: string,
  showPlusForPositive: boolean,
) {
  const sign = value < 0 ? "-" : showPlusForPositive && value > 0 ? "+" : "";
  const abs = Math.abs(value);
  const formatter =
    maximumFractionDigits === 0
      ? inrFormatter
      : new Intl.NumberFormat("en-IN", {
          minimumFractionDigits: 0,
          maximumFractionDigits,
        });
  return `${sign}${currencySymbol}${formatter.format(abs)}`;
}

export default memo(function MoneyAmount({
  value,
  currencySymbol = "₹",
  showPlusForPositive,
  maximumFractionDigits = 0,
  variant = "body",
  color,
  style,
  ...props
}: MoneyAmountProps) {
  const { colors, typography } = useTheme();

  const textStyle =
    variant === "hero"
      ? typography.heroAmount
      : variant === "title"
        ? typography.cardTitle
        : variant === "caption"
          ? typography.caption
          : typography.body;

  return (
    <Text
      {...props}
      style={[
        textStyle,
        {
          color:
            color ?? (variant === "hero" ? colors.surface : colors.textPrimary),
        },
        style,
      ]}
    >
      {fmtAmount(value, maximumFractionDigits, currencySymbol, !!showPlusForPositive)}
    </Text>
  );
});
