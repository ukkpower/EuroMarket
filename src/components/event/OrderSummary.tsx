'use client';

import { motion } from 'framer-motion';
import { Info } from 'lucide-react';
import type { TradeOutcome, OrderType, TradeSide } from '@/types/market';
import { cn, formatPrice } from '@/lib/utils';

type OrderSummaryProps = {
  outcome: TradeOutcome;
  orderType: OrderType;
  shares: number;
  averagePrice: number;
  totalCost: number;
  potentialPayout: number;
  tradeSide?: TradeSide;
};

export function OrderSummary({
  outcome,
  orderType,
  shares,
  averagePrice,
  totalCost,
  potentialPayout,
  tradeSide = 'buy',
}: OrderSummaryProps) {
  const isBuying = tradeSide === 'buy';
  const potentialProfit = potentialPayout - totalCost;
  const profitPercentage = totalCost > 0 ? ((potentialProfit / totalCost) * 100).toFixed(0) : '0';

  return (
    <div className="space-y-3 p-4 rounded-xl bg-secondary/50 border border-border/30">
      <div className="flex items-center justify-between text-sm">
        <span className="text-muted-foreground">Outcome</span>
        <span className={cn(
          'font-semibold',
          outcome === 'yes' ? 'text-success' : 'text-danger'
        )}>
          {outcome === 'yes' ? 'Yes' : 'No'}
        </span>
      </div>

      <div className="flex items-center justify-between text-sm">
        <span className="text-muted-foreground">Order Type</span>
        <span className="font-medium text-foreground capitalize">
          {orderType}
        </span>
      </div>

      <div className="h-px bg-border/50" />

      <div className="flex items-center justify-between text-sm">
        <span className="text-muted-foreground">Shares</span>
        <span className="font-medium text-foreground">
          {shares.toFixed(2)}
        </span>
      </div>

      <div className="flex items-center justify-between text-sm">
        <span className="text-muted-foreground">
          {isBuying ? 'Avg. Price' : 'Sell Price'}
        </span>
        <span className="font-medium text-foreground">
          {formatPrice(averagePrice)}¢
        </span>
      </div>

      <div className="h-px bg-border/50" />

      <div className="flex items-center justify-between text-sm">
        <span className="text-muted-foreground">
          {isBuying ? 'Total Cost' : 'Est. Proceeds'}
        </span>
        <span className="font-semibold text-foreground">
          ${totalCost.toFixed(2)}
        </span>
      </div>

      {isBuying && (
        <>
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-1.5">
              <span className="text-muted-foreground">Potential Payout</span>
              <Info className="h-3.5 w-3.5 text-muted-foreground/50" />
            </div>
            <span className="font-semibold text-success">
              ${potentialPayout.toFixed(2)}
            </span>
          </div>

          {potentialProfit > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex items-center justify-between text-sm pt-1"
            >
              <span className="text-muted-foreground">Return</span>
              <span className="font-bold text-success">
                +${potentialProfit.toFixed(2)} ({profitPercentage}%)
              </span>
            </motion.div>
          )}
        </>
      )}
    </div>
  );
}
