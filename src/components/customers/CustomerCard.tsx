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
  lastActiveAt?: string;
  onPress?: () => void;
};

function getAvatarColor(name: string): string {
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  const palette = colors.avatarPalette;
  return palette[Math.abs(hash) % palette.length];
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

const STATUS_UIMAP: Record<CustomerStatus, { badgeBg: string; badgeText: string; amountText: string; textLabel: string }> = {
  Overdue: {
    badgeBg: "bg-danger-light",
    badgeText: "text-danger-text",
    amountText: "text-danger",
    textLabel: "OVERDUE",
  },
  Pending: {
    badgeBg: "bg-warning-light",
    badgeText: "text-warning-dark",
    amountText: "text-warning",
    textLabel: "PENDING",
  },
  Paid: {
    badgeBg: "bg-success-light",
    badgeText: "text-success-text",
    amountText: "text-success",
    textLabel: "PAID",
  },
  Advance: {
    badgeBg: "bg-info-light",
    badgeText: "text-info-dark",
    amountText: "text-success",
    textLabel: "ADVANCE",
  },
};

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
  const amountStr = formatAmount(status, outstandingBalance);
  const ui = STATUS_UIMAP[status];
  
  // For avatar background, we must use style prop because standard tailwind config 
  // might not have these specific deterministic hex values from theme.avatarPalette generated as JIT classes.
  // All other styles use NativeWind classes exclusively.
  const avatarBgColor = getAvatarColor(name);

  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.7}
      className="flex-row items-center bg-surface p-4 rounded-2xl mb-3 border border-border"
      style={{
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.04,
        shadowRadius: 8,
        elevation: 2,
      }}
    >
      {/* Avatar (52x52) */}
      {avatar ? (
        <Image
          source={{ uri: avatar }}
          className="w-[52px] h-[52px] rounded-full mr-3.5"
        />
      ) : (
        <View
          className="w-[52px] h-[52px] rounded-full mr-3.5 items-center justify-center"
          style={{ backgroundColor: avatarBgColor }}
        >
          <Text className="text-[17px] font-bold tracking-wide text-surface">
            {getInitials(name)}
          </Text>
        </View>
      )}

      {/* Name + Phone */}
      <View className="flex-1 mr-2.5">
        <Text
          className="text-base font-semibold text-textPrimary mb-0.5"
          numberOfLines={1}
        >
          {name}
        </Text>
        <Text className="text-xs font-medium text-textSecondary">
          Last activity: {formatRelativeActivity(lastActiveAt)}
        </Text>
      </View>

      {/* Amount + Pill Badge */}
      <View className="items-end space-y-1.5">
        <Text className={`text-base font-bold ${ui.amountText}`}>
          {amountStr}
        </Text>
        <View className={`rounded-full px-2 py-1 ${ui.badgeBg}`}>
          <Text className={`text-[11px] font-bold uppercase tracking-wider ${ui.badgeText}`}>
            {ui.textLabel}
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );
}
