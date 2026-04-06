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
};

export const usePreferencesStore = create<PreferencesState>()(
  persist(
    (set) => ({
      netPositionRange: 30,
      setNetPositionRange: (value) => set({ netPositionRange: value }),
    }),
    {
      name: "preferences-store",
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({ netPositionRange: state.netPositionRange }),
    },
  ),
);
