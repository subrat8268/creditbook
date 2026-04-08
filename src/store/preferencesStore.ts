import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import AsyncStorage from "@react-native-async-storage/async-storage";

export type NetPositionRange = 7 | 30 | 90;

export const NET_POSITION_RANGE_OPTIONS: {
  label: string;
  value: NetPositionRange;
}[] = [
  { label: "Last 7 days", value: 7 },
  { label: "Last 30 days", value: 30 },
  { label: "Last 90 days", value: 90 },
];

type PreferencesState = {
  netPositionRange: NetPositionRange;
  setNetPositionRange: (value: NetPositionRange) => void;
  overdueRemindersEnabled: boolean;
  overdueReminderHour: number;
  overdueReminderMinute: number;
  overdueReminderSnoozes: Record<string, number>;
  setOverdueRemindersEnabled: (value: boolean) => void;
  setOverdueReminderTime: (hour: number, minute: number) => void;
  snoozeOverdueReminder: (customerId: string, days?: number) => void;
  clearOverdueReminderSnooze: (customerId: string) => void;
  pruneOverdueReminderSnoozes: (now?: number) => void;
};

export const usePreferencesStore = create<PreferencesState>()(
  persist(
    (set) => ({
      netPositionRange: 30,
      setNetPositionRange: (value) => set({ netPositionRange: value }),
      overdueRemindersEnabled: true,
      overdueReminderHour: 9,
      overdueReminderMinute: 30,
      overdueReminderSnoozes: {},
      setOverdueRemindersEnabled: (value) =>
        set({ overdueRemindersEnabled: value }),
      setOverdueReminderTime: (hour, minute) =>
        set({ overdueReminderHour: hour, overdueReminderMinute: minute }),
      snoozeOverdueReminder: (customerId, days = 7) =>
        set((state) => ({
          overdueReminderSnoozes: {
            ...state.overdueReminderSnoozes,
            [customerId]: Date.now() + days * 24 * 60 * 60 * 1000,
          },
        })),
      clearOverdueReminderSnooze: (customerId) =>
        set((state) => {
          const next = { ...state.overdueReminderSnoozes };
          delete next[customerId];
          return { overdueReminderSnoozes: next };
        }),
      pruneOverdueReminderSnoozes: (now = Date.now()) =>
        set((state) => {
          const entries = Object.entries(state.overdueReminderSnoozes);
          if (!entries.length) return state;
          const next: Record<string, number> = {};
          for (const [id, until] of entries) {
            if (until > now) next[id] = until;
          }
          return { overdueReminderSnoozes: next };
        }),
    }),
    {
      name: "preferences-store",
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({
        netPositionRange: state.netPositionRange,
        overdueRemindersEnabled: state.overdueRemindersEnabled,
        overdueReminderHour: state.overdueReminderHour,
        overdueReminderMinute: state.overdueReminderMinute,
        overdueReminderSnoozes: state.overdueReminderSnoozes,
      }),
    },
  ),
);
