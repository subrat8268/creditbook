import { formatINR } from "@/src/utils/dashboardUi";
import { colors } from "@/src/utils/theme";
import { BarChart2, Smartphone } from "lucide-react-native";
import { Text, TouchableOpacity, View } from "react-native";

// ─── Props ────────────────────────────────────────────────────────────────────
// weekDelta: positive = up vs last week, negative = down, undefined = hide row
type Props = {
  label: string;
  amount: number;
  weekDelta?: number;
  onViewReport?: () => void;
  onSendReminder?: () => void;
};

// ─── DashboardHeroCard ────────────────────────────────────────────────────────
// Red hero card shown in seller and distributor modes.
// Action buttons are embedded inside the card (not a separate ActionBar below).
export default function DashboardHeroCard({
  label,
  amount,
  weekDelta,
  onViewReport,
  onSendReminder,
}: Props) {
  const showDelta = weekDelta !== undefined && weekDelta !== 0;
  const deltaUp = (weekDelta ?? 0) >= 0;

  return (
    <View
      className="rounded-3xl p-6 mb-3"
      style={{
        backgroundColor: colors.danger.DEFAULT, // #E74C3C — red hero
        shadowColor: colors.danger.dark,
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.35,
        shadowRadius: 16,
        elevation: 8,
      }}
    >
      {/* Label — small all-caps, semi-transparent white */}
      <Text
        className="text-[11px] font-bold tracking-[1.6px] mb-2.5"
        style={{ color: "rgba(255,255,255,0.75)" }}
      >
        {label}
      </Text>

      {/* Amount */}
      <Text
        className="font-extrabold tracking-tight mb-1"
        style={{ color: colors.white, fontSize: 40, lineHeight: 48 }}
      >
        {formatINR(amount)}
      </Text>

      {/* Trend row — only rendered when weekDelta is provided */}
      <View className="mb-4">
        {showDelta && (
          <View className="flex-row items-center gap-1 mt-1">
            <Text style={{ color: "rgba(255,255,255,0.85)", fontSize: 13 }}>
              {deltaUp ? "↑" : "↓"} {formatINR(Math.abs(weekDelta!))} from last
              week
            </Text>
          </View>
        )}
      </View>

      {/* Action buttons — semi-transparent white on red bg */}
      <View className="flex-row gap-3">
        <TouchableOpacity
          className="flex-1 flex-row items-center justify-center gap-2 py-3 rounded-xl"
          style={{ backgroundColor: "rgba(255,255,255,0.22)" }}
          onPress={onViewReport}
          activeOpacity={0.72}
        >
          <BarChart2 size={17} color={colors.white} strokeWidth={2} />
          <Text
            className="text-sm font-semibold"
            style={{ color: colors.white }}
          >
            View Report
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          className="flex-1 flex-row items-center justify-center gap-2 py-3 rounded-xl"
          style={{ backgroundColor: "rgba(255,255,255,0.22)" }}
          onPress={onSendReminder}
          activeOpacity={0.72}
        >
          <Smartphone size={17} color={colors.white} strokeWidth={2} />
          <Text
            className="text-sm font-semibold"
            style={{ color: colors.white }}
          >
            Send Reminder
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}
