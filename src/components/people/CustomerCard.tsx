import { Image, Linking, Text, TouchableOpacity, View } from "react-native";
import React, { memo } from "react";
import { formatRelativeActivity, daysSince } from "../../utils/helper";
import { colors, spacing, typography } from "../../utils/theme";
import { Phone, MessageCircle } from "lucide-react-native";
import MoneyAmount from "../ui/MoneyAmount";

type CustomerStatus = "Overdue" | "Pending" | "Paid" | "Advance";

type Props = {
  name: string;
  phone?: string;
  avatar?: string;
  isOverdue?: boolean;
  outstandingBalance?: number;
  lastActiveAt?: string;
  lastOrderAt?: string; // For calculating days overdue
  onPress?: () => void;
  onLongPress?: () => void;
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

const WHATSAPP_GREEN = "#25D366";

// Design system status chip colors
const STATUS_UIMAP: Record<CustomerStatus, { badgeBg: string; badgeText: string; amountText: string; textLabel: string }> = {
  Overdue: {
    badgeBg: colors.overdue.bg,
    badgeText: colors.overdue.text,
    amountText: colors.danger,
    textLabel: "OVERDUE",
  },
  Pending: {
    badgeBg: colors.pending.bg,
    badgeText: colors.pending.text,
    amountText: colors.warning,
    textLabel: "PENDING",
  },
  Paid: {
    badgeBg: colors.paid.bg,
    badgeText: colors.paid.text,
    amountText: colors.primary,
    textLabel: "PAID",
  },
  Advance: {
    badgeBg: colors.primaryBlueBg,
    badgeText: colors.primaryBlue,
    amountText: colors.primary,
    textLabel: "ADVANCE",
  },
};

export default memo(function CustomerCard({
  name,
  phone,
  avatar,
  isOverdue = false,
  outstandingBalance = 0,
  lastActiveAt,
  lastOrderAt,
  onPress,
  onLongPress,
}: Props) {
  const status = getStatus(isOverdue, outstandingBalance);
  const ui = STATUS_UIMAP[status];

  const displayBalance = status === "Paid" ? 0 : Math.abs(outstandingBalance);
  
  // Calculate days overdue for display
  const daysOverdue = lastOrderAt ? daysSince(lastOrderAt) : null;
  const showDaysOverdue = status === "Overdue" && daysOverdue && daysOverdue > 0;
  
  // Avatar background color
  const avatarBgColor = getAvatarColor(name);

  // Quick action handlers
  const handleCall = () => {
    if (phone) Linking.openURL(`tel:${phone}`);
  };
  
  const handleWhatsApp = () => {
    if (phone) {
      const message = encodeURIComponent(`Hi ${name.split(' ')[0]}, this is a reminder about your outstanding balance of ₹${outstandingBalance?.toLocaleString('en-IN') || 0}. Please clear when convenient. - KredBook`);
      Linking.openURL(`whatsapp://send?phone=${phone.replace(/\D/g, '')}&text=${message}`);
    }
  };

  return (
    <TouchableOpacity
      onPress={onPress}
      onLongPress={onLongPress}
      activeOpacity={0.7}
      className="flex-row items-center bg-surface rounded-2xl border border-border"
      style={{
        padding: spacing.cardPadding,
        marginBottom: spacing.md,
        shadowColor: colors.textPrimary,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.04,
        shadowRadius: 8,
        elevation: 2,
      }}
    >
      {/* Avatar */}
      {avatar ? (
        <Image
          source={{ uri: avatar }}
          className="rounded-full mr-3.5"
          style={{ width: spacing.avatarMd, height: spacing.avatarMd }}
        />
      ) : (
        <View
          className="rounded-full mr-3.5 items-center justify-center"
          style={{
            width: spacing.avatarMd,
            height: spacing.avatarMd,
            borderRadius: spacing.avatarMd / 2,
            backgroundColor: avatarBgColor,
          }}
        >
          <Text
            className="tracking-wide text-surface"
            style={{ fontSize: 15, fontWeight: "700" as const }}
          >
            {getInitials(name)}
          </Text>
        </View>
      )}

      {/* Name + Phone + Days Overdue */}
      <View className="flex-1 mr-2.5">
        <Text
          className="text-base font-semibold text-textPrimary mb-0.5"
          numberOfLines={1}
        >
          {name}
        </Text>
        <View className="flex-row items-center gap-2">
          {showDaysOverdue && (
            <View className="flex-row items-center">
              <View 
                className="rounded-full px-1.5 py-0.5"
                style={{ backgroundColor: colors.overdue.bg }}
              >
                <Text 
                  className="text-[10px] font-bold"
                  style={{ color: colors.overdue.text }}
                >
                  {daysOverdue}d overdue
                </Text>
              </View>
            </View>
          )}
          <Text className="text-xs font-medium text-textSecondary">
            {formatRelativeActivity(lastActiveAt)}
          </Text>
        </View>
        
        {/* Quick action buttons (show on overdue only) */}
        {status === "Overdue" && phone && (
          <View className="flex-row items-center gap-2 mt-2">
            <TouchableOpacity
              onPress={handleCall}
              className="flex-row items-center bg-primaryLight rounded-full px-2 py-1"
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            >
              <Phone size={12} color={colors.primary} strokeWidth={2} />
              <Text className="text-[10px] font-semibold text-primary ml-1">Call</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={handleWhatsApp}
              className="flex-row items-center rounded-full px-2 py-1"
              style={{ backgroundColor: `${WHATSAPP_GREEN}1A` }}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            >
              <MessageCircle size={12} color={WHATSAPP_GREEN} strokeWidth={2} />
              <Text className="text-[10px] font-semibold ml-1" style={{ color: WHATSAPP_GREEN }}>
                Remind
              </Text>
            </TouchableOpacity>
          </View>
        )}
      </View>

      {/* Amount + Pill Badge */}
      <View className="items-end space-y-1.5">
        <MoneyAmount
          value={displayBalance}
          color={ui.amountText}
          style={[typography.cardTitle, { fontWeight: "800" as const }]}
        />
        <View 
          className="rounded-full px-2 py-1"
          style={{ backgroundColor: ui.badgeBg }}
        >
          <Text 
            className="text-[11px] font-bold uppercase tracking-wider"
            style={{ color: ui.badgeText }}
          >
            {ui.textLabel}
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );
});
