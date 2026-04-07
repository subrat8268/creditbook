import { Order } from "@/src/api/orders";
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
  Paid: { bg: colors.paid.bg, text: colors.paid.text, label: "PAID" },
  "Partially Paid": {
    bg: colors.partial.bg,
    text: colors.partial.text,
    label: "PARTIAL",
  },
  Pending: {
    bg: colors.pending.bg,
    text: colors.pending.text,
    label: "PENDING",
  },
  Overdue: {
    bg: colors.overdue.bg,
    text: colors.overdue.text,
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
  const customerName = order.customer?.name ?? "Unknown Customer";
  const avatarColor = getAvatarColor(customerName);

  return (
    <TouchableOpacity
      onPress={() => onPress(order.id)}
      activeOpacity={0.8}
      style={styles.card}
    >
      {/* ── Main row ──────────────────────────────────────────────────── */}
      <View className="flex-row items-start">
        {/* Initials avatar */}
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

        {/* Center: customer name + bill number */}
        <View className="flex-1 justify-center">
          <Text
            className="text-textPrimary text-[15px] font-bold"
            numberOfLines={1}
          >
            {customerName}
          </Text>
          <Text
            className="text-textSecondary text-[13px] mt-0.5"
            numberOfLines={1}
          >
            {order.bill_number}
          </Text>
        </View>

        {/* Right: amount + status chip */}
        <View className="items-end shrink-0 ml-2">
          <Text className="text-textPrimary text-[17px] font-bold mb-[5px]">
            ₹{order.total_amount.toLocaleString("en-IN")}
          </Text>
          <View
            className="rounded-full px-2 py-[3px]"
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

      {/* ── Footer: date ─────────────────────────────────────────────── */}
      <Text className="text-textSecondary text-[13px] mt-[10px]">
        {formatOrderDate(order.created_at)}
      </Text>
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
