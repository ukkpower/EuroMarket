import {
  INTL_LOCALE_MAP,
  resolveSupportedLocale,
  type SupportedLocale,
} from '@/i18n/settings';

function toSupportedLocale(language?: string): SupportedLocale {
  return resolveSupportedLocale(language);
}

export function getIntlLocale(language?: string): string {
  return INTL_LOCALE_MAP[toSupportedLocale(language)];
}

export function formatInteger(value: number, language?: string): string {
  return new Intl.NumberFormat(getIntlLocale(language)).format(value);
}

export function formatCompactCurrency(
  value: number,
  language?: string,
  currency = 'USD'
): string {
  return new Intl.NumberFormat(getIntlLocale(language), {
    style: 'currency',
    currency,
    notation: 'compact',
    maximumFractionDigits: 1,
  }).format(value);
}
