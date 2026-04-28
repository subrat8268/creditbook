import { useCallback, useEffect, useMemo, useRef } from "react";
import { AppState, AppStateStatus } from "react-native";
import * as Notifications from "expo-notifications";
import { useRouter } from "expo-router";
import { supabase } from "@/src/services/supabase";
import { useAuthStore } from "@/src/store/authStore";
import { usePreferencesStore } from "@/src/store/preferencesStore";
import { formatINR } from "@/src/utils/format";

type OverdueGroup = {
  customerId: string;
  customerName: string;
  totalOverdueAmount: number;
  overdueCount: number;
};

function getTodayDateString() {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

async function fetchOverdueGroups(vendorId: string): Promise<OverdueGroup[]> {
  const today = getTodayDateString();
  const { data, error } = await supabase
    .from("orders")
    .select("id, customer_id, balance_due, status, due_date, parties!inner(id, name)")
    .eq("vendor_id", vendorId)
    .lt("due_date", today);

  if (error || !data) {
    return [];
  }

  const grouped = new Map<string, OverdueGroup>();

  for (const row of data as any[]) {
    const status = String(row.status ?? "").trim().toLowerCase();
    if (status === "paid") continue;

    const amount = Number(row.balance_due ?? 0);
    if (amount <= 0) continue;

    const party = Array.isArray(row.parties) ? row.parties[0] : row.parties;
    const customerName = party?.name ?? "Customer";
    const customerId = String(row.customer_id);
    const existing = grouped.get(customerId);

    if (existing) {
      existing.totalOverdueAmount += amount;
      existing.overdueCount += 1;
    } else {
      grouped.set(customerId, {
        customerId,
        customerName,
        totalOverdueAmount: amount,
        overdueCount: 1,
      });
    }
  }

  return Array.from(grouped.values()).sort(
    (a, b) => b.totalOverdueAmount - a.totalOverdueAmount,
  );
}

function buildSignature(groups: OverdueGroup[]) {
  return groups
    .map(
      (g) =>
        `${g.customerId}:${Math.round(g.totalOverdueAmount * 100)}:${g.overdueCount}`,
    )
    .join("|");
}

export function useOverdueNotifications() {
  const router = useRouter();
  const vendorId = useAuthStore((s) => s.profile?.id ?? "");

  const remindersEnabled = usePreferencesStore((s) => s.remindersEnabled);
  const remindersPermissionAsked = usePreferencesStore(
    (s) => s.remindersPermissionAsked,
  );
  const remindersPermissionDenied = usePreferencesStore(
    (s) => s.remindersPermissionDenied,
  );

  const setRemindersEnabled = usePreferencesStore((s) => s.setRemindersEnabled);
  const setRemindersPermissionAsked = usePreferencesStore(
    (s) => s.setRemindersPermissionAsked,
  );
  const setRemindersPermissionDenied = usePreferencesStore(
    (s) => s.setRemindersPermissionDenied,
  );

  const hasRunOnLaunch = useRef(false);
  const lastSignature = useRef("");

  const syncNotifications = useCallback(async () => {
    if (!vendorId) return;

    if (!remindersEnabled) {
      await Notifications.cancelAllScheduledNotificationsAsync();
      return;
    }

    const groups = await fetchOverdueGroups(vendorId);
    const signature = buildSignature(groups);

    if (signature === lastSignature.current) {
      return;
    }

    lastSignature.current = signature;

    await Notifications.cancelAllScheduledNotificationsAsync();
    await Notifications.dismissAllNotificationsAsync();

    for (const group of groups) {
      await Notifications.scheduleNotificationAsync({
        content: {
          title: `📋 ${group.customerName} owes ${formatINR(group.totalOverdueAmount)}`,
          body: `${group.overdueCount} overdue entr${
            group.overdueCount === 1 ? "y" : "ies"
          } · tap to view`,
          data: {
            type: "overdue",
            href: "/people",
            customerId: group.customerId,
          },
          sound: false,
        },
        trigger: null,
      });
    }
  }, [vendorId, remindersEnabled]);

  const requestPermissionIfNeeded = useCallback(async () => {
    if (remindersPermissionAsked) {
      return !remindersPermissionDenied;
    }

    const current = await Notifications.getPermissionsAsync();
    if (current.granted) {
      setRemindersPermissionAsked(true);
      setRemindersPermissionDenied(false);
      return true;
    }

    const request = await Notifications.requestPermissionsAsync();
    const granted = Boolean(request.granted);
    setRemindersPermissionAsked(true);
    setRemindersPermissionDenied(!granted);
    return granted;
  }, [
    remindersPermissionAsked,
    remindersPermissionDenied,
    setRemindersPermissionAsked,
    setRemindersPermissionDenied,
  ]);

  const setReminderToggle = useCallback(
    async (enabled: boolean) => {
      if (!enabled) {
        setRemindersEnabled(false);
        await Notifications.cancelAllScheduledNotificationsAsync();
        return;
      }

      const granted = await requestPermissionIfNeeded();
      if (!granted) {
        setRemindersEnabled(false);
        return;
      }

      setRemindersEnabled(true);
      setRemindersPermissionDenied(false);
      await syncNotifications();
    },
    [
      requestPermissionIfNeeded,
      setRemindersEnabled,
      setRemindersPermissionDenied,
      syncNotifications,
    ],
  );

  useEffect(() => {
    if (!vendorId || hasRunOnLaunch.current) return;
    hasRunOnLaunch.current = true;
    syncNotifications();
  }, [vendorId, syncNotifications]);

  useEffect(() => {
    const subscription = AppState.addEventListener(
      "change",
      (nextState: AppStateStatus) => {
        if (nextState === "active") {
          syncNotifications();
        }
      },
    );
    return () => subscription.remove();
  }, [syncNotifications]);

  useEffect(() => {
    const responseSubscription =
      Notifications.addNotificationResponseReceivedListener(() => {
        router.push("/people" as never);
      });

    return () => responseSubscription.remove();
  }, [router]);

  return useMemo(
    () => ({
      remindersEnabled,
      remindersPermissionDenied,
      setReminderToggle,
      syncNotifications,
    }),
    [
      remindersEnabled,
      remindersPermissionDenied,
      setReminderToggle,
      syncNotifications,
    ],
  );
}
