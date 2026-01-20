'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { SearchX } from 'lucide-react';
import { SingleMarketCard, SingleMarketCardSkeleton } from './SingleMarketCard';
import { MultiMarketCard, MultiMarketCardSkeleton } from './MultiMarketCard';
import { useMarketStore } from '@/store/marketStore';
import { usePolymarketEvents } from '@/hooks/usePolymarketEvents';
import { CATEGORY_TO_TAG_ID } from '@/types/market';

export function MarketGrid() {
  const { activeCategory, searchQuery } = useMarketStore();

  // Map category to Polymarket tag ID
  const tagId = CATEGORY_TO_TAG_ID[activeCategory];

  const { data: events, isLoading, isError, error } = usePolymarketEvents({
    tagId,
    search: searchQuery,
    limit: 50,
  });

  if (isLoading) {
    return <MarketGridSkeleton />;
  }

  if (isError) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col items-center justify-center py-20 text-center"
      >
        <div className="w-16 h-16 rounded-2xl bg-danger/10 flex items-center justify-center mb-4">
          <SearchX className="h-8 w-8 text-danger" />
        </div>
        <h3 className="font-semibold text-lg mb-2">Failed to load markets</h3>
        <p className="text-muted-foreground text-sm max-w-md">
          {error instanceof Error ? error.message : 'An error occurred while fetching markets.'}
        </p>
      </motion.div>
    );
  }

  if (!events || events.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col items-center justify-center py-20 text-center"
      >
        <div className="w-16 h-16 rounded-2xl bg-secondary flex items-center justify-center mb-4">
          <SearchX className="h-8 w-8 text-muted-foreground" />
        </div>
        <h3 className="font-semibold text-lg mb-2">No markets found</h3>
        <p className="text-muted-foreground text-sm max-w-md">
          Try adjusting your filters or search query to find more markets.
        </p>
      </motion.div>
    );
  }

  return (
    <motion.div
      layout
      className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4"
      transition={{ layout: { duration: 0.2 } }}
    >
      <AnimatePresence mode="popLayout">
        {events.map((event) => (
          event.isSingleMarket ? (
            <SingleMarketCard key={event.id} event={event} />
          ) : (
            <MultiMarketCard key={event.id} event={event} />
          )
        ))}
      </AnimatePresence>
    </motion.div>
  );
}

// Loading skeleton grid
export function MarketGridSkeleton() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
      {Array.from({ length: 6 }).map((_, i) => (
        i % 2 === 0 
          ? <SingleMarketCardSkeleton key={i} />
          : <MultiMarketCardSkeleton key={i} />
      ))}
    </div>
  );
}
