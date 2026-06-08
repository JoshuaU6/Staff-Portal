import { useState, useEffect } from "react";
import i18n, { LANGUAGES } from "@/i18n";

export function useTranslation() {
  const [, setTick] = useState(0);

  useEffect(() => {
    const handler = () => setTick((n) => n + 1);
    i18n.on("languageChanged", handler);
    return () => { i18n.off("languageChanged", handler); };
  }, []);

  return {
    t: (key: string) => i18n.t(key) as string,
    i18n,
    LANGUAGES,
    currentLang: i18n.language,
    changeLanguage: (code: string) => i18n.changeLanguage(code),
  };
}
