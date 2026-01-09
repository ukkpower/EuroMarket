'use client';

import { useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { SearchX } from 'lucide-react';
import { MarketCard, MarketCardSkeleton } from './MarketCard';
import { useMarketStore } from '@/store/marketStore';
import { filterMarkets } from '@/data/markets';

export function MarketGrid() {
  const { activeCategory, subFilters, searchQuery } = useMarketStore();

  const filteredMarkets = useMemo(() => {
    return filterMarkets(activeCategory, subFilters, searchQuery);
  }, [activeCategory, subFilters, searchQuery]);

  if (filteredMarkets.length === 0) {
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
        {filteredMarkets.map((market) => (
          <MarketCard 
            key={market.id} 
            market={market}
          />
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
        <MarketCardSkeleton key={i} />
      ))}
    </div>
  );
}

