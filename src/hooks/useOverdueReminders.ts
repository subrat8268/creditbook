import { useCallback } from "react";
import { AppState, AppStateStatus } from "react-native";
import { useQuery } from "@tanstack/react-query";
import {
  cancelAllOverdueReminders,
  ensureNotificationPermission,
  syncOverdueReminders,
} from "@/src/lib/notifications";
import { fetchOverdueReminders } from "@/src/api/overdueReminders";
import { usePreferencesStore } from "@/src/store/preferencesStore";
import { useAuthStore } from "@/src/store/authStore";

export function useOverdueReminders() {
  const { profile } = useAuthStore();
  const vendorId = profile?.id ?? "";

  const enabled = usePreferencesStore((s) => s.overdueRemindersEnabled);
  const hour = usePreferencesStore((s) => s.overdueReminderHour);
  const minute = usePreferencesStore((s) => s.overdueReminderMinute);
  const snoozes = usePreferencesStore((s) => s.overdueReminderSnoozes);
  const pruneSnoozes = usePreferencesStore((s) => s.pruneOverdueReminderSnoozes);

  const {
    data: reminders = [],
    isLoading,
    refetch,
  } = useQuery({
    queryKey: ["overdueReminders", vendorId],
    queryFn: () => fetchOverdueReminders(vendorId),
    enabled: !!vendorId,
    staleTime: 1000 * 60 * 5,
  });

  const syncReminders = useCallback(async () => {
    if (!vendorId) return;
    pruneSnoozes();
    await syncOverdueReminders(reminders, {
      enabled,
      hour,
      minute,
      maxPerDay: 10,
      snoozes,
    });
  }, [vendorId, enabled, hour, minute, snoozes, reminders, pruneSnoozes]);

  const enableWithPermission = useCallback(async () => {
    const granted = await ensureNotificationPermission();
    if (granted) {
      usePreferencesStore.getState().setOverdueRemindersEnabled(true);
    }
    return granted;
  }, []);

  const disable = useCallback(async () => {
    usePreferencesStore.getState().setOverdueRemindersEnabled(false);
    await cancelAllOverdueReminders();
  }, []);

  return {
    reminders,
    isLoading,
    enabled,
    refetch,
    syncReminders,
    enableWithPermission,
    disable,
  };
}

export function useOverdueReminderOnForeground() {
  const { syncReminders, enabled } = useOverdueReminders();
  const { profile } = useAuthStore();

  const handleAppStateChange = useCallback(
    (nextState: AppStateStatus) => {
      if (nextState === "active" && enabled && profile?.id) {
        syncReminders();
      }
    },
    [enabled, profile?.id, syncReminders],
  );

  return { handleAppStateChange };
}