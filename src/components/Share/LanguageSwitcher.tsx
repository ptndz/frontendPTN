/**
 * P5b — Nút chuyển ngôn ngữ VI / EN, đặt cạnh nút đổi theme trên nav
 * và trong trang Cài đặt. Đổi ngay phía client, không reload trang.
 */
import React from "react";
import { LOCALES, type Locale } from "../../i18n/dictionaries";
import { useI18n } from "../../i18n/I18nProvider";

const LABELS: Record<Locale, string> = { vi: "VI", en: "EN" };

const LanguageSwitcher: React.FC<{ className?: string }> = ({ className }) => {
  const { locale, setLocale, t } = useI18n();
  return (
    <div
      className={`flex items-center rounded-full border border-line bg-paper p-0.5 ${className ?? ""}`}
      role="group"
      aria-label={t("nav.language")}>
      {LOCALES.map((code) => (
        <button
          key={code}
          type="button"
          onClick={() => setLocale(code)}
          aria-pressed={locale === code}
          className={`rounded-full px-2 py-1 text-xs font-semibold ${
            locale === code
              ? "bg-accent text-accent-ink"
              : "text-muted hover:text-ink"
          }`}>
          {LABELS[code]}
        </button>
      ))}
    </div>
  );
};

export default LanguageSwitcher;
