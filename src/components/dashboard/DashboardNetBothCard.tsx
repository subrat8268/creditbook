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
      className="bg-white rounded-3xl p-6 mb-5 border border-slate-100 items-center overflow-hidden"
      style={{
        shadowColor: "#000",
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
            backgroundColor: "rgba(34,197,94,0.1)",
          }}
        >
          <Text
            style={{
              fontSize: 12,
              fontWeight: "600",
              color: "#16A34A",
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
            backgroundColor: "#F8FAFC",
            borderColor: "#F1F5F9",
          }}
        >
          <View className="flex-row items-center gap-1.5 mb-2">
            <ArrowDownLeft size={14} color="#16A34A" strokeWidth={2.5} />
            <Text style={{ fontSize: 11, fontWeight: "600", color: "#64748B" }}>
              TO RECEIVE
            </Text>
          </View>
          <Text style={{ fontSize: 18, fontWeight: "700", color: "#16A34A" }}>
            {formatINR(toReceive)}
          </Text>
        </View>

        <View
          className="flex-1 rounded-2xl border p-4 items-start"
          style={{
            backgroundColor: "#FDFDFD",
            borderColor: "#F1F5F9",
          }}
        >
          <View className="flex-row items-center gap-1.5 mb-2">
            <ArrowUpRight size={14} color="#DC2626" strokeWidth={2.5} />
            <Text style={{ fontSize: 11, fontWeight: "600", color: "#64748B" }}>
              TO GIVE
            </Text>
          </View>
          <Text style={{ fontSize: 18, fontWeight: "700", color: "#DC2626" }}>
            {formatINR(toGive)}
          </Text>
        </View>
      </View>
    </Pressable>
  );
}
