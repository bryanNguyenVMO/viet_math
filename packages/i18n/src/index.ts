import { en } from "./locales/en";
import { vi } from "./locales/vi";

export type Locale = "vi" | "en";
export type TranslationKey = keyof typeof vi;

const dictionaries: Record<Locale, Record<TranslationKey, string>> = { vi, en };

function normalizeLocale(locale: string): Locale {
  const normalized = locale.toLowerCase();
  if (normalized === "en" || normalized.startsWith("en-")) return "en";
  if (normalized === "vi" || normalized.startsWith("vi-")) return "vi";
  return "vi";
}

export function detectInitialLocale(
  language = typeof navigator === "undefined" ? "vi" : navigator.language,
): Locale {
  return normalizeLocale(language);
}

export function createTranslator(requestedLocale: Locale | string) {
  const locale = normalizeLocale(requestedLocale);
  const dictionary = dictionaries[locale];

  return {
    locale,
    t(key: TranslationKey): string {
      return dictionary[key] ?? dictionaries.vi[key] ?? String(key);
    },
  };
}
