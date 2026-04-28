import AsyncStorage from "@react-native-async-storage/async-storage";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

export type NetPositionRange = 7 | 30 | 90;
export type ColorMode = "light" | "dark";

export type ReminderLogEntry = {
  id: string;
  customerId: string;
  customerName: string;
  amount: number;
  channel: "whatsapp";
  createdAt: string;
};

const MAX_REMINDER_LOG = 50;

export const NET_POSITION_RANGE_OPTIONS: {
  label: string;
  value: NetPositionRange;
}[] = [
  { label: "Last 7 days", value: 7 },
  { label: "Last 30 days", value: 30 },
  { label: "Last 90 days", value: 90 },
];

type PreferencesState = {
  // Appearance
  colorMode: ColorMode;
  setColorMode: (value: ColorMode) => void;
  toggleColorMode: () => void;

  // Net position dashboard range
  netPositionRange: NetPositionRange;
  setNetPositionRange: (value: NetPositionRange) => void;

  // Reminders
  remindersEnabled: boolean;
  remindersPermissionAsked: boolean;
  remindersPermissionDenied: boolean;
  setRemindersEnabled: (value: boolean) => void;
  setRemindersPermissionAsked: (value: boolean) => void;
  setRemindersPermissionDenied: (value: boolean) => void;
  overdueRemindersEnabled: boolean;
  overdueReminderHour: number;
  overdueReminderMinute: number;
  overdueReminderSnoozes: Record<string, number>;
  reminderLog: ReminderLogEntry[];
  setOverdueRemindersEnabled: (value: boolean) => void;
  setOverdueReminderTime: (hour: number, minute: number) => void;
  snoozeOverdueReminder: (customerId: string, days?: number) => void;
  clearOverdueReminderSnooze: (customerId: string) => void;
  pruneOverdueReminderSnoozes: (now?: number) => void;
  logReminderSent: (entry: Omit<ReminderLogEntry, "id" | "createdAt">) => void;
};

export const usePreferencesStore = create<PreferencesState>()(
  persist(
    (set) => ({
      colorMode: "light",
      setColorMode: (value) => set({ colorMode: value }),
      toggleColorMode: () =>
        set((state) => ({
          colorMode: state.colorMode === "dark" ? "light" : "dark",
        })),

      netPositionRange: 30,
      setNetPositionRange: (value) => set({ netPositionRange: value }),

      remindersEnabled: true,
      remindersPermissionAsked: false,
      remindersPermissionDenied: false,
      setRemindersEnabled: (value) => set({ remindersEnabled: value }),
      setRemindersPermissionAsked: (value) =>
        set({ remindersPermissionAsked: value }),
      setRemindersPermissionDenied: (value) =>
        set({ remindersPermissionDenied: value }),

      overdueRemindersEnabled: true,
      overdueReminderHour: 9,
      overdueReminderMinute: 30,
      overdueReminderSnoozes: {},
      reminderLog: [],
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
      logReminderSent: (entry) =>
        set((state) => {
          const nextEntry: ReminderLogEntry = {
            ...entry,
            id: `reminder-${Date.now()}-${entry.customerId}`,
            createdAt: new Date().toISOString(),
          };
          return {
            reminderLog: [nextEntry, ...state.reminderLog].slice(
              0,
              MAX_REMINDER_LOG,
            ),
          };
        }),
    }),
    {
      name: "preferences-store",
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({
        colorMode: state.colorMode,
        netPositionRange: state.netPositionRange,
        remindersEnabled: state.remindersEnabled,
        remindersPermissionAsked: state.remindersPermissionAsked,
        remindersPermissionDenied: state.remindersPermissionDenied,
        overdueRemindersEnabled: state.overdueRemindersEnabled,
        overdueReminderHour: state.overdueReminderHour,
        overdueReminderMinute: state.overdueReminderMinute,
        overdueReminderSnoozes: state.overdueReminderSnoozes,
        reminderLog: state.reminderLog,
      }),
    },
  ),
);
