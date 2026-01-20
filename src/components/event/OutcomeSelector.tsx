'use client';

import { motion } from 'framer-motion';
import type { TradeOutcome, TradeSide } from '@/types/market';
import { cn, formatPrice } from '@/lib/utils';

type OutcomeSelectorProps = {
  selectedOutcome: TradeOutcome;
  onSelectOutcome: (outcome: TradeOutcome) => void;
  yesPrice: number;
  noPrice: number;
  tradeSide?: TradeSide;
};

export function OutcomeSelector({
  selectedOutcome,
  onSelectOutcome,
  yesPrice,
  noPrice,
  tradeSide = 'buy',
}: OutcomeSelectorProps) {
  // When buying: show ask prices (what you pay)
  // When selling: show bid prices (what you receive)
  // For now using the same prices, but labels could differ
  const yesDisplayPrice = yesPrice;
  const noDisplayPrice = noPrice;

  return (
    <div className="grid grid-cols-2 gap-3">
      {/* Yes Button */}
      <motion.button
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        onClick={() => onSelectOutcome('yes')}
        className={cn(
          'relative flex items-center justify-center gap-2 py-4 rounded-xl font-semibold transition-all',
          selectedOutcome === 'yes'
            ? 'bg-success text-success-foreground'
            : 'bg-secondary text-muted-foreground hover:bg-secondary/80'
        )}
      >
        <span>Yes</span>
        <span className={cn(
          selectedOutcome === 'yes' ? 'text-success-foreground/90' : 'text-muted-foreground'
        )}>
          {formatPrice(yesDisplayPrice)}¢
        </span>
      </motion.button>

      {/* No Button */}
      <motion.button
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        onClick={() => onSelectOutcome('no')}
        className={cn(
          'relative flex items-center justify-center gap-2 py-4 rounded-xl font-semibold transition-all',
          selectedOutcome === 'no'
            ? 'bg-danger text-danger-foreground'
            : 'bg-secondary text-muted-foreground hover:bg-secondary/80'
        )}
      >
        <span>No</span>
        <span className={cn(
          selectedOutcome === 'no' ? 'text-danger-foreground/90' : 'text-muted-foreground'
        )}>
          {formatPrice(noDisplayPrice)}¢
        </span>
      </motion.button>
    </div>
  );
}
