/**
 * P5b — I18nProvider: Context + hook `useI18n()` / `useTranslation()`.
 *
 * - Mặc định vi (SSR render vi trước để không lệch hydration).
 * - Sau mount, đọc lựa chọn đã lưu (localStorage `mxh-locale`, fallback
 *   cookie cùng tên) và áp dụng; đổi ngôn ngữ áp dụng ngay, không reload.
 * - Đồng bộ `document.documentElement.lang` và `moment.locale()` để các
 *   chuỗi thời gian tương đối (`fromNow()`) cũng đổi ngôn ngữ theo.
 */
import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import moment from "moment";
// Import tĩnh locale vi: import() động ở đây là race — chunk vi resolve
// muộn sẽ tự gọi defineLocale("vi") và lật moment.locale() về vi ngay
// cả sau khi locale đã đổi sang "en" (kể cả khi .then() được guard).
// Import tĩnh chạy lúc đánh giá module, trước mọi effect, nên effect
// bên dưới luôn là bên đặt locale cuối cùng — không còn race.
import "moment/locale/vi";
import {
  DEFAULT_LOCALE,
  LOCALE_COOKIE_NAME,
  LOCALE_STORAGE_KEY,
  dictionaries,
  interpolate,
  lookup,
  type Dictionary,
  type Locale,
} from "./dictionaries";

export type TFunction = (
  key: string,
  vars?: Record<string, string | number>
) => string;

export interface I18nContextValue {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  t: TFunction;
  /** Dictionary đầy đủ của locale hiện tại (dùng cho lib không có hook). */
  dict: Dictionary;
}

const I18nContext = createContext<I18nContextValue>({
  locale: DEFAULT_LOCALE,
  setLocale: () => {},
  t: (key) => key,
  dict: dictionaries[DEFAULT_LOCALE],
});

function readStoredLocale(): Locale | null {
  try {
    const fromStorage = window.localStorage.getItem(LOCALE_STORAGE_KEY);
    if (fromStorage === "vi" || fromStorage === "en") return fromStorage;
    const match = document.cookie.match(
      new RegExp(`(?:^|; )${LOCALE_COOKIE_NAME}=([^;]*)`)
    );
    const fromCookie = match ? decodeURIComponent(match[1]) : null;
    if (fromCookie === "vi" || fromCookie === "en") return fromCookie;
  } catch {
    // Bỏ qua khi storage/cookie không đọc được — giữ mặc định vi.
  }
  return null;
}

function persistLocale(locale: Locale) {
  try {
    window.localStorage.setItem(LOCALE_STORAGE_KEY, locale);
  } catch {
    // localStorage có thể bị chặn — cookie vẫn lưu được bên dưới.
  }
  try {
    document.cookie = `${LOCALE_COOKIE_NAME}=${locale}; max-age=31536000; path=/`;
  } catch {
    // Bỏ qua khi cookie không ghi được.
  }
}

export const I18nProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [locale, setLocaleState] = useState<Locale>(DEFAULT_LOCALE);

  const setLocale = useCallback((next: Locale) => {
    // Đặt moment.locale() + <html lang> TRƯỚC khi đổi state: chuỗi
    // fromNow() được tính trong lúc render, nên nếu chỉ đặt trong
    // effect [locale] thì lượt render ngay sau đổi ngôn ngữ vẫn dùng
    // locale moment cũ và không có lượt render nào khác để tính lại.
    moment.locale(next);
    document.documentElement.lang = next;
    setLocaleState(next);
    persistLocale(next);
  }, []);

  // Đọc lựa chọn đã lưu sau mount (tránh lệch SSR/hydration).
  // Đi qua setLocale để moment.locale() được đặt trước lượt render.
  useEffect(() => {
    const stored = readStoredLocale();
    if (stored && stored !== DEFAULT_LOCALE) setLocale(stored);
  }, [setLocale]);

  // Đồng bộ lại <html lang> + moment locale theo ngôn ngữ đang chọn
  // (lưới an toàn nếu moment locale bị đổi từ nơi khác).
  useEffect(() => {
    document.documentElement.lang = locale;
    moment.locale(locale);
  }, [locale]);

  const t = useCallback<TFunction>(
    (key, vars) => {
      const template =
        lookup(dictionaries[locale], key) ??
        lookup(dictionaries[DEFAULT_LOCALE], key) ??
        key;
      return interpolate(template, vars);
    },
    [locale]
  );

  const value = useMemo<I18nContextValue>(
    () => ({ locale, setLocale, t, dict: dictionaries[locale] }),
    [locale, setLocale, t]
  );

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
};

export function useI18n(): I18nContextValue {
  return useContext(I18nContext);
}

/** Alias quen thuộc cho ai quen API của react-i18next. */
export function useTranslation(): I18nContextValue {
  return useContext(I18nContext);
}
