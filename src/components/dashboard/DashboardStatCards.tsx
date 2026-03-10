import { colors } from "@/src/utils/theme";
import { AlertTriangle, Users, Users2 } from "lucide-react-native";
import { Text, View } from "react-native";

// ─── Props ────────────────────────────────────────────────────────────────────
// mode drives: card label, descriptor text, and left icon
// seller      → "ACTIVE BUYERS"    / clients  | "OVERDUE"           / need follow-up
// distributor → "ACTIVE SUPPLIERS" / vendors  | "OVERDUE PAYMENTS"  / need follow-up
type Props = {
  mode?: "seller" | "distributor";
  primaryCount: number;
  overdueCount: number;
};

// ─── DashboardStatCards ───────────────────────────────────────────────────────
// Two-column summary strip below the hero card.
// Layout: LABEL (caps, muted) → BIG NUMBER → descriptor (small, muted)
// Overdue count always in danger red. Icons shown on the right.
export default function DashboardStatCards({
  mode = "seller",
  primaryCount,
  overdueCount,
}: Props) {
  const isDistributor = mode === "distributor";

  return (
    <View className="flex-row gap-3 mb-7">
      {/* Left card — buyers or suppliers */}
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
          {isDistributor ? "ACTIVE SUPPLIERS" : "ACTIVE BUYERS"}
        </Text>
        <View className="flex-row justify-between items-end">
          <View>
            <Text
              className="font-extrabold leading-none mb-1.5"
              style={{ color: colors.neutral[900], fontSize: 32 }}
            >
              {primaryCount}
            </Text>
            <Text
              className="text-[12px]"
              style={{ color: colors.neutral[500] }}
            >
              {isDistributor ? "vendors" : "customers"}
            </Text>
          </View>
          <View
            className="w-[38px] h-[38px] rounded-xl items-center justify-center"
            style={{ backgroundColor: colors.primary.light }}
          >
            {isDistributor ? (
              <Users2
                size={20}
                color={colors.primary.DEFAULT}
                strokeWidth={1.8}
              />
            ) : (
              <Users
                size={20}
                color={colors.primary.DEFAULT}
                strokeWidth={1.8}
              />
            )}
          </View>
        </View>
      </View>

      {/* Right card — overdue */}
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
          {isDistributor ? "OVERDUE PAYMENTS" : "OVERDUE"}
        </Text>
        <View className="flex-row justify-between items-end">
          <View>
            <Text
              className="font-extrabold leading-none mb-1.5"
              style={{ color: colors.danger.DEFAULT, fontSize: 32 }}
            >
              {overdueCount}
            </Text>
            <Text
              className="text-[12px]"
              style={{ color: colors.neutral[500] }}
            >
              need follow-up
            </Text>
          </View>
          <View
            className="w-[38px] h-[38px] rounded-xl items-center justify-center"
            style={{ backgroundColor: colors.danger.light }}
          >
            <AlertTriangle
              size={20}
              color={colors.danger.DEFAULT}
              strokeWidth={1.8}
            />
          </View>
        </View>
      </View>
    </View>
  );
}
