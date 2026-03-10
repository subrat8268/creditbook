import { colors } from "@/src/utils/theme";
import { Text, View } from "react-native";

// ─── Props ────────────────────────────────────────────────────────────────────
type Props = {
  activeBuyers: number;
  overdueCustomers: number;
};

// ─── DashboardStatCards ───────────────────────────────────────────────────────
// Two-column summary strip below the hero card.
// Layout: LABEL (caps) → BIG NUMBER → descriptor (small muted text)
// Overdue count is rendered in danger red to signal urgency at a glance.
export default function DashboardStatCards({
  activeBuyers,
  overdueCustomers,
}: Props) {
  return (
    <View className="flex-row gap-3 mb-7">
      {/* Active Buyers */}
      <View
        className="flex-1 bg-white rounded-[20px] p-[18px]"
        style={{
          shadowColor: "#000",
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.05,
          shadowRadius: 8,
          elevation: 2,
        }}
      >
        <Text
          className="text-[10px] tracking-widest font-bold mb-2"
          style={{ color: colors.neutral[500] }}
        >
          ACTIVE BUYERS
        </Text>
        <Text
          className="font-extrabold leading-none mb-1.5"
          style={{ color: colors.neutral[900], fontSize: 32 }}
        >
          {activeBuyers}
        </Text>
        <Text className="text-[12px]" style={{ color: colors.neutral[500] }}>
          customers
        </Text>
      </View>

      {/* Overdue */}
      <View
        className="flex-1 bg-white rounded-[20px] p-[18px]"
        style={{
          shadowColor: "#000",
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.05,
          shadowRadius: 8,
          elevation: 2,
        }}
      >
        <Text
          className="text-[10px] tracking-widest font-bold mb-2"
          style={{ color: colors.neutral[500] }}
        >
          OVERDUE
        </Text>
        <Text
          className="font-extrabold leading-none mb-1.5"
          style={{ color: colors.danger.DEFAULT, fontSize: 32 }}
        >
          {overdueCustomers}
        </Text>
        <Text className="text-[12px]" style={{ color: colors.neutral[500] }}>
          need follow-up
        </Text>
      </View>
    </View>
  );
}
