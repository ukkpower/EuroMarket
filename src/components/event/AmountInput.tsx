'use client';

import { motion } from 'framer-motion';
import { DollarSign } from 'lucide-react';
import type { OrderType } from '@/types/market';
import { cn, formatPrice } from '@/lib/utils';

type AmountInputProps = {
  amount: string;
  onChangeAmount: (amount: string) => void;
  orderType: OrderType;
  limitPrice: number | null;
  onChangeLimitPrice: (price: number | null) => void;
  currentPrice: number;
};

const QUICK_AMOUNTS = [10, 25, 50, 100];

export function AmountInput({
  amount,
  onChangeAmount,
  orderType,
  limitPrice,
  onChangeLimitPrice,
  currentPrice,
}: AmountInputProps) {
  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    // Only allow numbers and decimal point
    if (value === '' || /^\d*\.?\d*$/.test(value)) {
      onChangeAmount(value);
    }
  };

  const handleLimitPriceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    if (value === '') {
      onChangeLimitPrice(null);
      return;
    }
    // Parse as cents (0-100)
    const numValue = parseFloat(value);
    if (!isNaN(numValue) && numValue >= 0 && numValue <= 100) {
      onChangeLimitPrice(numValue / 100);
    }
  };

  return (
    <div className="space-y-4">
      {/* Limit Price (only for limit orders) */}
      {orderType === 'limit' && (
        <div className="space-y-2">
          <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
            Limit Price
          </label>
          <div className="relative">
            <input
              type="text"
              inputMode="decimal"
              value={limitPrice !== null ? formatPrice(limitPrice) : ''}
              onChange={handleLimitPriceChange}
              placeholder={formatPrice(currentPrice)}
              className={cn(
                'w-full h-12 pl-4 pr-8 rounded-xl border border-border/50 bg-secondary/30',
                'text-lg font-medium placeholder:text-muted-foreground/50',
                'focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all'
              )}
            />
            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-sm font-medium text-muted-foreground">
              ¢
            </span>
          </div>
          <p className="text-xs text-muted-foreground">
            Current price: {formatPrice(currentPrice)}¢
          </p>
        </div>
      )}

      {/* Amount Input */}
      <div className="space-y-2">
        <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
          Amount
        </label>
        <div className="relative">
          <DollarSign className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
          <input
            type="text"
            inputMode="decimal"
            value={amount}
            onChange={handleAmountChange}
            placeholder="0.00"
            className={cn(
              'w-full h-14 pl-11 pr-4 rounded-xl border border-border/50 bg-secondary/30',
              'text-xl font-semibold placeholder:text-muted-foreground/50',
              'focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all'
            )}
          />
        </div>
      </div>

      {/* Quick Amount Buttons */}
      <div className="flex gap-2">
        {QUICK_AMOUNTS.map((quickAmount) => (
          <motion.button
            key={quickAmount}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => onChangeAmount(quickAmount.toString())}
            className={cn(
              'flex-1 py-2 rounded-lg text-sm font-medium transition-colors',
              amount === quickAmount.toString()
                ? 'bg-primary text-primary-foreground'
                : 'bg-secondary hover:bg-secondary/80 text-muted-foreground'
            )}
          >
            ${quickAmount}
          </motion.button>
        ))}
      </div>
    </div>
  );
}
