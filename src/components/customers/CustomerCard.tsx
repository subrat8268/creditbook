import { Image, Text, TouchableOpacity, View } from "react-native";
import { formatRelativeActivity } from "../../utils/helper";
import { colors } from "../../utils/theme";

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
  colors.danger.DEFAULT, // #E74C3C  red
  colors.warning.DEFAULT, // #F59E0B  amber/orange
  colors.primary.DEFAULT, // #22C55E  green
  colors.info.DEFAULT, // #4F9CFF  blue
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
    text: colors.danger.DEFAULT,
    border: colors.danger.DEFAULT,
    bg: colors.danger.light,
  },
  Pending: {
    text: colors.warning.DEFAULT,
    border: colors.warning.DEFAULT,
    bg: colors.warning.light,
  },
  Paid: {
    text: colors.success.text,
    border: colors.primary.light,
    bg: colors.success.light,
  },
  Advance: {
    text: colors.info.text,
    border: colors.info.DEFAULT,
    bg: colors.info.light,
  },
};

const AMOUNT_COLOR: Record<CustomerStatus, string> = {
  Overdue: colors.danger.DEFAULT,
  Pending: colors.warning.DEFAULT,
  Paid: colors.neutral[900],
  Advance: colors.neutral[900],
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
      className="flex-row items-center bg-white px-5 py-[15px] border-b border-light"
    >
      {/* Avatar */}
      {avatar ? (
        <Image
          source={{ uri: avatar }}
          className="w-[52px] h-[52px] rounded-full mr-[14px]"
        />
      ) : (
        <View
          className="w-[52px] h-[52px] rounded-full mr-[14px] items-center justify-center"
          style={{ backgroundColor: avatarColor }}
        >
          <Text
            className="text-[17px] font-bold tracking-[0.3px]"
            style={{ color: "#FFFFFF" }}
          >
            {getInitials(name)}
          </Text>
        </View>
      )}

      {/* Name + Phone */}
      <View className="flex-1 mr-[10px]">
        <Text
          className="text-[15px] font-semibold mb-[3px] text-textDark"
          numberOfLines={1}
        >
          {name}
        </Text>
        <Text className="text-[13px] text-textSecondary">
          Last activity: {formatRelativeActivity(lastActiveAt)}
        </Text>
      </View>

      {/* Amount + Badge */}
      <View className="items-end gap-[5px]">
        <Text
          className="text-[16px] font-bold"
          style={{ color: AMOUNT_COLOR[status] }}
        >
          {amountText}
        </Text>
        <View
          className="border rounded-[6px] px-2 py-[3px]"
          style={{ borderColor: border, backgroundColor: bg }}
        >
          <Text
            className="text-[11px] font-bold tracking-[0.4px]"
            style={{ color: badgeText }}
          >
            {status.toUpperCase()}
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );
}
