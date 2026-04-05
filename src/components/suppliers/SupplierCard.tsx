import { Text, TouchableOpacity, View } from "react-native";
import { daysSince, formatRelativeActivity } from "../../utils/helper";

import { Supplier } from "../../types/supplier";
import { colors } from "../../utils/theme";

// ── Avatar helpers — soft pastel bg + dark text (supplier visual identity) ───
const AVATAR_BG = colors.supplierAvatarBg;
const AVATAR_TEXT = colors.supplierAvatarText;

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

export default function SupplierCard({ supplier, onPress }: Props) {
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
          className={`border rounded-[6px] px-2 py-[3px] ${isPayable ? 'border-supplierPrimary/30' : 'bg-successBg border-primary'}`}
          style={isPayable ? { backgroundColor: colors.supplierBg } : undefined}
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
