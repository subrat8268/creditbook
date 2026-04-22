import { Image, Linking, Text, TouchableOpacity, View } from "react-native";
import React, { memo } from "react";
import { formatRelativeActivity } from "../../utils/helper";
import { colors, radius, spacing, typography } from "../../utils/theme";
import { ChevronRight, MessageCircle, Phone, Plus } from "lucide-react-native";
import Avatar from "../ui/Avatar";
import MoneyAmount from "../ui/MoneyAmount";
import StatusBadge from "../dashboard/StatusBadge";

type CustomerStatus = "Overdue" | "Pending" | "Paid" | "Advance";

type Props = {
  name: string;
  phone?: string;
  avatar?: string;
  isOverdue?: boolean;
  outstandingBalance?: number;
  lastActiveAt?: string;
  onPress?: () => void;
  onLongPress?: () => void;
  onAddEntry?: () => void;
};

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
    amountText: colors.success,
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
  onPress,
  onLongPress,
  onAddEntry,
}: Props) {
  const status = getStatus(isOverdue, outstandingBalance);
  const ui = STATUS_UIMAP[status];
  const badgeStatus = status === "Advance" ? null : status;

  const displayBalance = status === "Paid" ? 0 : Math.abs(outstandingBalance);

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
      className="bg-surface rounded-2xl border border-border"
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
      <View className="flex-row items-start">
        {avatar ? (
          <Image
            source={{ uri: avatar }}
            className="rounded-full mr-3.5"
            style={{ width: spacing.avatarMd, height: spacing.avatarMd }}
          />
        ) : (
          <View className="mr-3.5">
            <Avatar name={name} size="md" />
          </View>
        )}

        <View className="flex-1 mr-3">
          <Text style={typography.cardTitle} numberOfLines={1}>
            {name}
          </Text>
          <Text style={[typography.caption, { marginTop: 2 }]}>
            {formatRelativeActivity(lastActiveAt)}
          </Text>
        </View>

        <View className="items-end">
          <MoneyAmount
            value={displayBalance}
            variant="title"
            color={ui.amountText}
            style={{ fontWeight: "800" }}
          />
          <View style={{ marginTop: spacing.xs }}>
            {badgeStatus ? (
              <StatusBadge status={badgeStatus} />
            ) : (
              <View
                style={{
                  backgroundColor: ui.badgeBg,
                  borderRadius: radius.full,
                  paddingHorizontal: spacing.chipPadding,
                  paddingVertical: spacing.xs,
                  minHeight: spacing.chipHeight,
                  justifyContent: "center",
                }}
              >
                <Text style={[typography.caption, { fontSize: 11, fontWeight: "600", color: ui.badgeText }]}>
                  {ui.textLabel}
                </Text>
              </View>
            )}
          </View>
        </View>
      </View>

      <View
        className="flex-row items-center justify-between"
        style={{ marginTop: spacing.lg }}
      >
        {onAddEntry ? (
          <TouchableOpacity
            onPress={onAddEntry}
            activeOpacity={0.8}
            className="flex-row items-center self-start px-3 py-1.5 rounded-full bg-primaryLight border border-primary"
          >
            <Plus size={12} color={colors.primary} strokeWidth={2.5} />
            <Text className="ml-1 text-[11px] font-semibold text-primary">
              Add Entry
            </Text>
          </TouchableOpacity>
        ) : (
          <View />
        )}

        {status === "Overdue" && phone ? (
          <View className="flex-row items-center gap-2">
            <TouchableOpacity
              onPress={handleCall}
              className="flex-row items-center bg-primaryLight rounded-full px-2.5 py-1.5"
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            >
              <Phone size={12} color={colors.primary} strokeWidth={2} />
              <Text className="text-[10px] font-semibold text-primary ml-1">Call</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={handleWhatsApp}
              className="flex-row items-center rounded-full px-2.5 py-1.5"
              style={{ backgroundColor: `${WHATSAPP_GREEN}1A` }}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            >
              <MessageCircle size={12} color={WHATSAPP_GREEN} strokeWidth={2} />
              <Text className="text-[10px] font-semibold ml-1" style={{ color: WHATSAPP_GREEN }}>
                Remind
              </Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View className="flex-row items-center" style={{ gap: spacing.xs }}>
            <Text style={typography.caption}>View details</Text>
            <ChevronRight size={14} color={colors.textSecondary} strokeWidth={2} />
          </View>
        )}
      </View>
    </TouchableOpacity>
  );
});
