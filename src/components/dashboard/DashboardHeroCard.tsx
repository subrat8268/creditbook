import { formatINR } from "@/src/utils/dashboardUi";
import { colors, gradients, spacing, typography } from "@/src/utils/theme";
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
  /** Percentage change from last week — shown as pill badge on the net card */
  weekDeltaPct?: number;
  onPrimaryAction?: () => void;
  onSecondaryAction?: () => void;
};

// ─── Variant config ───────────────────────────────────────────────────────────
const SELLER_CONFIG = {
  primary: { icon: BarChart2, label: "View Report" },
  secondary: { icon: Smartphone, label: "Send Reminder" },
} as const;

// ─── DashboardHeroCard ───────────────────────────────────────────────────────
export default function DashboardHeroCard({
  variant = "seller",
  label,
  amount,
  subInfo,
  weekDelta,
  weekDeltaPct,
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
        colors={[gradients.netPosition, gradients.netPosition]}
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
          className="mb-2.5"
          style={{
            ...typography.label,
            color: "rgba(255,255,255,0.6)",
          }}
        >
          {label}
        </Text>
        <Text
          className="tracking-tight"
          style={{
            ...typography.heroAmount,
            fontSize: 40,
            lineHeight: 48,
          }}
        >
          {amount < 0 ? "−" : ""}
          {formatINR(Math.abs(amount))}
        </Text>
        {weekDeltaPct !== undefined && weekDeltaPct !== 0 && (
          <View
            className="flex-row items-center self-start mt-3 px-2.5 py-1 rounded-full"
            style={{
              backgroundColor:
                weekDeltaPct > 0
                  ? "rgba(34,197,94,0.2)"
                  : "rgba(239,68,68,0.2)",
            }}
          >
            <Text
              style={{
                fontSize: 12,
                fontWeight: "600",
                color: weekDeltaPct > 0 ? "#86EFAC" : "#FCA5A5",
              }}
            >
              {weekDeltaPct > 0 ? "↑" : "↓"} {Math.abs(weekDeltaPct)}% from last
              week
            </Text>
          </View>
        )}
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
        style={{
          ...typography.label,
          marginBottom: spacing.md,
          color: "rgba(255,255,255,0.75)",
        }}
      >
        {label}
      </Text>

      {/* Amount */}
      <Text
        className="tracking-tight"
        style={{
          ...typography.heroAmount,
          fontSize: 40,
          lineHeight: 48,
          marginBottom: spacing.xs,
        }}
      >
        {formatINR(amount)}
      </Text>

      {/* Sub-info line — e.g. "4 active suppliers" */}
      {subInfo && (
        <Text
          style={{
            ...typography.subtitle,
            marginBottom: spacing.lg,
            color: "rgba(255,255,255,0.82)",
          }}
        >
          {subInfo}
        </Text>
      )}

      {/* Trend row */}
      <View className="mb-4">
        {showDelta && (
          <Text
            style={{
              ...typography.subtitle,
              marginTop: spacing.xs,
              color: "rgba(255,255,255,0.85)",
            }}
          >
            {deltaUp ? "↑" : "↓"} {formatINR(Math.abs(weekDelta!))} from last
            week
          </Text>
        )}
      </View>

      {/* Action buttons */}
      <View className="flex-row gap-3">
        <TouchableOpacity
          className="flex-1 flex-row items-center justify-center gap-2 rounded-xl"
          style={{
            backgroundColor: "rgba(255,255,255,0.22)",
            paddingVertical: spacing.md,
          }}
          onPress={onPrimaryAction}
          activeOpacity={0.72}
        >
          <PrimaryIcon size={17} color={colors.surface} strokeWidth={2} />
          <Text
            style={{
              ...typography.body,
              color: colors.surface,
            }}
          >
            {config.primary.label}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          className="flex-1 flex-row items-center justify-center gap-2 rounded-xl"
          style={{
            backgroundColor: "rgba(255,255,255,0.22)",
            paddingVertical: spacing.md,
          }}
          onPress={onSecondaryAction}
          activeOpacity={0.72}
        >
          <SecondaryIcon size={17} color={colors.surface} strokeWidth={2} />
          <Text
            style={{
              ...typography.body,
              color: colors.surface,
            }}
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
        colors={[gradients.supplierHero.start, gradients.supplierHero.end]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        className="rounded-3xl p-6 mb-3 overflow-hidden"
        style={{
          shadowColor: gradients.supplierHero.start,
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

  // ── Seller → Linear gradient (red) ───────────────────────────────────────
  return (
    <LinearGradient
      colors={[gradients.customerHero.start, gradients.customerHero.end]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      className="rounded-3xl p-6 mb-3 overflow-hidden"
      style={{
        shadowColor: gradients.customerHero.start,
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
