import { RecentActivityItem } from "@/src/api/dashboard";
import { dashboardPalette as C } from "@/src/utils/dashboardUi";
import React, { memo } from "react";
import { Text, View } from "react-native";

type Props = { status: RecentActivityItem["status"] };

export default memo(function StatusBadge({ status }: Props) {
  const map = {
    Paid: { bg: C.paidBg, text: C.paidText, label: "Paid" },
    Pending: { bg: C.pendingBg, text: C.pendingText, label: "Pending" },
    Overdue: { bg: C.overdueBg, text: C.overdueText, label: "Overdue" },
    "Partially Paid": {
      bg: C.partialBg,
      text: C.partialText,
      label: "Partial",
    },
  } as const;

  const s = map[status] ?? map["Pending"];

  return (
    <View
      style={{
        backgroundColor: s.bg,
        borderRadius: 20,
        paddingHorizontal: 10,
        paddingVertical: 3,
        alignSelf: "flex-end",
      }}
    >
      <Text style={{ fontSize: 11, fontWeight: "600", color: s.text }}>
        {s.label}
      </Text>
    </View>
  );
});