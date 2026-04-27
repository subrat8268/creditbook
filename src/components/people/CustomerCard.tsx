import { Linking, Pressable, StyleSheet, Text } from "react-native";
import { memo, useMemo } from "react";
import { formatRelativeActivity } from "../../utils/helper";
import { Phone, Plus } from "lucide-react-native";
import Avatar from "../ui/Avatar";
import ListItem from "@/src/components/layer2/ListItem";
import { useTheme } from "@/src/utils/ThemeProvider";

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
  const { colors } = useTheme();
  const status = getStatus(isOverdue, outstandingBalance);

  const STATUS_UIMAP: Record<CustomerStatus, { amountText: string; status: CustomerStatus }> = {
    Overdue: { amountText: colors.overdue.text, status: "Overdue" },
    Pending: { amountText: colors.warning, status: "Pending" },
    Paid: { amountText: colors.success, status: "Paid" },
    Advance: { amountText: colors.primary, status: "Advance" },
  };
  const ui = STATUS_UIMAP[status];

  const displayBalance = status === "Paid" ? 0 : Math.abs(outstandingBalance);

  const handleCall = () => {
    if (phone) Linking.openURL(`tel:${phone}`);
  };

  const styles = useMemo(
    () =>
      StyleSheet.create({
        addEntryBtn: {
          borderColor: colors.border,
          backgroundColor: colors.surfaceAlt,
        },
        addEntryText: {
          marginLeft: 4,
          fontSize: 11,
          fontWeight: "600",
          color: colors.textSecondary,
        },
        callBtn: {
          flexDirection: "row",
          alignItems: "center",
          backgroundColor: colors.primaryBlueBg,
          paddingHorizontal: 10,
          paddingVertical: 6,
          borderRadius: 999,
          alignSelf: "flex-start",
        },
        callText: {
          marginLeft: 4,
          fontSize: 10,
          fontWeight: "600",
          color: colors.primary,
        },
      }),
    [colors],
  );

  const secondaryAction = onAddEntry ? (
    <Pressable
      onPress={onAddEntry}
      style={({ pressed }) => [{ opacity: pressed ? 0.8 : 1 }, styles.addEntryBtn]}
    >
      <Plus size={12} color={colors.textSecondary} strokeWidth={2.5} />
      <Text style={styles.addEntryText}>Add Entry</Text>
    </Pressable>
  ) : undefined;

  const footerRight = status === "Overdue" && phone ? (
    <Pressable onPress={handleCall} style={styles.callBtn} hitSlop={8}>
      <Phone size={12} color={colors.primary} strokeWidth={2} />
      <Text style={styles.callText}>Call</Text>
    </Pressable>
  ) : undefined;

  return (
    <ListItem
      title={name}
      subtitle={formatRelativeActivity(lastActiveAt)}
      leftSlot={<Avatar name={name} size="md" />}
      amount={displayBalance}
      amountColor={ui.amountText}
      status={ui.status}
      onPress={onPress}
      secondaryAction={secondaryAction}
      footerRight={footerRight}
      compact
    />
  );
});