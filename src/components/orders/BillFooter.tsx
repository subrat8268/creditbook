import React from "react";
import { View, Text, TouchableOpacity, ActivityIndicator } from "react-native";
import { Share2 } from "lucide-react-native";
import { formatINR } from "@/src/utils/dashboardUi";
import { useOrderStore } from "@/src/store/orderStore";
import { colors } from "@/src/utils/theme";

interface BillFooterProps {
  isLoading: boolean;
  onSaveAndShare: () => void;
}

export default function BillFooter({ isLoading, onSaveAndShare }: BillFooterProps) {
  const getGrandTotal = useOrderStore((state) => state.getGrandTotal);
  const items = useOrderStore((state) => state.items);

  // Math recalculates instantly via Zustand
  const grandTotal = getGrandTotal();
  const isDisabled = items.length === 0 || isLoading;

  return (
    <View className="bg-surface border-t border-border pt-4 px-5 pb-8">
      <View className="flex-row justify-between items-center mb-5">
        <Text className="text-[14px] font-bold text-textSecondary uppercase tracking-widest">
          Grand Total
        </Text>
        <Text className="text-[28px] font-extrabold text-success">
          {formatINR(grandTotal)}
        </Text>
      </View>

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
            <Share2 size={20} color={colors.surface} strokeWidth={2.5} />
            <Text className="ml-2 text-[17px] font-bold text-surface">
              Save & Share
            </Text>
          </>
        )}
      </TouchableOpacity>
    </View>
  );
}
