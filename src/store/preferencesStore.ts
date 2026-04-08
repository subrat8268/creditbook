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
  setOverdueRemindersEnabled: (value: boolean) => void;
  setOverdueReminderTime: (hour: number, minute: number) => void;
};

export const usePreferencesStore = create<PreferencesState>()(
  persist(
    (set) => ({
      netPositionRange: 30,
      setNetPositionRange: (value) => set({ netPositionRange: value }),
      overdueRemindersEnabled: true,
      overdueReminderHour: 9,
      overdueReminderMinute: 30,
      setOverdueRemindersEnabled: (value) =>
        set({ overdueRemindersEnabled: value }),
      setOverdueReminderTime: (hour, minute) =>
        set({ overdueReminderHour: hour, overdueReminderMinute: minute }),
    }),
    {
      name: "preferences-store",
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({
        netPositionRange: state.netPositionRange,
        overdueRemindersEnabled: state.overdueRemindersEnabled,
        overdueReminderHour: state.overdueReminderHour,
        overdueReminderMinute: state.overdueReminderMinute,
      }),
    },
  ),
);
