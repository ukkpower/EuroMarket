'use client';

import { motion } from 'framer-motion';
import { Wallet, TrendingUp, RefreshCw } from 'lucide-react';
import useUsdcBalance from '@/hooks/useUsdcBalance';
import usePortfolioValue from '@/hooks/usePortfolioValue';

function BalanceSkeleton() {
  return (
    <div className="animate-pulse">
      <div className="h-8 w-24 bg-muted rounded" />
    </div>
  );
}

export default function BalanceCards() {
  const { balance, isLoading: isBalanceLoading, refetch: refetchBalance } = useUsdcBalance();
  const { portfolio, isLoading: isPortfolioLoading, refetch: refetchPortfolio } = usePortfolioValue();

  const handleRefresh = () => {
    refetchBalance();
    refetchPortfolio();
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.1 }}
      className="space-y-3"
    >
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">Balances</h2>
        <button
          onClick={handleRefresh}
          className="p-1.5 hover:bg-secondary rounded-lg transition-colors text-muted-foreground hover:text-foreground"
          title="Refresh balances"
        >
          <RefreshCw className="h-4 w-4" />
        </button>
      </div>

      <div className="grid grid-cols-2 gap-3">
        {/* Cash Balance */}
        <div className="bg-card rounded-2xl border border-border/50 p-5 space-y-2">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Wallet className="h-4 w-4 text-primary" />
            Cash Balance
          </div>
          {isBalanceLoading ? (
            <BalanceSkeleton />
          ) : (
            <div>
              <span className="text-2xl font-bold">
                ${balance.formatted}
              </span>
              <span className="text-sm text-muted-foreground ml-1">
                USDC
              </span>
            </div>
          )}
        </div>

        {/* Portfolio Balance */}
        <div className="bg-card rounded-2xl border border-border/50 p-5 space-y-2">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <TrendingUp className="h-4 w-4 text-primary" />
            Portfolio
          </div>
          {isPortfolioLoading ? (
            <BalanceSkeleton />
          ) : (
            <div>
              <span className="text-2xl font-bold">
                ${portfolio.totalValue.toFixed(2)}
              </span>
              {portfolio.positionCount > 0 && (
                <span className="text-sm text-muted-foreground ml-1">
                  {portfolio.positionCount} position{portfolio.positionCount !== 1 ? 's' : ''}
                </span>
              )}
              {portfolio.totalPnl !== 0 && (
                <div className={`text-sm font-medium ${portfolio.totalPnl >= 0 ? 'text-success' : 'text-danger'}`}>
                  {portfolio.totalPnl >= 0 ? '+' : ''}{portfolio.totalPnl.toFixed(2)} PnL
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
}
