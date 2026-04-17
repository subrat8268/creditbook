import { Order } from "@/src/api/entries";
import { daysSince } from "@/src/utils/helper";
import { colors, spacing } from "@/src/utils/theme";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

// ── Helpers ───────────────────────────────────────────────────────────────────

const AVATAR_COLORS = [
  colors.danger,
  colors.warning,
  colors.primary,
  ...colors.avatarPalette,
] as const;

function getAvatarColor(name: string): string {
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  return AVATAR_COLORS[Math.abs(hash) % AVATAR_COLORS.length];
}

function getInitials(name: string): string {
  const parts = name.trim().split(" ").filter(Boolean);
  if (parts.length >= 2)
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  return name.substring(0, 2).toUpperCase();
}

const MONTHS = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
] as const;

function formatOrderDate(iso: string): string {
  const d = new Date(iso);
  return `${d.getDate()} ${MONTHS[d.getMonth()]} ${d.getFullYear()}`;
}

// ── Status chip config ────────────────────────────────────────────────────────

const STATUS_CONFIG = {
  Paid: { bg: colors.successBg, text: colors.primary, label: "PAID" },
  "Partially Paid": {
    bg: colors.warningBg,
    text: colors.warning,
    label: "PARTIAL",
  },
  Pending: {
    bg: colors.warningBg,
    text: colors.warning,
    label: "PENDING",
  },
  Overdue: {
    bg: colors.dangerBg,
    text: colors.danger,
    label: "OVERDUE",
  },
} as const;

type StatusKey = keyof typeof STATUS_CONFIG;

// ── Component ─────────────────────────────────────────────────────────────────

interface Props {
  order: Order;
  onPress: (orderId: string) => void;
}

export default function OrderCard({ order, onPress }: Props) {
  const isOverdue =
    order.status === "Pending" && daysSince(order.created_at) > 30;
  const statusKey: StatusKey = isOverdue
    ? "Overdue"
    : (order.status as StatusKey) in STATUS_CONFIG
      ? (order.status as StatusKey)
      : "Pending";
  const chip = STATUS_CONFIG[statusKey];
  const customerName = order.customer?.name ?? "Unknown Person";
  const avatarColor = getAvatarColor(customerName);

  // Determine amount color based on status
  const isPaid = statusKey === "Paid";
  const amountColor = isPaid ? colors.primary : colors.textPrimary;

  return (
    <TouchableOpacity
      onPress={() => onPress(order.id)}
      activeOpacity={0.8}
      style={styles.card}
    >
      {/* ── Left: Avatar ────────────────────────────────────────── */}
      <View className="flex-row items-center">
        <View
          className="items-center justify-center rounded-full shrink-0 mr-3"
          style={{
            width: spacing.avatarMd,
            height: spacing.avatarMd,
            borderRadius: spacing.avatarMd / 2,
            backgroundColor: avatarColor,
          }}
        >
          <Text className="text-surface text-[15px] font-bold">
            {getInitials(customerName)}
          </Text>
        </View>

        {/* ── Center: Name + Date ───────────────────────────────────────── */}
        <View className="flex-1 justify-center">
          <Text
            className="text-textPrimary text-[15px] font-bold"
            numberOfLines={1}
          >
            {customerName}
          </Text>
          <View className="flex-row items-center gap-2 mt-1">
            <Text className="text-textSecondary text-[12px]">
              {order.bill_number}
            </Text>
            <Text className="text-textSecondary text-[12px]">·</Text>
            <Text className="text-textSecondary text-[12px]">
              {formatOrderDate(order.created_at)}
            </Text>
          </View>
        </View>

        {/* ── Right: Amount + Status ────────────────────────────────────── */}
        <View className="items-end shrink-0">
          <Text
            className="text-[18px] font-bold mb-1"
            style={{ color: amountColor }}
          >
            ₹{order.total_amount.toLocaleString("en-IN")}
          </Text>
          <View
            className="rounded-full px-2 py-0.5"
            style={{ backgroundColor: chip.bg }}
          >
            <Text
              className="text-[10px] font-bold tracking-wider"
              style={{ color: chip.text }}
            >
              {chip.label}
            </Text>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderRadius: spacing.cardRadius,
    marginHorizontal: spacing.screenPadding,
    marginBottom: spacing.md,
    padding: 14,
    elevation: 2,
    shadowColor: colors.textPrimary,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
  },
});
