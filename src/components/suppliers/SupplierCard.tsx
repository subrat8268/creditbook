import { Text, TouchableOpacity, View } from "react-native";
import { daysSince, formatRelativeActivity } from "../../utils/helper";

import { Supplier } from "../../types/supplier";
import { colors } from "../../utils/theme";

// ── Avatar helpers — soft pastel bg + dark text (supplier visual identity) ───
const AVATAR_BG = [
  "#EEF2FF", // indigo-50
  colors.success.light, // green-100
  colors.info.light, // blue-100
  "#FDF4FF", // fuchsia-50
  "#EDE9FE", // purple-100
  "#FCE7F3", // pink-100
  "#CCFBF1", // teal-100
  "#F1F5F9", // slate-100
] as const;

const AVATAR_TEXT = [
  "#4338CA", // indigo-700
  colors.primary.dark, // #16A34A
  colors.info.dark, // #2563EB
  "#9333EA", // fuchsia-700
  "#6D28D9", // purple-700
  "#9D174D", // pink-800
  "#0F766E", // teal-700
  "#475569", // slate-600
] as const;

function getAvatarIdx(name: string): number {
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  return Math.abs(hash) % AVATAR_BG.length;
}

function getInitials(name: string): string {
  const parts = name.trim().split(" ").filter(Boolean);
  if (parts.length >= 2)
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  return name.substring(0, 2).toUpperCase();
}

// ── Status helpers ────────────────────────────────────────────────────────────
type SupplierStatus = "Overdue" | "Pending" | "Paid";

/** OVERDUE if balance > 0 and last delivery is >= 5 days ago; PENDING if balance > 0 but recent */
function getStatus(balance: number, lastDeliveryAt?: string): SupplierStatus {
  if (balance === 0) return "Paid";
  const days = lastDeliveryAt ? daysSince(lastDeliveryAt) : 0;
  return days >= 5 ? "Overdue" : "Pending";
}

const STATUS_CONFIG: Record<
  SupplierStatus,
  {
    label: string;
    text: string;
    border: string;
    bg: string;
    amountColor: string;
  }
> = {
  Overdue: {
    label: "OVERDUE",
    text: colors.danger.text,
    border: colors.danger.DEFAULT,
    bg: colors.danger.light,
    amountColor: colors.danger.DEFAULT,
  },
  Pending: {
    label: "PENDING",
    text: colors.warning.text,
    border: colors.warning.DEFAULT,
    bg: colors.warning.light,
    amountColor: colors.warning.DEFAULT,
  },
  Paid: {
    label: "PAID",
    text: colors.success.text,
    border: colors.primary.DEFAULT,
    bg: colors.success.light,
    amountColor: colors.neutral[900],
  },
};

// ── Component ─────────────────────────────────────────────────────────────────
type Props = {
  supplier: Supplier;
  onPress?: () => void;
};

export default function SupplierCard({ supplier, onPress }: Props) {
  const balance = supplier.balanceOwed ?? 0;
  const idx = getAvatarIdx(supplier.name);
  const initials = getInitials(supplier.name);
  const status = getStatus(balance, supplier.lastDeliveryAt);
  const { label, text, border, bg, amountColor } = STATUS_CONFIG[status];

  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.7}
      className="flex-row items-center bg-white px-5 py-[15px] border-b border-light"
    >
      {/* Avatar — pastel bg, dark initials */}
      <View
        className="w-[52px] h-[52px] rounded-full mr-[14px] items-center justify-center"
        style={{ backgroundColor: AVATAR_BG[idx] }}
      >
        <Text
          className="text-[17px] font-bold tracking-[0.3px]"
          style={{ color: AVATAR_TEXT[idx] }}
        >
          {initials}
        </Text>
      </View>

      {/* Name + Last delivery */}
      <View className="flex-1 mr-[10px]">
        <Text
          className="text-[15px] font-semibold mb-[3px] text-textDark"
          numberOfLines={1}
        >
          {supplier.name}
        </Text>
        <Text className="text-[13px] text-textSecondary">
          Last delivery: {formatRelativeActivity(supplier.lastDeliveryAt)}
        </Text>
      </View>

      {/* Amount + Status badge */}
      <View className="items-end gap-[5px]">
        <Text className="text-[16px] font-bold" style={{ color: amountColor }}>
          ₹{balance > 0 ? balance.toLocaleString("en-IN") : "0"}
        </Text>
        <View
          className="border rounded-[6px] px-2 py-[3px]"
          style={{ borderColor: border, backgroundColor: bg }}
        >
          <Text
            className="text-[11px] font-bold tracking-[0.4px]"
            style={{ color: text }}
          >
            {label}
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );
}
