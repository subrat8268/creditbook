import { useNetworkSync } from "@/src/hooks/useNetworkSync";

/**
 * Wrapper hook for sync status UI consumption
 * Simplifies useNetworkSync for component usage
 */
export function useSyncStatus() {
  const { syncStatus, isConnected, queueLength, hasSyncError, triggerSync } =
    useNetworkSync();

  return {
    syncStatus,
    isConnected,
    pendingCount: queueLength,
    hasSyncError,
    triggerSync,
    // Convenience: is synced (not syncing and no errors)
    isSynced: syncStatus === "synced" && !hasSyncError && isConnected,
  };
}
