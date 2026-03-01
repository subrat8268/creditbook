import AsyncStorage from "@react-native-async-storage/async-storage";
import { create } from "zustand";
import i18next, { Language } from "../i18n";

const LANGUAGE_KEY = "app_language";

interface LanguageState {
  language: Language;
  setLanguage: (lang: Language) => Promise<void>;
  loadLanguage: () => Promise<void>;
}

export const useLanguageStore = create<LanguageState>((set) => ({
  language: "en",

  setLanguage: async (lang: Language) => {
    await AsyncStorage.setItem(LANGUAGE_KEY, lang);
    await i18next.changeLanguage(lang);
    set({ language: lang });
  },

  loadLanguage: async () => {
    const stored = await AsyncStorage.getItem(LANGUAGE_KEY);
    const lang = (stored as Language) ?? "en";
    await i18next.changeLanguage(lang);
    set({ language: lang });
  },
}));
