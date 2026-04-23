import { colors, radius, spacing, typography } from "@/src/utils/theme";
import { memo } from "react";
import { StyleSheet, Text, View } from "react-native";

type Status = "Paid" | "Pending" | "Overdue" | "Partially Paid" | "Advance";

type Props = {
  status: Status;
  align?: "left" | "right";
};

const STATUS_MAP: Record<Status, { bg: string; text: string; label: string }> = {
  Paid: { bg: colors.paid.bg, text: colors.paid.text, label: "Paid" },
  Pending: { bg: colors.pending.bg, text: colors.pending.text, label: "Pending" },
  Overdue: { bg: colors.overdue.bg, text: colors.overdue.text, label: "Overdue" },
  "Partially Paid": {
    bg: colors.partial.bg,
    text: colors.partial.text,
    label: "Partial",
  },
  Advance: {
    bg: colors.primaryBlueBg,
    text: colors.primaryBlue,
    label: "Advance",
  },
};

export default memo(function StatusBadge({ status, align = "right" }: Props) {
  const selected = STATUS_MAP[status] ?? STATUS_MAP.Pending;

  return (
    <View
      style={[
        styles.badge,
        { backgroundColor: selected.bg },
        align === "left" ? styles.left : styles.right,
      ]}
    >
      <Text style={[styles.label, { color: selected.text }]}>{selected.label}</Text>
    </View>
  );
});

const styles = StyleSheet.create({
  badge: {
    borderRadius: radius.full,
    minHeight: spacing.chipHeight,
    paddingHorizontal: spacing.chipPadding,
    paddingVertical: spacing.xs,
    justifyContent: "center",
  },
  right: {
    alignSelf: "flex-end",
  },
  left: {
    alignSelf: "flex-start",
  },
  label: {
    ...typography.caption,
    fontSize: 11,
    fontWeight: "600",
  },
});
