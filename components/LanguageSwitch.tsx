"use client";

import { useLanguage } from "@/lib/i18n";

export function LanguageSwitch({
  dark = false,
  className = "",
}: {
  dark?: boolean;
  className?: string;
}) {
  const { lang, setLanguage, t } = useLanguage();

  return (
    <div
      className={`lang-switch ${dark ? "lang-switch-dark" : ""} ${className}`.trim()}
      role="group"
      aria-label={t("lang.group")}
    >
      <button
        type="button"
        className={lang === "id" ? "is-active" : ""}
        aria-pressed={lang === "id"}
        onClick={() => setLanguage("id")}
      >
        ID
      </button>
      <button
        type="button"
        className={lang === "en" ? "is-active" : ""}
        aria-pressed={lang === "en"}
        onClick={() => setLanguage("en")}
      >
        EN
      </button>
    </div>
  );
}
