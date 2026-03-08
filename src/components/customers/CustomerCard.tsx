import { Image, Text, TouchableOpacity, View } from "react-native";

type CustomerStatus = "Overdue" | "Pending" | "Paid" | "Advance";

type Props = {
  name: string;
  phone: string;
  avatar?: string;
  isOverdue?: boolean;
  outstandingBalance?: number;
  onPress?: () => void;
};

// --- Helpers ---

const AVATAR_COLORS = [
  "#EF4444",
  "#F97316",
  "#EAB308",
  "#22C55E",
  "#14B8A6",
  "#3B82F6",
  "#8B5CF6",
  "#EC4899",
];

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
  const abs = Math.abs(balance).toFixed(2);
  if (status === "Advance") return `₹${abs}`;
  if (status === "Paid") return "₹0.00";
  return `-₹${abs}`;
}

const STATUS_STYLES: Record<
  CustomerStatus,
  { text: string; border: string; bg: string }
> = {
  Overdue: { text: "#E74C3C", border: "#E74C3C", bg: "#FFF0EE" },
  Pending: { text: "#F39C12", border: "#F39C12", bg: "#FFF8EE" },
  Paid: { text: "#2ECC71", border: "#2ECC71", bg: "#EDFAF4" },
  Advance: { text: "#0369A1", border: "#4F9CFF", bg: "#EAF0FB" },
};

const AMOUNT_COLOR: Record<CustomerStatus, string> = {
  Overdue: "#E74C3C",
  Pending: "#F39C12",
  Paid: "#1C1C1E",
  Advance: "#1C1C1E",
};

// --- Component ---

export default function CustomerCard({
  name,
  phone,
  avatar,
  isOverdue = false,
  outstandingBalance = 0,
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
      className="flex-row items-center bg-white px-5 py-[15px] border-b border-[#F0F0F5]"
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
          style={{ backgroundColor: avatarColor + "22" }}
        >
          <Text
            className="text-[17px] font-bold tracking-[0.3px]"
            style={{ color: avatarColor }}
          >
            {getInitials(name)}
          </Text>
        </View>
      )}

      {/* Name + Phone */}
      <View className="flex-1 mr-[10px]">
        <Text
          className="text-[15px] font-semibold text-[#1C1C1E] mb-[3px]"
          numberOfLines={1}
        >
          {name}
        </Text>
        <Text className="text-[13px] text-[#8E8E93]">{phone}</Text>
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
