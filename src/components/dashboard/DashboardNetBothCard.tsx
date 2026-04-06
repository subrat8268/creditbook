import { formatINR } from "@/src/utils/dashboardUi";
import { colors, spacing, typography } from "@/src/utils/theme";
import { ArrowDownLeft, ArrowUpRight } from "lucide-react-native";
import { Pressable, Text, View } from "react-native";

type Props = {
  netAmount: number;
  weekDeltaPct?: number;
  toReceive: number;
  toGive: number;
  onPress?: () => void;
};

export default function DashboardNetBothCard({
  netAmount,
  weekDeltaPct,
  toReceive,
  toGive,
  onPress,
}: Props) {
  return (
    <Pressable
      onPress={onPress}
      className="bg-surface rounded-3xl p-6 mb-5 border border-borderLight items-center overflow-hidden"
      style={{
        shadowColor: colors.textPrimary,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.05,
        shadowRadius: 12,
        elevation: 3,
      }}
    >
      <Text
        style={{
          ...typography.label,
          color: colors.textSecondary,
          marginBottom: spacing.xs,
        }}
      >
        NET POSITION
      </Text>
      <Text
        style={{
          ...typography.heroAmount,
          color: colors.textPrimary,
          fontSize: 40,
          lineHeight: 48,
        }}
      >
        <Text style={{ fontSize: 24, color: colors.textSecondary }}>₹ </Text>
        {formatINR(Math.abs(netAmount)).replace("₹", "")}
      </Text>

      {weekDeltaPct !== undefined && weekDeltaPct !== 0 && (
        <View
          className="flex-row items-center mt-2 px-2.5 py-1 rounded-full mb-6"
          style={{
            backgroundColor: colors.successBg,
          }}
        >
          <Text
            style={{
              fontSize: 12,
              fontWeight: "600",
              color: colors.primaryDark,
            }}
          >
            {weekDeltaPct > 0 ? "↗" : "↘"} {Math.abs(weekDeltaPct)}% from last week
          </Text>
        </View>
      )}

      {/* The Two Sub-boxes */}
      <View className="flex-row w-full justify-between gap-3 mt-4">
        <View
          className="flex-1 rounded-2xl border p-4 items-start"
          style={{
            backgroundColor: colors.surfaceAlt,
            borderColor: colors.borderLight,
          }}
        >
          <View className="flex-row items-center gap-1.5 mb-2">
            <ArrowDownLeft size={14} color={colors.primaryDark} strokeWidth={2.5} />
            <Text style={{ fontSize: 11, fontWeight: "600", color: colors.textMuted }}>
              TO RECEIVE
            </Text>
          </View>
          <Text style={{ fontSize: 18, fontWeight: "700", color: colors.primaryDark }}>
            {formatINR(toReceive)}
          </Text>
        </View>

        <View
          className="flex-1 rounded-2xl border p-4 items-start"
          style={{
            backgroundColor: colors.surfaceAlt,
            borderColor: colors.borderLight,
          }}
        >
          <View className="flex-row items-center gap-1.5 mb-2">
            <ArrowUpRight size={14} color={colors.danger} strokeWidth={2.5} />
            <Text style={{ fontSize: 11, fontWeight: "600", color: colors.textMuted }}>
              TO GIVE
            </Text>
          </View>
          <Text style={{ fontSize: 18, fontWeight: "700", color: colors.danger }}>
            {formatINR(toGive)}
          </Text>
        </View>
      </View>
    </Pressable>
  );
}
