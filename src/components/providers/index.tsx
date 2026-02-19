'use client';

import { type ReactNode } from 'react';
import { ThemeProvider } from './ThemeProvider';
import { QueryProvider } from './QueryProvider';
import { WalletProvider } from '@/providers/WalletProvider';
import TradingProvider from '@/providers/TradingProvider';

export function Providers({ children }: { children: ReactNode }) {
  return (
    <ThemeProvider>
      <QueryProvider>
        <WalletProvider>
          <TradingProvider>
            {children}
          </TradingProvider>
        </WalletProvider>
      </QueryProvider>
    </ThemeProvider>
  );
}

