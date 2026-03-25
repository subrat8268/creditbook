import { Image, Text, TouchableOpacity, View } from "react-native";
import { formatRelativeActivity } from "../../utils/helper";
import { colors, spacing, typography } from "../../utils/theme";

type CustomerStatus = "Overdue" | "Pending" | "Paid" | "Advance";

type Props = {
  name: string;
  phone: string;
  avatar?: string;
  isOverdue?: boolean;
  outstandingBalance?: number;
  /** ISO timestamp of last activity — shown as relative time */
  lastActiveAt?: string;
  onPress?: () => void;
};

// --- Helpers ---

const AVATAR_COLORS = [
  colors.danger, // Red
  colors.warning, // Amber
  colors.primary, // Green
  colors.fab, // Blue
  "#9B59B6", // purple — decorative avatar only
  "#E91E8C", // pink   — decorative avatar only
  "#00BCD4", // teal   — decorative avatar only
  "#FF5722", // deep orange — decorative avatar only
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

function getStatus(isOverdue: boolean, balance: number): CustomerStatus {
  if (balance > 0 && isOverdue) return "Overdue";
  if (balance > 0 && !isOverdue) return "Pending";
  if (balance < 0) return "Advance";
  return "Paid";
}

function formatAmount(status: CustomerStatus, balance: number): string {
  if (status === "Paid") return "\u20B90";
  return `\u20B9${Math.abs(balance).toLocaleString("en-IN")}`;
}

const STATUS_STYLES: Record<
  CustomerStatus,
  { text: string; border: string; bg: string }
> = {
  Overdue: {
    text: colors.overdue.text,
    border: colors.danger,
    bg: colors.overdue.bg,
  },
  Pending: {
    text: colors.pending.text,
    border: colors.warning,
    bg: colors.pending.bg,
  },
  Paid: {
    text: colors.paid.text,
    border: colors.primary,
    bg: colors.paid.bg,
  },
  Advance: {
    text: colors.textPrimary,
    border: colors.fab,
    bg: "#EFF6FF",
  },
};

const AMOUNT_COLOR: Record<CustomerStatus, string> = {
  Overdue: colors.danger,
  Pending: colors.warning,
  Paid: colors.textPrimary,
  Advance: colors.textPrimary,
};

// --- Component ---

export default function CustomerCard({
  name,
  phone,
  avatar,
  isOverdue = false,
  outstandingBalance = 0,
  lastActiveAt,
  onPress,
}: Props) {
  const status = getStatus(isOverdue, outstandingBalance);
  const amountText = formatAmount(status, outstandingBalance);
  const { text: badgeText, border, bg } = STATUS_STYLES[status];
  const avatarColor = getAvatarColor(name);

  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.7}
      style={{
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: colors.surface,
        paddingHorizontal: spacing.screenPadding,
        paddingVertical: 15,
        borderBottomWidth: 1,
        borderBottomColor: colors.border,
      }}
    >
      {/* Avatar */}
      {avatar ? (
        <Image
          source={{ uri: avatar }}
          style={{
            width: spacing.avatarMd,
            height: spacing.avatarMd,
            borderRadius: spacing.avatarMd / 2,
            marginRight: 14,
          }}
        />
      ) : (
        <View
          style={{
            width: spacing.avatarMd,
            height: spacing.avatarMd,
            borderRadius: spacing.avatarMd / 2,
            marginRight: 14,
            alignItems: "center",
            justifyContent: "center",
            backgroundColor: avatarColor,
          }}
        >
          <Text
            style={{
              fontSize: 17,
              fontWeight: "700",
              letterSpacing: 0.3,
              color: colors.surface,
            }}
          >
            {getInitials(name)}
          </Text>
        </View>
      )}

      {/* Name + Phone */}
      <View style={{ flex: 1, marginRight: 10 }}>
        <Text
          style={{
            ...typography.cardTitle,
            marginBottom: 3,
            color: colors.textPrimary,
          }}
          numberOfLines={1}
        >
          {name}
        </Text>
        <Text
          style={{
            ...typography.caption,
            color: colors.textSecondary,
          }}
        >
          Last activity: {formatRelativeActivity(lastActiveAt)}
        </Text>
      </View>

      {/* Amount + Badge */}
      <View style={{ alignItems: "flex-end", gap: 5 }}>
        <Text
          style={{
            fontSize: 16,
            fontWeight: "700",
            color: AMOUNT_COLOR[status],
          }}
        >
          {amountText}
        </Text>
        <View
          style={{
            borderWidth: 1,
            borderRadius: 6,
            paddingHorizontal: spacing.sm,
            paddingVertical: 3,
            borderColor: border,
            backgroundColor: bg,
          }}
        >
          <Text
            style={{
              ...typography.label,
              color: badgeText,
            }}
          >
            {status.toUpperCase()}
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );
}
