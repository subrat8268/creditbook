import { RecentActivityItem } from "@/src/api/dashboard";
import { colors, radius, spacing, typography } from "@/src/utils/theme";
import React, { memo } from "react";
import { Text, View } from "react-native";

type Props = { status: RecentActivityItem["status"] };

export default memo(function StatusBadge({ status }: Props) {
  const map = {
    Paid: { bg: colors.paid.bg, text: colors.paid.text, label: "Paid" },
    Pending: { bg: colors.pending.bg, text: colors.pending.text, label: "Pending" },
    Overdue: { bg: colors.overdue.bg, text: colors.overdue.text, label: "Overdue" },
    "Partially Paid": {
      bg: colors.partial.bg,
      text: colors.partial.text,
      label: "Partial",
    },
  } as const;

  const s = map[status] ?? map["Pending"];

  return (
    <View
      style={{
        backgroundColor: s.bg,
        borderRadius: radius.full,
        minHeight: spacing.chipHeight,
        paddingHorizontal: spacing.chipPadding,
        paddingVertical: spacing.xs,
        alignSelf: "flex-end",
      }}
    >
      <Text
        style={{
          ...typography.caption,
          fontSize: 11,
          fontWeight: "600",
          color: s.text,
        }}
      >
        {s.label}
      </Text>
    </View>
  );
});
