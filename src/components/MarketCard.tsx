'use client';

import { motion } from 'framer-motion';
import { Clock, TrendingUp, Flame } from 'lucide-react';
import { Sparkline } from './Sparkline';
import { Badge } from '@/components/ui/badge';
import { formatEuro, formatPrice } from '@/data/markets';
import type { Market } from '@/types/market';
import { cn } from '@/lib/utils';

type MarketCardProps = {
  market: Market;
};

export function MarketCard({ market }: MarketCardProps) {
  const daysUntilEnd = Math.ceil(
    (new Date(market.endDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24)
  );

  return (
    <motion.div
      layout
      layoutId={market.id}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ 
        duration: 0.2, 
        layout: { 
          type: 'spring', 
          stiffness: 500, 
          damping: 35,
          mass: 0.5
        }
      }}
      whileHover={{ 
        y: -4,
        boxShadow: '0 20px 40px -12px rgba(0, 87, 255, 0.15)',
      }}
      style={{ willChange: 'transform' }}
      className="group relative bg-card rounded-2xl border border-border/50 p-5 cursor-pointer transition-colors hover:border-primary/30"
    >
      {/* Hot/New Badge */}
      {(market.isHot || market.isNew) && (
        <div className="absolute -top-2 -right-2">
          {market.isHot && (
            <Badge className="bg-orange-500 hover:bg-orange-600 text-white border-0 gap-1">
              <Flame className="h-3 w-3" />
              Hot
            </Badge>
          )}
          {market.isNew && !market.isHot && (
            <Badge className="bg-euro-teal text-slate-900 border-0 gap-1">
              <Clock className="h-3 w-3" />
              New
            </Badge>
          )}
        </div>
      )}

      {/* Header: Icon + Title */}
      <div className="flex items-start gap-3 mb-4">
        <div className="w-10 h-10 rounded-xl bg-secondary flex items-center justify-center text-xl shrink-0">
          {market.icon}
        </div>
        <h3 className="font-semibold text-sm leading-tight line-clamp-2 group-hover:text-primary transition-colors">
          {market.title}
        </h3>
      </div>

      {/* Sparkline */}
      <div className="mb-4 -mx-1">
        <Sparkline 
          data={market.priceHistory} 
          width={240} 
          height={40} 
          className="w-full"
        />
      </div>

      {/* Yes/No Buttons */}
      <div className="flex gap-2 mb-4">
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className="flex-1 flex items-center justify-between px-4 py-2.5 rounded-xl bg-success/10 hover:bg-success/20 border border-success/20 transition-colors"
        >
          <span className="text-sm font-semibold text-success">Yes</span>
          <span className="text-sm font-bold text-success">
            {formatPrice(market.yesPrice)}
          </span>
        </motion.button>
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className="flex-1 flex items-center justify-between px-4 py-2.5 rounded-xl bg-danger/10 hover:bg-danger/20 border border-danger/20 transition-colors"
        >
          <span className="text-sm font-semibold text-danger">No</span>
          <span className="text-sm font-bold text-danger">
            {formatPrice(market.noPrice)}
          </span>
        </motion.button>
      </div>

      {/* Stats Row */}
      <div className="flex items-center justify-between text-xs text-muted-foreground">
        <div className="flex items-center gap-1">
          <TrendingUp className="h-3.5 w-3.5" />
          <span>Vol: {formatEuro(market.volume)}</span>
        </div>
        <div className="flex items-center gap-3">
          <span className="font-medium text-foreground">{market.probability}%</span>
          <span className={cn(
            'px-2 py-0.5 rounded-full text-[10px] font-medium',
            daysUntilEnd <= 7 
              ? 'bg-orange-500/10 text-orange-500' 
              : 'bg-secondary text-muted-foreground'
          )}>
            {daysUntilEnd}d left
          </span>
        </div>
      </div>
    </motion.div>
  );
}

// Skeleton for loading state
export function MarketCardSkeleton() {
  return (
    <div className="bg-card rounded-2xl border border-border/50 p-5">
      {/* Header skeleton */}
      <div className="flex items-start gap-3 mb-4">
        <div className="w-10 h-10 rounded-xl bg-secondary animate-pulse" />
        <div className="flex-1 space-y-2">
          <div className="h-4 bg-secondary animate-pulse rounded w-full" />
          <div className="h-4 bg-secondary animate-pulse rounded w-2/3" />
        </div>
      </div>

      {/* Sparkline skeleton */}
      <div className="h-10 bg-secondary/50 animate-pulse rounded mb-4" />

      {/* Buttons skeleton */}
      <div className="flex gap-2 mb-4">
        <div className="flex-1 h-11 bg-success/10 animate-pulse rounded-xl" />
        <div className="flex-1 h-11 bg-danger/10 animate-pulse rounded-xl" />
      </div>

      {/* Stats skeleton */}
      <div className="flex justify-between">
        <div className="h-4 bg-secondary animate-pulse rounded w-20" />
        <div className="h-4 bg-secondary animate-pulse rounded w-16" />
      </div>
    </div>
  );
}

