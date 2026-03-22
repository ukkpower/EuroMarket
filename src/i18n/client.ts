import i18n from 'i18next';
import LanguageDetector from 'i18next-browser-languagedetector';
import { initReactI18next } from 'react-i18next';
import deCommon from '@/i18n/locales/de/common.json';
import enCommon from '@/i18n/locales/en/common.json';
import frCommon from '@/i18n/locales/fr/common.json';
import {
  DEFAULT_LOCALE,
  SUPPORTED_LOCALES,
  type SupportedLocale,
} from '@/i18n/settings';

type Resources = {
  common: Record<string, unknown>;
};

const resources: Record<SupportedLocale, Resources> = {
  en: { common: enCommon },
  fr: { common: frCommon },
  de: { common: deCommon },
};

let initialized = false;

export function initI18n() {
  if (initialized) {
    return i18n;
  }

  i18n
    .use(LanguageDetector)
    .use(initReactI18next)
    .init({
      resources,
      fallbackLng: DEFAULT_LOCALE,
      supportedLngs: [...SUPPORTED_LOCALES],
      defaultNS: 'common',
      ns: ['common'],
      interpolation: {
        escapeValue: false,
      },
      detection: {
        order: ['cookie', 'localStorage', 'navigator'],
        caches: ['localStorage', 'cookie'],
        lookupCookie: 'i18next',
        lookupLocalStorage: 'i18nextLng',
        cookieMinutes: 365 * 24 * 60,
      },
    });

  initialized = true;
  return i18n;
}
