'use client';

import { motion } from 'framer-motion';
import { ArrowLeft, Share2, Bookmark, Clock, TrendingUp, Droplets } from 'lucide-react';
import Link from 'next/link';
import { ChanceGauge } from '@/components/ChanceGauge';
import { formatVolume } from '@/hooks/usePolymarketEvents';
import type { ParsedEvent, ParsedMarket } from '@/types/market';
import { cn } from '@/lib/utils';

type EventHeaderProps = {
  event: ParsedEvent;
  selectedMarket?: ParsedMarket;
};

function formatTimeRemaining(endDate: string): string {
  const end = new Date(endDate);
  const now = new Date();
  const diff = end.getTime() - now.getTime();

  if (diff <= 0) return 'Ended';

  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));

  if (days > 30) {
    const months = Math.floor(days / 30);
    return `${months}mo remaining`;
  }
  if (days > 0) {
    return `${days}d ${hours}h remaining`;
  }
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
  return `${hours}h ${minutes}m remaining`;
}

export function EventHeader({ event, selectedMarket }: EventHeaderProps) {
  const market = selectedMarket || event.topMarket;

  return (
    <div className="space-y-4">
      {/* Back Navigation */}
      <Link 
        href="/markets"
        className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
      >
        <ArrowLeft className="h-4 w-4" />
        <span>Back to Markets</span>
      </Link>

      {/* Main Header */}
      <div className="flex flex-col lg:flex-row lg:items-start gap-4">
        {/* Event Image */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="w-20 h-20 lg:w-24 lg:h-24 rounded-2xl overflow-hidden bg-secondary shrink-0"
        >
          {event.image ? (
            <img 
              src={event.image} 
              alt={event.title}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-3xl">
              {event.icon || '📊'}
            </div>
          )}
        </motion.div>

        {/* Title and Tags */}
        <div className="flex-1 min-w-0">
          <motion.h1 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-xl lg:text-2xl font-bold leading-tight mb-2"
          >
            {event.title}
          </motion.h1>

          {/* Tags */}
          {event.tags && event.tags.length > 0 && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.1 }}
              className="flex flex-wrap gap-2 mb-3"
            >
              {event.tags.slice(0, 4).map((tag) => (
                <span 
                  key={tag.id}
                  className="px-2.5 py-1 text-xs font-medium rounded-full bg-secondary text-muted-foreground"
                >
                  {tag.label}
                </span>
              ))}
            </motion.div>
          )}

          {/* Stats Row */}
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.15 }}
            className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground"
          >
            <div className="flex items-center gap-1.5">
              <TrendingUp className="h-4 w-4" />
              <span className="font-medium">{formatVolume(event.volume)} Vol.</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Droplets className="h-4 w-4" />
              <span className="font-medium">{formatVolume(event.liquidity)} Liq.</span>
            </div>
            {market && (
              <div className="flex items-center gap-1.5">
                <Clock className="h-4 w-4" />
                <span className="font-medium">{formatTimeRemaining(market.endDate)}</span>
              </div>
            )}
          </motion.div>
        </div>

        {/* Actions and Gauge (Desktop) */}
        <div className="hidden lg:flex items-start gap-4">
          {/* Chance Gauge for Single Market */}
          {event.isSingleMarket && market && (
            <ChanceGauge probability={market.probability} size="lg" />
          )}

          {/* Action Buttons */}
          <div className="flex items-center gap-2">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="p-2.5 rounded-xl bg-secondary hover:bg-secondary/80 transition-colors"
              aria-label="Share"
            >
              <Share2 className="h-5 w-5" />
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="p-2.5 rounded-xl bg-secondary hover:bg-secondary/80 transition-colors"
              aria-label="Bookmark"
            >
              <Bookmark className="h-5 w-5" />
            </motion.button>
          </div>
        </div>
      </div>

      {/* Mobile Actions */}
      <div className="flex lg:hidden items-center justify-between">
        {event.isSingleMarket && market && (
          <ChanceGauge probability={market.probability} size="md" />
        )}
        <div className="flex items-center gap-2">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="p-2 rounded-lg bg-secondary hover:bg-secondary/80 transition-colors"
            aria-label="Share"
          >
            <Share2 className="h-4 w-4" />
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="p-2 rounded-lg bg-secondary hover:bg-secondary/80 transition-colors"
            aria-label="Bookmark"
          >
            <Bookmark className="h-4 w-4" />
          </motion.button>
        </div>
      </div>
    </div>
  );
}

// Skeleton for loading state
export function EventHeaderSkeleton() {
  return (
    <div className="space-y-4">
      {/* Back link skeleton */}
      <div className="h-5 w-28 bg-secondary animate-pulse rounded" />

      <div className="flex flex-col lg:flex-row lg:items-start gap-4">
        {/* Image skeleton */}
        <div className="w-20 h-20 lg:w-24 lg:h-24 rounded-2xl bg-secondary animate-pulse" />

        {/* Content skeleton */}
        <div className="flex-1 space-y-3">
          <div className="h-7 w-3/4 bg-secondary animate-pulse rounded" />
          <div className="flex gap-2">
            <div className="h-6 w-16 bg-secondary animate-pulse rounded-full" />
            <div className="h-6 w-20 bg-secondary animate-pulse rounded-full" />
          </div>
          <div className="flex gap-4">
            <div className="h-5 w-24 bg-secondary animate-pulse rounded" />
            <div className="h-5 w-20 bg-secondary animate-pulse rounded" />
            <div className="h-5 w-32 bg-secondary animate-pulse rounded" />
          </div>
        </div>

        {/* Gauge skeleton */}
        <div className="hidden lg:block w-[72px] h-[72px] rounded-full bg-secondary animate-pulse" />
      </div>
    </div>
  );
}
