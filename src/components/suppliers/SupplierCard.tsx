import { Text, TouchableOpacity, View } from "react-native";
import { daysSince, formatRelativeActivity } from "../../utils/helper";

import { Supplier } from "../../types/supplier";
import { colors } from "../../utils/theme";

// ── Avatar helpers — soft pastel bg + dark text (supplier visual identity) ───
const AVATAR_BG = [
  "#EEF2FF", // indigo-50
  "#FDF4FF", // fuchsia-50
  "#EAF0FB", // blue-100
  "#FDF2F8", // pink-50
  "#EDE9FE", // purple-100
  "#FFF1F2", // rose-50
  "#CCFBF1", // teal-100
  "#F1F5F9", // slate-100
] as const;

const AVATAR_TEXT = [
  "#4338CA", // indigo-700
  "#9333EA", // fuchsia-700
  colors.fab, // #2563EB
  colors.supplierPrimary, // Pink - #DB2777
  "#6D28D9", // purple-700
  "#BE123C", // rose-700
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

// ── Component ─────────────────────────────────────────────────────────────────
type Props = {
  supplier: Supplier;
  onPress?: () => void;
};

export function SupplierCard({ supplier, onPress }: Props) {
  const balance = supplier.balanceOwed ?? 0;
  const idx = getAvatarIdx(supplier.name);
  const initials = getInitials(supplier.name);

  // For suppliers, any balance > 0 means "PAYABLE", which should be pink.
  const isPayable = balance > 0;

  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.7}
      className="flex-row items-center bg-surface px-5 py-4 border-b border-light"
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
          className="text-[15px] font-bold mb-[3px] text-textPrimary"
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
        <Text 
          className={`text-[16px] font-black ${isPayable ? 'text-supplierPrimary' : 'text-textPrimary'}`}
        >
          ₹{balance > 0 ? balance.toLocaleString("en-IN") : "0"}
        </Text>
        <View
          className={`border rounded-[6px] px-2 py-[3px] ${isPayable ? 'bg-[#FDF2F8] border-supplierPrimary/30' : 'bg-successBg border-primary'}`}
        >
          <Text
            className={`text-[11px] font-bold tracking-[0.4px] ${isPayable ? 'text-supplierPrimary' : 'text-primary'}`}
          >
            {isPayable ? "PAYABLE" : "SETTLED"}
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );
}
