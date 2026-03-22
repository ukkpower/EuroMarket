'use client';

import { AnimatePresence, motion } from 'framer-motion';
import { Link2, Check, Bookmark, Clock, TrendingUp, Droplets } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { formatVolume } from '@/hooks/usePolymarketEvents';
import type { ParsedEvent, ParsedMarket } from '@/types/market';
import { cn } from '@/lib/utils';
import { useBookmarks } from '@/hooks/useBookmarks';
import { formatMarketTimeRemaining } from '@/lib/marketStatus';

type EventHeaderProps = {
  event: ParsedEvent;
  selectedMarket?: ParsedMarket;
};

async function copyTextToClipboard(text: string): Promise<boolean> {
  if (typeof navigator !== 'undefined' && navigator.clipboard?.writeText) {
    await navigator.clipboard.writeText(text);
    return true;
  }

  if (typeof document === 'undefined') {
    return false;
  }

  const textArea = document.createElement('textarea');
  textArea.value = text;
  textArea.style.position = 'fixed';
  textArea.style.opacity = '0';
  document.body.appendChild(textArea);
  textArea.focus();
  textArea.select();

  try {
    return document.execCommand('copy');
  } finally {
    document.body.removeChild(textArea);
  }
}

export function EventHeader({ event, selectedMarket }: EventHeaderProps) {
  const { t } = useTranslation();
  const { isBookmarked, toggleBookmark } = useBookmarks();
  const [didCopyLink, setDidCopyLink] = useState(false);
  const shareResetTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const market = selectedMarket || event.topMarket;
  const bookmarkMarketId = market?.id ?? null;
  const bookmarked = isBookmarked(event.id, bookmarkMarketId);

  const handleBookmarkClick = async () => {
    await toggleBookmark({ event, marketId: bookmarkMarketId });
  };

  const handleShareClick = async () => {
    const copied = await copyTextToClipboard(window.location.href);
    if (!copied) {
      return;
    }

    setDidCopyLink(true);

    if (shareResetTimerRef.current) {
      clearTimeout(shareResetTimerRef.current);
    }

    shareResetTimerRef.current = setTimeout(() => {
      setDidCopyLink(false);
    }, 2000);
  };

  useEffect(() => {
    return () => {
      if (shareResetTimerRef.current) {
        clearTimeout(shareResetTimerRef.current);
      }
    };
  }, []);

  return (
    <div className="space-y-4">
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
                <span className="font-medium">{formatMarketTimeRemaining(market)}</span>
              </div>
            )}
          </motion.div>
        </div>

        {/* Actions (Desktop) */}
        <div className="hidden lg:flex items-start gap-4">
          {/* Action Buttons */}
          <div className="flex items-center gap-2">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className={cn(
                'p-2.5 rounded-xl transition-colors',
                didCopyLink
                  ? 'bg-primary/10 text-primary hover:bg-primary/20'
                  : 'bg-secondary hover:bg-secondary/80'
              )}
              aria-label={didCopyLink ? 'Link copied' : 'Copy page link'}
              onClick={handleShareClick}
            >
              <AnimatePresence mode="wait" initial={false}>
                {didCopyLink ? (
                  <motion.span
                    key="share-check-desktop"
                    initial={{ opacity: 0, scale: 0.7, rotate: -12 }}
                    animate={{ opacity: 1, scale: 1, rotate: 0 }}
                    exit={{ opacity: 0, scale: 0.7, rotate: 12 }}
                    transition={{ duration: 0.2 }}
                    className="flex"
                  >
                    <Check className="h-5 w-5" />
                  </motion.span>
                ) : (
                  <motion.span
                    key="share-link-desktop"
                    initial={{ opacity: 0, scale: 0.7, rotate: 12 }}
                    animate={{ opacity: 1, scale: 1, rotate: 0 }}
                    exit={{ opacity: 0, scale: 0.7, rotate: -12 }}
                    transition={{ duration: 0.2 }}
                    className="flex"
                  >
                    <Link2 className="h-5 w-5" />
                  </motion.span>
                )}
              </AnimatePresence>
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className={cn(
                'p-2.5 rounded-xl transition-colors',
                bookmarked
                  ? 'bg-primary/10 text-primary hover:bg-primary/20'
                  : 'bg-secondary hover:bg-secondary/80'
              )}
              aria-label={bookmarked ? t('bookmarks.removeAria') : t('bookmarks.addAria')}
              onClick={handleBookmarkClick}
            >
              <Bookmark className={cn('h-5 w-5', bookmarked && 'fill-current')} />
            </motion.button>
          </div>
        </div>
      </div>

      {/* Mobile Actions */}
      <div className="flex lg:hidden items-center justify-end">
        <div className="flex items-center gap-2">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className={cn(
              'p-2 rounded-lg transition-colors',
              didCopyLink
                ? 'bg-primary/10 text-primary hover:bg-primary/20'
                : 'bg-secondary hover:bg-secondary/80'
            )}
            aria-label={didCopyLink ? 'Link copied' : 'Copy page link'}
            onClick={handleShareClick}
          >
            <AnimatePresence mode="wait" initial={false}>
              {didCopyLink ? (
                <motion.span
                  key="share-check-mobile"
                  initial={{ opacity: 0, scale: 0.7, rotate: -12 }}
                  animate={{ opacity: 1, scale: 1, rotate: 0 }}
                  exit={{ opacity: 0, scale: 0.7, rotate: 12 }}
                  transition={{ duration: 0.2 }}
                  className="flex"
                >
                  <Check className="h-4 w-4" />
                </motion.span>
              ) : (
                <motion.span
                  key="share-link-mobile"
                  initial={{ opacity: 0, scale: 0.7, rotate: 12 }}
                  animate={{ opacity: 1, scale: 1, rotate: 0 }}
                  exit={{ opacity: 0, scale: 0.7, rotate: -12 }}
                  transition={{ duration: 0.2 }}
                  className="flex"
                >
                  <Link2 className="h-4 w-4" />
                </motion.span>
              )}
            </AnimatePresence>
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className={cn(
              'p-2 rounded-lg transition-colors',
              bookmarked
                ? 'bg-primary/10 text-primary hover:bg-primary/20'
                : 'bg-secondary hover:bg-secondary/80'
            )}
            aria-label={bookmarked ? t('bookmarks.removeAria') : t('bookmarks.addAria')}
            onClick={handleBookmarkClick}
          >
            <Bookmark className={cn('h-4 w-4', bookmarked && 'fill-current')} />
          </motion.button>
        </div>
      </div>
    </div>
  );
}

// Skeleton for loading state
export function EventHeaderSkeleton() {
  return (
    <div>
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

        {/* Actions skeleton */}
        <div className="hidden lg:flex gap-2">
          <div className="w-10 h-10 rounded-xl bg-secondary animate-pulse" />
          <div className="w-10 h-10 rounded-xl bg-secondary animate-pulse" />
        </div>
      </div>

      <div className="mt-4 flex lg:hidden justify-end gap-2">
        <div className="w-8 h-8 rounded-lg bg-secondary animate-pulse" />
        <div className="w-8 h-8 rounded-lg bg-secondary animate-pulse" />
      </div>
    </div>
  );
}
