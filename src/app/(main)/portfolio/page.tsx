'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Briefcase, RefreshCw } from 'lucide-react';
import { useWallet } from '@/providers/WalletContext';
import { useTrading } from '@/providers/TradingProvider';
import BalanceCards from '@/components/profile/BalanceCards';
import PortfolioTabs from '@/components/portfolio/PortfolioTabs';
import PositionsPanel from '@/components/portfolio/PositionsPanel';
import OpenOrdersPanel from '@/components/portfolio/OpenOrdersPanel';
import TradeHistoryPanel from '@/components/portfolio/TradeHistoryPanel';
import useOpenOrders from '@/hooks/useOpenOrders';
import usePortfolioValue from '@/hooks/usePortfolioValue';
import useTradeHistory from '@/hooks/useTradeHistory';
import type { PortfolioTab } from '@/types/trading';
import { Button } from '@/components/ui/button';

export default function PortfolioPage() {
  const router = useRouter();
  const { isConnected } = useWallet();
  const {
    safeAddress,
    isTradingSessionComplete,
    initializeTradingSession,
    currentStep,
  } = useTrading();

  const [activeTab, setActiveTab] = useState<PortfolioTab>('positions');
  const { orders } = useOpenOrders();
  const { refetch: refetchPortfolio } = usePortfolioValue();
  const { refetch: refetchTrades } = useTradeHistory();

  useEffect(() => {
    if (!isConnected) {
      router.push('/markets');
    }
  }, [isConnected, router]);

  if (!isConnected) return null;

  const handleRefreshAll = () => {
    refetchPortfolio();
    refetchTrades();
  };

  const hasSafe = !!safeAddress;
  const isSessionInitializing =
    currentStep !== 'idle' && currentStep !== 'complete';

  return (
    <div className="container mx-auto px-4 py-8 max-w-3xl">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-6"
      >
        {/* Page Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
              <Briefcase className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h1 className="text-2xl font-bold">Portfolio</h1>
              <p className="text-sm text-muted-foreground">
                Positions, orders, and trade history
              </p>
            </div>
          </div>
          {hasSafe && isTradingSessionComplete && (
            <button
              onClick={handleRefreshAll}
              className="p-2 hover:bg-secondary rounded-lg transition-colors text-muted-foreground hover:text-foreground"
              title="Refresh all"
            >
              <RefreshCw className="h-4 w-4" />
            </button>
          )}
        </div>

        {/* Balance Cards */}
        {hasSafe && <BalanceCards />}

        {/* Session check */}
        {!isTradingSessionComplete ? (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-card rounded-2xl border border-border/50 p-8 flex flex-col items-center text-center"
          >
            <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center mb-4">
              <Briefcase className="h-7 w-7 text-primary" />
            </div>
            <h3 className="text-lg font-semibold mb-2">
              Initialize Trading Session
            </h3>
            <p className="text-sm text-muted-foreground max-w-sm mb-5">
              Your trading session needs to be active to view your portfolio,
              open orders, and trade history.
            </p>
            <Button
              onClick={initializeTradingSession}
              disabled={isSessionInitializing}
              size="lg"
              className="gap-2"
            >
              {isSessionInitializing ? (
                <>
                  <RefreshCw className="h-4 w-4 animate-spin" />
                  Initializing...
                </>
              ) : (
                'Initialize Session'
              )}
            </Button>
          </motion.div>
        ) : (
          <>
            {/* Tabs */}
            <PortfolioTabs
              activeTab={activeTab}
              onTabChange={setActiveTab}
              orderCount={orders.length}
            />

            {/* Tab Content */}
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.2 }}
            >
              {activeTab === 'positions' && <PositionsPanel />}
              {activeTab === 'orders' && <OpenOrdersPanel />}
              {activeTab === 'history' && <TradeHistoryPanel />}
            </motion.div>
          </>
        )}
      </motion.div>
    </div>
  );
}
