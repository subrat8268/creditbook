import { Linking, Pressable, Text } from "react-native";
import { memo } from "react";
import { formatRelativeActivity } from "../../utils/helper";
import { colors } from "../../utils/theme";
import { Phone, Plus } from "lucide-react-native";
import Avatar from "../ui/Avatar";
import ListItem from "@/src/components/layer2/ListItem";

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

const STATUS_UIMAP: Record<CustomerStatus, { amountText: string; status: CustomerStatus }> = {
  Overdue: { amountText: colors.danger, status: "Overdue" },
  Pending: { amountText: colors.warning, status: "Pending" },
  Paid: { amountText: colors.success, status: "Paid" },
  Advance: { amountText: colors.primary, status: "Advance" },
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

  const displayBalance = status === "Paid" ? 0 : Math.abs(outstandingBalance);

  // Quick action handlers
  const handleCall = () => {
    if (phone) Linking.openURL(`tel:${phone}`);
  };
  
  const secondaryAction = onAddEntry ? (
    <Pressable
      onPress={onAddEntry}
      style={({ pressed }) => [{ opacity: pressed ? 0.8 : 1 }]}
      className="flex-row items-center self-start px-3 py-1.5 rounded-full border border-border bg-surfaceAlt"
    >
      <Plus size={12} color={colors.textSecondary} strokeWidth={2.5} />
      <Text className="ml-1 text-[11px] font-semibold text-textSecondary">Add Entry</Text>
    </Pressable>
  ) : undefined;

  const footerRight = status === "Overdue" && phone ? (
    <Pressable
      onPress={handleCall}
      className="flex-row items-center rounded-full px-2.5 py-1.5 self-start bg-primaryLight"
      hitSlop={8}
    >
      <Phone size={12} color={colors.primary} strokeWidth={2} />
      <Text className="text-[10px] font-semibold text-primary ml-1">Call</Text>
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
