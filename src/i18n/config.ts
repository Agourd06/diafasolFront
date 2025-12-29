import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import LanguageDetector from "i18next-browser-languagedetector";
import en from "./locales/en.json";
import fr from "./locales/fr.json";

i18n
  .use(LanguageDetector) // Detect user language
  .use(initReactI18next) // Bind to React
  .init({
    resources: {
      en: { translation: en },
      fr: { translation: fr }
    },
    lng: "en", // Default language: English (displayed first)
    fallbackLng: "en", // Fallback to English if translation missing
    debug: false,
    interpolation: {
      escapeValue: false // React already escapes
    },
    detection: {
      // Priority: 1. Saved preference (localStorage), 2. Browser language
      // If no preference saved, defaults to English (set above)
      order: ["localStorage", "navigator"],
      caches: ["localStorage"],
      lookupLocalStorage: "i18nextLng",
      // Only allow English and French
      checkWhitelist: true
    }
  });

export default i18n;