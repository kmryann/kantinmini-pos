"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { dictionaries, type Language } from "@/lib/dictionaries";

type Vars = Record<string, string | number>;

type LanguageContextValue = {
  lang: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string, vars?: Vars) => string;
};

const LanguageContext = createContext<LanguageContextValue | null>(null);
const STORAGE_KEY = "kantin-mini-language";

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [lang, setLang] = useState<Language>("id");

  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved === "en" || saved === "id") setLang(saved);
    } catch {
      // Storage may be unavailable.
    }
  }, []);

  useEffect(() => {
    document.documentElement.lang = lang;
    try {
      localStorage.setItem(STORAGE_KEY, lang);
    } catch {
      // Storage may be unavailable.
    }
  }, [lang]);

  const t = useCallback(
    (key: string, vars: Vars = {}) => {
      const dict = dictionaries[lang] as Record<string, string>;
      let text = dict[key] ?? (dictionaries.id as Record<string, string>)[key] ?? key;
      Object.entries(vars).forEach(([name, value]) => {
        text = text.replaceAll(`{${name}}`, String(value));
      });
      return text;
    },
    [lang],
  );

  const value = useMemo(
    () => ({ lang, setLanguage: setLang, t }),
    [lang, t],
  );

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
}

export function useLanguage() {
  const value = useContext(LanguageContext);
  if (!value) throw new Error("useLanguage must be used inside LanguageProvider");
  return value;
}
