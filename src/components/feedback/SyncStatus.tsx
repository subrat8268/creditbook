import { useNetworkSync } from "@/src/hooks/useNetworkSync";
import { colors } from "@/src/utils/theme";
import { AlertCircle, Check, RefreshCw, WifiOff } from "lucide-react-native";
import { Text, TouchableOpacity, View } from "react-native";

// Variant options: inline, banner, compact
export type SyncStatusVariant = 'inline' | 'banner' | 'compact';

interface SyncStatusProps {
  variant?: SyncStatusVariant;
  className?: string;
}

// Unified SyncStatus component - replaces 3 separate components
export default function SyncStatus({ variant = 'inline', className }: SyncStatusProps) {
  const { syncStatus, isConnected, queueLength, hasSyncError, triggerSync } =
    useNetworkSync();

  // Get status UI based on current state
  const getStatusUI = () => {
    if (hasSyncError) {
      return {
        icon: <AlertCircle size={14} color={colors.danger} />,
        text: "Sync error",
        textColor: colors.danger,
        bgColor: colors.dangerBg,
      };
    }

    if (!isConnected) {
      return {
        icon: <WifiOff size={14} color={colors.warning} />,
        text: "Offline",
        textColor: colors.warning,
        bgColor: colors.warningBg,
      };
    }

    switch (syncStatus) {
      case 'syncing':
        return {
          icon: <RefreshCw size={14} color={colors.primary} className="animate-spin" />,
          text: "Syncing...",
          textColor: colors.primary,
          bgColor: colors.successBg,
        };
      case 'offline':
        return {
          icon: <Check size={14} color={colors.primary} />,
          text: "Saved offline",
          textColor: colors.primary,
          bgColor: colors.successBg,
        };
      default: // synced
        return {
          icon: <Check size={14} color={colors.primary} />,
          text: "Synced",
          textColor: colors.primary,
          bgColor: colors.successBg,
        };
    }
  };

  const status = getStatusUI();

  // Different render based on variant
  if (variant === 'compact') {
    return (
      <View className={"flex-row items-center gap-1.5"}>
        {status.icon}
        <Text className="text-xs" style={{ color: status.textColor }}>
          {status.text}
        </Text>
      </View>
    );
  }

  if (variant === 'banner') {
    return (
      <View
        className={`flex-row items-center justify-between px-4 py-2 ${className || ''}`}
        style={{ backgroundColor: status.bgColor }}
      >
        <View className="flex-row items-center gap-2">
          {status.icon}
          <Text className="text-sm font-medium" style={{ color: status.textColor }}>
            {status.text}
            {queueLength > 0 && ` (${queueLength} queued)`}
          </Text>
        </View>
        {hasSyncError && (
          <TouchableOpacity onPress={triggerSync}>
            <Text className="text-sm font-bold" style={{ color: colors.danger }}>
              Retry
            </Text>
          </TouchableOpacity>
        )}
      </View>
    );
  }

  // Default: inline (full version)
  return (
    <TouchableOpacity
      className={`flex-row items-center gap-2 px-3 py-1.5 rounded-full ${className || ''}`}
      style={{ backgroundColor: status.bgColor }}
      onPress={hasSyncError ? triggerSync : undefined}
      disabled={!hasSyncError}
    >
      {status.icon}
      <Text className="text-xs font-semibold" style={{ color: status.textColor }}>
        {status.text}
        {queueLength > 0 ? ` (${queueLength})` : ''}
      </Text>
    </TouchableOpacity>
  );
}
