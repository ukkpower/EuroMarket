'use client';

import { motion } from 'framer-motion';
import { Bookmark, RefreshCw, Gift } from 'lucide-react';
import Link from 'next/link';
import { ChanceGauge } from './ChanceGauge';
import { formatVolume } from '@/hooks/usePolymarketEvents';
import type { ParsedEvent } from '@/types/market';
import { cn } from '@/lib/utils';

type SingleMarketCardProps = {
  event: ParsedEvent;
};

export function SingleMarketCard({ event }: SingleMarketCardProps) {
  const market = event.topMarket;
  
  if (!market) return null;

  // Determine resolution frequency based on end date
  const endDate = new Date(market.endDate);
  const now = new Date();
  const daysUntilEnd = Math.ceil((endDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
  const resolutionType = daysUntilEnd <= 1 ? 'Daily' : daysUntilEnd <= 7 ? 'Weekly' : 'Monthly';

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
      {/* Header: Image + Title + Gauge */}
      <div className="flex items-start gap-3 mb-4">
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
        
        {/* Chance Gauge */}
        <ChanceGauge probability={market.probability} size="md" />
      </div>

      {/* Yes/No Buttons */}
      <div className="flex gap-2 mb-4 flex-grow">
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={(e) => e.preventDefault()}
          className="flex-1 flex items-center justify-center px-4 py-2.5 rounded-xl bg-success/10 hover:bg-success/20 border border-success/20 transition-colors"
        >
          <span className="text-sm font-semibold text-success">Yes</span>
        </motion.button>
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={(e) => e.preventDefault()}
          className="flex-1 flex items-center justify-center px-4 py-2.5 rounded-xl bg-danger/10 hover:bg-danger/20 border border-danger/20 transition-colors"
        >
          <span className="text-sm font-semibold text-danger">No</span>
        </motion.button>
      </div>

      {/* Footer: Volume + Resolution + Actions */}
      <div className="flex items-center justify-between text-xs text-muted-foreground mt-auto">
        <div className="flex items-center gap-2">
          <span className="font-medium">{formatVolume(event.volume)} Vol.</span>
          <span className="flex items-center gap-1">
            <RefreshCw className="h-3 w-3" />
            {resolutionType}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <button 
            className="p-1 rounded hover:bg-secondary transition-colors"
            aria-label="Gift"
            onClick={(e) => e.preventDefault()}
          >
            <Gift className="h-4 w-4" />
          </button>
          <button 
            className="p-1 rounded hover:bg-secondary transition-colors"
            aria-label="Bookmark"
            onClick={(e) => e.preventDefault()}
          >
            <Bookmark className="h-4 w-4" />
          </button>
        </div>
      </div>
      </motion.div>
    </Link>
  );
}

// Skeleton for loading state
export function SingleMarketCardSkeleton() {
  return (
    <div className="bg-card rounded-2xl border border-border/50 p-5 h-full flex flex-col">
      {/* Header skeleton */}
      <div className="flex items-start gap-3 mb-4">
        <div className="w-12 h-12 rounded-xl bg-secondary animate-pulse" />
        <div className="flex-1 space-y-2">
          <div className="h-4 bg-secondary animate-pulse rounded w-full" />
          <div className="h-4 bg-secondary animate-pulse rounded w-2/3" />
        </div>
        <div className="w-14 h-14 rounded-full bg-secondary animate-pulse" />
      </div>

      {/* Buttons skeleton */}
      <div className="flex gap-2 mb-4 flex-grow">
        <div className="flex-1 h-11 bg-success/10 animate-pulse rounded-xl" />
        <div className="flex-1 h-11 bg-danger/10 animate-pulse rounded-xl" />
      </div>

      {/* Footer skeleton */}
      <div className="flex justify-between mt-auto">
        <div className="h-4 bg-secondary animate-pulse rounded w-24" />
        <div className="h-4 bg-secondary animate-pulse rounded w-16" />
      </div>
    </div>
  );
}
