'use client';

import { motion } from 'framer-motion';
import { Bookmark, RefreshCw, Gift } from 'lucide-react';
import Link from 'next/link';
import { ChanceGauge } from './ChanceGauge';
import { useTranslation } from 'react-i18next';
import type { ParsedEvent } from '@/types/market';
import { formatCompactCurrency } from '@/lib/intl';
import { useBookmarks } from '@/hooks/useBookmarks';
import { cn } from '@/lib/utils';
import { getEffectiveMarketEndDate } from '@/lib/marketStatus';
import {
  getDrawCardButtonLabels,
  getDrawCardOutcomePercentages,
  getTwoWayCardLabels,
  isDrawMatchEvent,
} from '@/lib/sportsCardMeta';

type SingleMarketCardProps = {
  event: ParsedEvent;
  preferredMarketId?: string | null;
};

export function SingleMarketCard({ event, preferredMarketId }: SingleMarketCardProps) {
  const { t, i18n } = useTranslation();
  const { isBookmarked, toggleBookmark } = useBookmarks();
  const market =
    (preferredMarketId
      ? event.markets.find((item) => item.id === preferredMarketId)
      : null) ?? event.topMarket;
  
  if (!market) return null;
  const bookmarkMarketId = preferredMarketId ?? market.id ?? null;
  const bookmarked = isBookmarked(event.id, bookmarkMarketId);
  const eventHref = bookmarkMarketId
    ? `/event/${event.slug}?market=${encodeURIComponent(bookmarkMarketId)}`
    : `/event/${event.slug}`;

  // Determine resolution frequency based on end date
  const endDate = getEffectiveMarketEndDate(market);
  const now = new Date();
  const daysUntilEnd = endDate
    ? Math.ceil((endDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
    : 30;
  const resolutionKey = daysUntilEnd <= 1 ? 'daily' : daysUntilEnd <= 7 ? 'weekly' : 'monthly';
  const displayVolume = formatCompactCurrency(event.volume, i18n.resolvedLanguage || i18n.language);
  const drawMatchEvent = isDrawMatchEvent(event);
  const [drawLeftLabel, drawMiddleLabel, drawRightLabel] = getDrawCardButtonLabels(event);
  const [drawLeftChance, drawMiddleChance, drawRightChance] = getDrawCardOutcomePercentages(event);
  const twoWayLabels = getTwoWayCardLabels(event, market);
  const showButtonPercentages = drawMatchEvent || Boolean(twoWayLabels);
  const leftLabel = drawMatchEvent ? drawLeftLabel : (twoWayLabels?.[0] ?? t('marketCard.yes'));
  const rightLabel = drawMatchEvent ? drawRightLabel : (twoWayLabels?.[1] ?? t('marketCard.no'));
  const leftChance = drawMatchEvent ? drawLeftChance : market.probability;
  const middleChance = drawMatchEvent ? drawMiddleChance : null;
  const rightChance = drawMatchEvent ? drawRightChance : Math.round(Math.max(0, Math.min(1, market.noPrice)) * 100);

  return (
    <Link href={eventHref} className="h-full">
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

      {/* Outcome Buttons */}
      <div className="flex gap-2 mb-4 flex-grow">
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={(e) => e.preventDefault()}
          className="flex-1 flex items-center justify-center px-4 py-2.5 rounded-xl bg-success/10 hover:bg-success/20 border border-success/20 transition-colors"
        >
          <span className="flex flex-col items-center leading-tight">
            <span className="text-sm font-semibold text-success">{leftLabel}</span>
            {showButtonPercentages && (
              <span className="text-[11px] font-medium text-success/80">{leftChance}%</span>
            )}
          </span>
        </motion.button>
        {drawMatchEvent && (
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={(e) => e.preventDefault()}
            className="flex-1 flex items-center justify-center px-4 py-2.5 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 transition-colors"
          >
            <span className="flex flex-col items-center leading-tight">
              <span className="text-sm font-semibold text-amber-700 dark:text-amber-300">
                {drawMiddleLabel}
              </span>
              {showButtonPercentages && (
                <span className="text-[11px] font-medium text-amber-700/80 dark:text-amber-300/80">
                  {middleChance ?? 0}%
                </span>
              )}
            </span>
          </motion.button>
        )}
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={(e) => e.preventDefault()}
          className="flex-1 flex items-center justify-center px-4 py-2.5 rounded-xl bg-danger/10 hover:bg-danger/20 border border-danger/20 transition-colors"
        >
          <span className="flex flex-col items-center leading-tight">
            <span className="text-sm font-semibold text-danger">{rightLabel}</span>
            {showButtonPercentages && (
              <span className="text-[11px] font-medium text-danger/80">{rightChance}%</span>
            )}
          </span>
        </motion.button>
      </div>

      {/* Footer: Volume + Resolution + Actions */}
      <div className="flex items-center justify-between text-xs text-muted-foreground mt-auto">
        <div className="flex items-center gap-2">
          <span className="font-medium">{displayVolume} {t('marketCard.volumeShort')}</span>
          <span className="flex items-center gap-1">
            <RefreshCw className="h-3 w-3" />
            {t(`marketCard.resolution.${resolutionKey}`)}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <button 
            className="p-1 rounded hover:bg-secondary transition-colors"
            aria-label="Gift"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
            }}
          >
            <Gift className="h-4 w-4" />
          </button>
          <button 
            className={cn(
              'p-1 rounded transition-colors hover:bg-secondary',
              bookmarked && 'text-primary'
            )}
            aria-label={bookmarked ? t('bookmarks.removeAria') : t('bookmarks.addAria')}
            onClick={async (e) => {
              e.preventDefault();
              e.stopPropagation();
              await toggleBookmark({ event, marketId: bookmarkMarketId });
            }}
          >
            <Bookmark className={cn('h-4 w-4', bookmarked && 'fill-current')} />
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
