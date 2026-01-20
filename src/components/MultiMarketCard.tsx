'use client';

import { motion } from 'framer-motion';
import { Bookmark } from 'lucide-react';
import Link from 'next/link';
import { formatVolume } from '@/hooks/usePolymarketEvents';
import type { ParsedEvent, ParsedMarket } from '@/types/market';
import { cn } from '@/lib/utils';

type MultiMarketCardProps = {
  event: ParsedEvent;
};

type MarketRowProps = {
  market: ParsedMarket;
  isLast?: boolean;
  isFirst?: boolean;
};

function MarketRow({ market, isLast, isFirst }: MarketRowProps) {
  // Format the label - use groupItemTitle or extract from question
  const label = market.groupItemTitle || market.question;
  
  return (
    <div className={cn(
      'flex items-center gap-3',
      isFirst && 'mb-2'
    )}>
      {/* Option Label */}
      <span className="flex-1 text-sm font-medium text-foreground truncate">
        {label}
      </span>
      
      {/* Probability */}
      <span className="text-sm font-bold text-foreground min-w-[40px] text-right">
        {market.probability}%
      </span>
      
      {/* Yes/No Buttons */}
      <div className="flex gap-1.5">
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={(e) => e.preventDefault()}
          className="w-12 px-3 py-1 rounded-lg bg-success/10 hover:bg-success/20 border border-success/20 transition-colors leading-normal"
        >
          <span className="text-xs font-semibold text-success">Yes</span>
        </motion.button>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={(e) => e.preventDefault()}
          className="w-12 px-3 py-1 rounded-lg bg-danger/10 hover:bg-danger/20 border border-danger/20 transition-colors leading-normal"
        >
          <span className="text-xs font-semibold text-danger">No</span>
        </motion.button>
      </div>
    </div>
  );
}

export function MultiMarketCard({ event }: MultiMarketCardProps) {
  // Get top 2 markets by volume
  const topMarkets = event.markets.slice(0, 2);
  
  if (topMarkets.length === 0) return null;

  return (
    <Link href={`/event/${event.slug}`} className="h-full">
      <motion.div
        layout
        layoutId={event.id}
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
        className="group relative bg-card rounded-2xl border border-border/50 p-5 cursor-pointer transition-colors hover:border-primary/30 h-full flex flex-col"
      >
      {/* Header: Image + Title */}
      <div className="flex items-start gap-3 mb-2">
        {/* Event Image */}
        <div className="w-12 h-12 rounded-xl overflow-hidden bg-secondary shrink-0">
          {event.image ? (
            <img 
              src={event.image} 
              alt={event.title}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-xl">
              {event.icon || '📊'}
            </div>
          )}
        </div>
        
        {/* Title */}
        <h3 className="flex-1 font-semibold text-sm leading-tight line-clamp-2 group-hover:text-primary transition-colors">
          {event.title}
        </h3>
      </div>

      {/* Market Rows */}
      <div className="mb-3 flex-grow">
        {topMarkets.map((market, index) => (
          <MarketRow 
            key={market.id} 
            market={market} 
            isLast={index === topMarkets.length - 1}
            isFirst={index === 0}
          />
        ))}
      </div>

      {/* Footer: Volume + More indicator + Bookmark */}
      <div className="flex items-center justify-between text-xs text-muted-foreground mt-auto">
        <div className="flex items-center gap-2">
          <span className="font-medium">{formatVolume(event.volume)} Vol.</span>
          {event.markets.length > 2 && (
            <span className="text-primary font-medium">
              +{event.markets.length - 2} more
            </span>
          )}
        </div>
        <button 
          className="p-1 rounded hover:bg-secondary transition-colors"
          aria-label="Bookmark"
          onClick={(e) => e.preventDefault()}
        >
          <Bookmark className="h-4 w-4" />
        </button>
      </div>
      </motion.div>
    </Link>
  );
}

// Skeleton for loading state
export function MultiMarketCardSkeleton() {
  return (
    <div className="bg-card rounded-2xl border border-border/50 p-5 h-full flex flex-col">
      {/* Header skeleton */}
      <div className="flex items-start gap-3 mb-2">
        <div className="w-12 h-12 rounded-xl bg-secondary animate-pulse" />
        <div className="flex-1 space-y-2">
          <div className="h-4 bg-secondary animate-pulse rounded w-full" />
          <div className="h-4 bg-secondary animate-pulse rounded w-2/3" />
        </div>
      </div>

      {/* Market rows skeleton */}
      <div className="mb-3 space-y-3 flex-grow">
        {[1, 2].map((i) => (
          <div key={i} className="flex items-center gap-3 py-3 border-b border-border/30 last:border-0">
            <div className="flex-1 h-4 bg-secondary animate-pulse rounded" />
            <div className="w-10 h-4 bg-secondary animate-pulse rounded" />
            <div className="flex gap-1.5">
              <div className="w-12 h-7 bg-success/10 animate-pulse rounded-lg" />
              <div className="w-12 h-7 bg-danger/10 animate-pulse rounded-lg" />
            </div>
          </div>
        ))}
      </div>

      {/* Footer skeleton */}
      <div className="flex justify-between mt-auto">
        <div className="h-4 bg-secondary animate-pulse rounded w-20" />
        <div className="w-6 h-6 bg-secondary animate-pulse rounded" />
      </div>
    </div>
  );
}
