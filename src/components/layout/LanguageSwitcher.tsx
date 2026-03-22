'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { ChevronDown, Globe } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { cn } from '@/lib/utils';
import {
  resolveSupportedLocale,
  SUPPORTED_LOCALES,
  type SupportedLocale,
} from '@/i18n/settings';

type LanguageSwitcherProps = {
  mobile?: boolean;
  className?: string;
};

const LANGUAGE_NAME_KEY: Record<SupportedLocale, string> = {
  en: 'language.options.en',
  fr: 'language.options.fr',
  de: 'language.options.de',
};

export function LanguageSwitcher({ mobile = false, className }: LanguageSwitcherProps) {
  const { t, i18n } = useTranslation();
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const currentLocale = useMemo(
    () => resolveSupportedLocale(i18n.resolvedLanguage || i18n.language),
    [i18n.language, i18n.resolvedLanguage]
  );

  useEffect(() => {
    const handleOutsideClick = (event: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setOpen(false);
      }
    };

    document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, []);

  const handleSelect = async (locale: SupportedLocale) => {
    await i18n.changeLanguage(locale);
    setOpen(false);
  };

  return (
    <div ref={containerRef} className={cn('relative', className)}>
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        aria-label={t('language.selectLanguage')}
        className={cn(
          'flex items-center gap-1.5 text-sm font-medium transition-colors',
          mobile
            ? 'w-full px-3 py-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-secondary/40 justify-between'
            : 'px-3 py-1.5 rounded-full bg-secondary hover:bg-secondary/80'
        )}
      >
        <span className="flex items-center gap-1.5">
          <Globe className="h-5 w-5" aria-hidden="true" />
          <span>{currentLocale.toUpperCase()}</span>
        </span>
        <ChevronDown className={cn('h-4 w-4 transition-transform', open && 'rotate-180')} />
      </button>

      {open && (
        <div
          className={cn(
            'absolute z-50 mt-2 bg-card border border-border rounded-xl shadow-lg overflow-hidden',
            mobile ? 'left-0 right-0' : 'right-0 min-w-[140px]'
          )}
        >
          {SUPPORTED_LOCALES.map((locale) => {
            const active = locale === currentLocale;
            return (
              <button
                key={locale}
                type="button"
                onClick={() => handleSelect(locale)}
                className={cn(
                  'w-full px-3 py-2 text-sm text-left transition-colors flex items-center justify-between',
                  active
                    ? 'bg-secondary text-foreground font-medium'
                    : 'text-muted-foreground hover:bg-secondary/50 hover:text-foreground'
                )}
              >
                <span>{locale.toUpperCase()}</span>
                <span className="text-xs">{t(LANGUAGE_NAME_KEY[locale])}</span>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
