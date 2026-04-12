import React from "react";
import { View, Text, TouchableOpacity, ActivityIndicator } from "react-native";
import { Share2 } from "lucide-react-native";
import { formatINR } from "@/src/utils/dashboardUi";
import { useOrderStore } from "@/src/store/orderStore";
import { colors } from "@/src/utils/theme";

interface BillFooterProps {
  isLoading: boolean;
  onSaveAndShare: () => void;
  shareLabel?: string;
  disabled?: boolean;
  totalAmount?: number;
  totalLabel?: string;
  showIcon?: boolean;
  offlineQueueCount?: number;
}

export default function BillFooter({
  isLoading,
  onSaveAndShare,
  shareLabel = "Save & Share",
  disabled,
  totalAmount,
  totalLabel = "Grand Total",
  showIcon = true,
  offlineQueueCount,
}: BillFooterProps) {
  const getGrandTotal = useOrderStore((state) => state.getGrandTotal);

  // Math recalculates instantly via Zustand
  const grandTotal = totalAmount ?? getGrandTotal();
  const isDisabled = disabled ?? isLoading;

  return (
    <View className="bg-surface border-t border-border pt-4 px-5 pb-8">
      <View className="flex-row justify-between items-center mb-5">
        <Text className="text-[14px] font-bold text-textSecondary uppercase tracking-widest">
          {totalLabel}
        </Text>
        <Text className="text-[28px] font-extrabold text-success">
          {formatINR(grandTotal)}
        </Text>
      </View>

      {typeof offlineQueueCount === "number" && offlineQueueCount > 0 ? (
        <View className="flex-row items-center mb-3">
          <Text className="text-[12px] text-textSecondary">
            Offline queue: {offlineQueueCount} pending
          </Text>
        </View>
      ) : null}

      <TouchableOpacity
        onPress={onSaveAndShare}
        disabled={isDisabled}
        activeOpacity={0.8}
        className={`flex-row items-center justify-center py-4 rounded-full ${
          isDisabled ? "bg-border opacity-50" : "bg-primary"
        }`}
      >
        {isLoading ? (
          <ActivityIndicator color={colors.surface} />
        ) : (
          <>
            {showIcon ? (
              <Share2 size={20} color={colors.surface} strokeWidth={2.5} />
            ) : null}
            <Text className="ml-2 text-[17px] font-bold text-surface">
              {shareLabel}
            </Text>
          </>
        )}
      </TouchableOpacity>
    </View>
  );
}
