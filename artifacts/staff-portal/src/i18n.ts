import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import en from "./locales/en.json";
import ar from "./locales/ar.json";
import fr from "./locales/fr.json";
import zh from "./locales/zh.json";
import es from "./locales/es.json";
import pt from "./locales/pt.json";

const saved = typeof localStorage !== "undefined" ? (localStorage.getItem("mtc_lang") ?? "en") : "en";

i18n.use(initReactI18next).init({
  resources: {
    en: { translation: en },
    ar: { translation: ar },
    fr: { translation: fr },
    zh: { translation: zh },
    es: { translation: es },
    pt: { translation: pt },
  },
  lng: saved,
  fallbackLng: "en",
  interpolation: { escapeValue: false },
});

i18n.on("languageChanged", (lng) => {
  if (typeof localStorage !== "undefined") localStorage.setItem("mtc_lang", lng);
  document.documentElement.dir = lng === "ar" ? "rtl" : "ltr";
  document.documentElement.lang = lng;
});

document.documentElement.dir = saved === "ar" ? "rtl" : "ltr";
document.documentElement.lang = saved;

export const LANGUAGES: { code: string; label: string; nativeLabel: string }[] = [
  { code: "en", label: "English",    nativeLabel: "English" },
  { code: "ar", label: "Arabic",     nativeLabel: "العربية" },
  { code: "fr", label: "French",     nativeLabel: "Français" },
  { code: "zh", label: "Chinese",    nativeLabel: "中文" },
  { code: "es", label: "Spanish",    nativeLabel: "Español" },
  { code: "pt", label: "Portuguese", nativeLabel: "Português" },
];

export default i18n;
