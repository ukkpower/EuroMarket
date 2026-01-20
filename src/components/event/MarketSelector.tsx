'use client';

import { motion } from 'framer-motion';
import { Check } from 'lucide-react';
import type { ParsedMarket } from '@/types/market';
import { cn } from '@/lib/utils';

type MarketSelectorProps = {
  markets: ParsedMarket[];
  selectedMarketId: string;
  onSelectMarket: (id: string) => void;
};

type MarketRowProps = {
  market: ParsedMarket;
  isSelected: boolean;
  onSelect: () => void;
};

function MarketRow({ market, isSelected, onSelect }: MarketRowProps) {
  const label = market.groupItemTitle || market.question;

  return (
    <motion.button
      onClick={onSelect}
      whileHover={{ backgroundColor: 'rgba(0, 87, 255, 0.05)' }}
      whileTap={{ scale: 0.99 }}
      className={cn(
        'w-full flex items-center gap-3 p-3 rounded-xl border transition-all',
        isSelected
          ? 'border-primary bg-primary/5'
          : 'border-border/50 hover:border-primary/30'
      )}
    >
      {/* Selection indicator */}
      <div className={cn(
        'w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 transition-colors',
        isSelected
          ? 'border-primary bg-primary'
          : 'border-muted-foreground/30'
      )}>
        {isSelected && (
          <Check className="h-3 w-3 text-primary-foreground" />
        )}
      </div>

      {/* Market Label */}
      <span className={cn(
        'flex-1 text-sm font-medium text-left truncate',
        isSelected ? 'text-foreground' : 'text-muted-foreground'
      )}>
        {label}
      </span>

      {/* Probability Badge */}
      <div className={cn(
        'px-2.5 py-1 rounded-lg text-xs font-bold transition-colors',
        market.probability >= 50
          ? 'bg-success/10 text-success'
          : 'bg-danger/10 text-danger'
      )}>
        {market.probability}%
      </div>

      {/* Mini Yes/No Buttons */}
      <div className="flex gap-1.5">
        <motion.span
          whileHover={{ scale: 1.05 }}
          className="px-2 py-1 rounded-md bg-success/10 text-success text-xs font-semibold cursor-pointer hover:bg-success/20 transition-colors"
          onClick={(e) => {
            e.stopPropagation();
            onSelect();
          }}
        >
          Yes
        </motion.span>
        <motion.span
          whileHover={{ scale: 1.05 }}
          className="px-2 py-1 rounded-md bg-danger/10 text-danger text-xs font-semibold cursor-pointer hover:bg-danger/20 transition-colors"
          onClick={(e) => {
            e.stopPropagation();
            onSelect();
          }}
        >
          No
        </motion.span>
      </div>
    </motion.button>
  );
}

export function MarketSelector({ markets, selectedMarketId, onSelectMarket }: MarketSelectorProps) {
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-foreground">
          Select Market
        </h3>
        <span className="text-xs text-muted-foreground">
          {markets.length} options
        </span>
      </div>

      <div className="space-y-2 max-h-[400px] overflow-y-auto scrollbar-hide pr-1">
        {markets.map((market) => (
          <MarketRow
            key={market.id}
            market={market}
            isSelected={market.id === selectedMarketId}
            onSelect={() => onSelectMarket(market.id)}
          />
        ))}
      </div>
    </div>
  );
}

// Skeleton for loading state
export function MarketSelectorSkeleton() {
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div className="h-5 w-24 bg-secondary animate-pulse rounded" />
        <div className="h-4 w-16 bg-secondary animate-pulse rounded" />
      </div>

      <div className="space-y-2">
        {[1, 2, 3, 4].map((i) => (
          <div 
            key={i}
            className="flex items-center gap-3 p-3 rounded-xl border border-border/50"
          >
            <div className="w-5 h-5 rounded-full bg-secondary animate-pulse" />
            <div className="flex-1 h-4 bg-secondary animate-pulse rounded" />
            <div className="w-12 h-6 bg-secondary animate-pulse rounded-lg" />
            <div className="flex gap-1.5">
              <div className="w-10 h-6 bg-success/10 animate-pulse rounded-md" />
              <div className="w-10 h-6 bg-danger/10 animate-pulse rounded-md" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
