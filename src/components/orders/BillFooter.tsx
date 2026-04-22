import { colors } from "@/src/utils/theme";
import { Share2 } from "lucide-react-native";
import { ActivityIndicator, Text, TouchableOpacity, View } from "react-native";

interface BillFooterProps {
  isLoading?: boolean;
  onSaveAndShare?: () => void;
  shareLabel?: string;
  totalAmount?: number;
  totalLabel?: string;
  showIcon?: boolean;
  offlineQueueCount?: number;
  disabled?: boolean;
}

export default function BillFooter({
  isLoading = false,
  onSaveAndShare,
  shareLabel = "Save & Share",
  totalAmount,
  totalLabel,
  showIcon = true,
  offlineQueueCount = 0,
  disabled = false,
}: BillFooterProps) {
  return (
    <View
      style={{
        backgroundColor: colors.surface,
        paddingHorizontal: 16,
        paddingVertical: 16,
        borderTopWidth: 1,
        borderTopColor: colors.border,
      }}
    >
      {offlineQueueCount > 0 ? (
        <Text style={{ fontSize: 12, color: colors.textSecondary, marginBottom: 10 }}>
          Offline queue: {offlineQueueCount}
        </Text>
      ) : null}

      {totalAmount !== undefined && totalLabel && (
        <View
          style={{
            flexDirection: "row",
            justifyContent: "space-between",
            marginBottom: 12,
          }}
        >
          <Text style={{ fontSize: 14, color: colors.textSecondary }}>
            {totalLabel}
          </Text>
          <Text
            style={{ fontSize: 18, fontWeight: "700", color: colors.textPrimary }}
          >
            ₹{totalAmount.toLocaleString("en-IN")}
          </Text>
        </View>
      )}

      <TouchableOpacity
        onPress={onSaveAndShare}
        disabled={disabled || isLoading}
        style={{
          backgroundColor: disabled ? colors.border : colors.primary,
          paddingVertical: 14,
          borderRadius: 8,
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        {isLoading ? (
          <ActivityIndicator color={colors.surface} />
        ) : (
          <>
            {showIcon ? (
              <Share2 size={18} color={colors.surface} style={{ marginRight: 8 }} />
            ) : null}
            <Text
              style={{
                color: colors.surface,
                fontSize: 16,
                fontWeight: "600",
              }}
            >
              {shareLabel}
            </Text>
          </>
        )}
      </TouchableOpacity>
    </View>
  );
}
