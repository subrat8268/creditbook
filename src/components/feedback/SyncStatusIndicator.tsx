import { useSyncStatus } from "@/src/hooks/useSyncStatus";
import { colors } from "@/src/utils/theme";
import { AlertCircle, Check, RefreshCw, WifiOff } from "lucide-react-native";
import { ActivityIndicator, Text, TouchableOpacity, View } from "react-native";

interface SyncStatusIndicatorProps {
  /** Whether to show compact icon-only mode (for transaction rows) */
  compact?: boolean;
}

/**
 * Compact sync status indicator for transaction lists
 * Shows icon + optional text. Compact mode: icon only (12px)
 */
export function SyncStatusIndicator({ compact = true }: SyncStatusIndicatorProps) {
  const { syncStatus, isConnected, hasSyncError, triggerSync } = useSyncStatus();

  const getStatusUI = () => {
    if (hasSyncError) {
      return {
        icon: <AlertCircle size={compact ? 12 : 14} color={colors.danger} />,
        text: "Error",
        textColor: colors.danger,
      };
    }

    if (!isConnected) {
      return {
        icon: <WifiOff size={compact ? 12 : 14} color={colors.sync.offlineText} />,
        text: "Offline",
        textColor: colors.sync.offlineText,
      };
    }

    switch (syncStatus) {
      case "syncing":
        return {
          icon: <RefreshCw size={compact ? 12 : 14} color={colors.sync.syncingText} />,
          text: "Syncing",
          textColor: colors.sync.syncingText,
        };

      case "offline":
        return {
          icon: <Check size={compact ? 12 : 14} color={colors.sync.offlineText} />,
          text: "Offline",
          textColor: colors.sync.offlineText,
        };

      case "synced":
      default:
        return {
          icon: <Check size={compact ? 12 : 14} color={colors.sync.syncedText} />,
          text: "Synced",
          textColor: colors.sync.syncedText,
        };
    }
  };

  const { icon, text, textColor } = getStatusUI();

  if (compact) {
    // Compact: icon only, minimal tap target
    return (
      <TouchableOpacity
        onPress={triggerSync}
        disabled={!hasSyncError}
        activeOpacity={hasSyncError ? 0.7 : 1}
      >
        {syncStatus === "syncing" ? (
          <ActivityIndicator size="small" color={textColor} />
        ) : (
          icon
        )}
      </TouchableOpacity>
    );
  }

  // Full mode: icon + text badge (for testing/debug)
  return (
    <View className="flex-row items-center gap-1">
      {syncStatus === "syncing" ? (
        <ActivityIndicator size="small" color={textColor} />
      ) : (
        icon
      )}
      <Text style={{ color: textColor }} className="text-[10px] font-medium">
        {text}
      </Text>
    </View>
  );
}
