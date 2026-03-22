'use client';

import { type ReactNode } from 'react';
import { ThemeProvider } from './ThemeProvider';
import { QueryProvider } from './QueryProvider';
import { I18nProvider } from './I18nProvider';
import { WalletProvider } from '@/providers/WalletProvider';
import TradingProvider from '@/providers/TradingProvider';

export function Providers({ children }: { children: ReactNode }) {
  return (
    <I18nProvider>
      <ThemeProvider>
        <QueryProvider>
          <WalletProvider>
            <TradingProvider>
              {children}
            </TradingProvider>
          </WalletProvider>
        </QueryProvider>
      </ThemeProvider>
    </I18nProvider>
  );
}
