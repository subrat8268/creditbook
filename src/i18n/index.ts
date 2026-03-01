import { default as i18next } from "i18next";
import { initReactI18next } from "react-i18next";
import en from "./en";
import hi from "./hi";

export const LANGUAGES = {
  en: "English",
  hi: "हिन्दी",
} as const;

export type Language = keyof typeof LANGUAGES;

i18next.use(initReactI18next).init({
  compatibilityJSON: "v4",
  resources: {
    en: { translation: en },
    hi: { translation: hi },
  },
  lng: "en",
  fallbackLng: "en",
  interpolation: {
    escapeValue: false,
  },
});

export default i18next;
