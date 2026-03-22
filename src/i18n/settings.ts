export const SUPPORTED_LOCALES = ['en', 'fr', 'de'] as const;

export type SupportedLocale = (typeof SUPPORTED_LOCALES)[number];

export const DEFAULT_LOCALE: SupportedLocale = 'en';

export const INTL_LOCALE_MAP: Record<SupportedLocale, string> = {
  en: 'en-US',
  fr: 'fr-FR',
  de: 'de-DE',
};

export function isSupportedLocale(locale: string): locale is SupportedLocale {
  return (SUPPORTED_LOCALES as readonly string[]).includes(locale);
}

export function resolveSupportedLocale(language?: string): SupportedLocale {
  if (!language) return DEFAULT_LOCALE;
  const base = language.toLowerCase().split('-')[0];
  return isSupportedLocale(base) ? base : DEFAULT_LOCALE;
}
