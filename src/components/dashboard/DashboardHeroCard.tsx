import { formatINR } from "@/src/utils/dashboardUi";
import { colors } from "@/src/utils/theme";
import { LinearGradient } from "expo-linear-gradient";
import { BarChart2, Smartphone } from "lucide-react-native";
import { Text, TouchableOpacity, View } from "react-native";

// ─── Types ────────────────────────────────────────────────────────────────────
// seller      → solid red, "View Report" + "Send Reminder"
// distributor → pink gradient, "View Suppliers →" + "Record Delivery"
// net         → dark navy gradient, no action buttons (NET POSITION card for both mode)
type Variant = "seller" | "distributor" | "net";

type Props = {
  variant?: Variant;
  label: string;
  amount: number;
  /** Short sub-info line below the amount, e.g. "4 active suppliers" */
  subInfo?: string;
  /** weekDelta > 0 = ↑, < 0 = ↓, undefined = hide row */
  weekDelta?: number;
  onPrimaryAction?: () => void;
  onSecondaryAction?: () => void;
};

// ─── Variant config ───────────────────────────────────────────────────────────
const SELLER_CONFIG = {
  primary: { icon: BarChart2, label: "View Report" },
  secondary: { icon: Smartphone, label: "Send Reminder" },
} as const;

// Distributor gradient: deep crimson-rose → magenta-rose
const DISTRIBUTOR_GRADIENT: readonly [string, string] = ["#B91C6A", "#E8336E"];
// Net Position gradient: dark navy (both mode)
const NET_GRADIENT: readonly [string, string] = ["#1E293B", "#0F172A"];

// ─── DashboardHeroCard ───────────────────────────────────────────────────────
export default function DashboardHeroCard({
  variant = "seller",
  label,
  amount,
  subInfo,
  weekDelta,
  onPrimaryAction,
  onSecondaryAction,
}: Props) {
  const isDistributor = variant === "distributor";
  const isNet = variant === "net";
  const config = SELLER_CONFIG;

  const showDelta = weekDelta !== undefined && weekDelta !== 0;
  const deltaUp = (weekDelta ?? 0) >= 0;

  // ── Net Position card — dark gradient, no buttons ─────────────────────────
  if (isNet) {
    return (
      <LinearGradient
        colors={NET_GRADIENT}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        className="rounded-3xl p-6 mb-3"
        style={{
          shadowColor: "#000",
          shadowOffset: { width: 0, height: 8 },
          shadowOpacity: 0.3,
          shadowRadius: 16,
          elevation: 8,
        }}
      >
        <Text
          className="text-[11px] font-bold tracking-[1.6px] mb-2.5"
          style={{ color: "rgba(255,255,255,0.6)" }}
        >
          {label}
        </Text>
        <Text
          className="font-extrabold tracking-tight"
          style={{ color: colors.white, fontSize: 40, lineHeight: 48 }}
        >
          {amount < 0 ? "−" : ""}
          {formatINR(Math.abs(amount))}
        </Text>
      </LinearGradient>
    );
  }

  const PrimaryIcon = config.primary.icon;
  const SecondaryIcon = config.secondary.icon;

  // ── Inner content — shared between both variants ──────────────────────────
  const content = (
    <>
      {/* Decorative circle blob — distributor only */}
      {isDistributor && (
        <View
          style={{
            position: "absolute",
            top: -40,
            right: -40,
            width: 160,
            height: 160,
            borderRadius: 80,
            backgroundColor: "rgba(255,255,255,0.12)",
          }}
        />
      )}

      {/* Label */}
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

      {/* Sub-info line — e.g. "4 active suppliers" */}
      {subInfo && (
        <Text
          className="text-[13px] mb-0.5"
          style={{ color: "rgba(255,255,255,0.82)" }}
        >
          {subInfo}
        </Text>
      )}

      {/* Trend row */}
      <View className="mb-4">
        {showDelta && (
          <Text
            className="text-[13px] mt-1"
            style={{ color: "rgba(255,255,255,0.85)" }}
          >
            {deltaUp ? "↑" : "↓"} {formatINR(Math.abs(weekDelta!))} this week
          </Text>
        )}
      </View>

      {/* Action buttons */}
      <View className="flex-row gap-3">
        <TouchableOpacity
          className="flex-1 flex-row items-center justify-center gap-2 py-3 rounded-xl"
          style={{ backgroundColor: "rgba(255,255,255,0.22)" }}
          onPress={onPrimaryAction}
          activeOpacity={0.72}
        >
          <PrimaryIcon size={17} color={colors.white} strokeWidth={2} />
          <Text
            className="text-sm font-semibold"
            style={{ color: colors.white }}
          >
            {config.primary.label}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          className="flex-1 flex-row items-center justify-center gap-2 py-3 rounded-xl"
          style={{ backgroundColor: "rgba(255,255,255,0.22)" }}
          onPress={onSecondaryAction}
          activeOpacity={0.72}
        >
          <SecondaryIcon size={17} color={colors.white} strokeWidth={2} />
          <Text
            className="text-sm font-semibold"
            style={{ color: colors.white }}
          >
            {config.secondary.label}
          </Text>
        </TouchableOpacity>
      </View>
    </>
  );

  // ── Distributor → LinearGradient wrapper ───────────────────────────────────
  if (isDistributor) {
    return (
      <LinearGradient
        colors={DISTRIBUTOR_GRADIENT}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        className="rounded-3xl p-6 mb-3 overflow-hidden"
        style={{
          shadowColor: "#B91C6A",
          shadowOffset: { width: 0, height: 8 },
          shadowOpacity: 0.35,
          shadowRadius: 16,
          elevation: 8,
        }}
      >
        {content}
      </LinearGradient>
    );
  }

  // ── Seller → solid red View wrapper ───────────────────────────────────────
  return (
    <View
      className="rounded-3xl p-6 mb-3"
      style={{
        backgroundColor: colors.danger.DEFAULT,
        shadowColor: colors.danger.dark,
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.35,
        shadowRadius: 16,
        elevation: 8,
      }}
    >
      {content}
    </View>
  );
}
