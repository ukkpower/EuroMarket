'use client';

import { useEffect, type ReactNode } from 'react';
import { I18nextProvider } from 'react-i18next';
import { initI18n } from '@/i18n/client';
import { resolveSupportedLocale } from '@/i18n/settings';

const i18n = initI18n();

function syncHtmlLang(language?: string) {
  document.documentElement.lang = resolveSupportedLocale(language);
}

export function I18nProvider({ children }: { children: ReactNode }) {
  useEffect(() => {
    syncHtmlLang(i18n.resolvedLanguage || i18n.language);

    const handleLanguageChanged = (language: string) => {
      syncHtmlLang(language);
    };

    i18n.on('languageChanged', handleLanguageChanged);

    return () => {
      i18n.off('languageChanged', handleLanguageChanged);
    };
  }, []);

  return <I18nextProvider i18n={i18n}>{children}</I18nextProvider>;
}
