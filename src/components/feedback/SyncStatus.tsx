import { useNetworkSync } from "@/src/hooks/useNetworkSync";
import { colors } from "@/src/utils/theme";
import { AlertCircle, Check, RefreshCw, WifiOff } from "lucide-react-native";
import { ActivityIndicator, Text, TouchableOpacity } from "react-native";

/**
 * Real-time sync status indicator
 * Shows: "✓ Synced", "Saving...", "📡 Offline", "Syncing...", "⚠️ Error"
 * Taps to retry if needed
 */
export function SyncStatus() {
  const { syncStatus, isConnected, queueLength, hasSyncError, triggerSync } =
    useNetworkSync();

  // Determine icon & color
  const getStatusUI = () => {
    if (hasSyncError) {
      return {
        icon: <AlertCircle size={14} color={colors.danger} />,
        text: "Sync error",
        textColor: colors.danger,
        bgColor: colors.danger + "15",
      };
    }

    if (!isConnected) {
      return {
        icon: <WifiOff size={14} color={colors.sync.offlineText} />,
        text: "Offline",
        textColor: colors.sync.offlineText,
        bgColor: colors.sync.offlineBg,
      };
    }

    switch (syncStatus) {
      case "syncing":
        return {
          icon: <RefreshCw size={14} color={colors.sync.syncingText} />,
          text: "Syncing...",
          textColor: colors.sync.syncingText,
          bgColor: colors.sync.syncingBg,
        };

      case "offline":
        return {
          icon: <Check size={14} color={colors.sync.offlineText} />,
          text: "Saved offline",
          textColor: colors.sync.offlineText,
          bgColor: colors.sync.offlineBg,
        };

      case "synced":
      default:
        return {
          icon: <Check size={14} color={colors.sync.syncedText} />,
          text: "Synced",
          textColor: colors.sync.syncedText,
          bgColor: colors.sync.syncedBg,
        };
    }
  };

  const { icon, text, textColor, bgColor } = getStatusUI();

  return (
    <TouchableOpacity
      onPress={triggerSync}
      activeOpacity={hasSyncError || syncStatus === "syncing" ? 0.7 : 1}
      disabled={!hasSyncError}
      className="flex-row items-center gap-1.5 px-2.5 py-1 rounded-full"
      style={{ backgroundColor: bgColor }}
    >
      {syncStatus === "syncing" ? (
        <ActivityIndicator size="small" color={textColor} />
      ) : (
        icon
      )}
      <Text style={{ color: textColor }} className="text-[10px] font-medium">
        {text}
      </Text>
      {queueLength > 0 && syncStatus !== "syncing" && (
        <Text style={{ color: textColor }} className="text-[9px] ml-0.5">
          ({queueLength})
        </Text>
      )}
    </TouchableOpacity>
  );
}
