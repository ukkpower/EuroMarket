'use client';

import { useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { SlidersHorizontal, ChevronLeft, ChevronRight, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useMarketStore } from '@/store/marketStore';
import { subFilters as subFilterData, categoryLabels } from '@/data/categories';
import { cn } from '@/lib/utils';

export function SubFilterBar() {
  const scrollRef = useRef<HTMLDivElement>(null);
  const { 
    activeCategory, 
    subFilters, 
    toggleSubFilter, 
    advancedFilters,
    setAdvancedFilter,
  } = useMarketStore();

  const availableFilters = subFilterData[activeCategory] || [];
  const hasFilters = availableFilters.length > 0;

  const scroll = (direction: 'left' | 'right') => {
    if (scrollRef.current) {
      const scrollAmount = 200;
      scrollRef.current.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth',
      });
    }
  };

  return (
    <div className="bg-card/50 backdrop-blur-sm border-b border-border/50 sticky top-16 z-40">
      <div className="px-4 py-3">
        {/* Title and Advanced Toggle */}
        <div className="flex items-center justify-between mb-3">
          <motion.h2
            key={activeCategory}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            className="text-lg font-semibold"
          >
            {categoryLabels[activeCategory]}
          </motion.h2>
          
          <Button
            variant="outline"
            size="sm"
            className="gap-2"
            onClick={() => {
              // Toggle showing advanced filters
              const newValue = !advancedFilters.minLiquidity && !advancedFilters.closingSoon && !advancedFilters.highVolatility;
              setAdvancedFilter('minLiquidity', newValue);
            }}
          >
            <SlidersHorizontal className="h-4 w-4" />
            <span className="hidden sm:inline">Filters</span>
          </Button>
        </div>

        {/* Sub-filter Pills */}
        <AnimatePresence mode="wait">
          {hasFilters && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="relative"
            >
              {/* Scroll buttons */}
              <button
                onClick={() => scroll('left')}
                className="absolute left-0 top-1/2 -translate-y-1/2 z-10 w-8 h-8 flex items-center justify-center bg-gradient-to-r from-card to-transparent"
              >
                <ChevronLeft className="h-4 w-4 text-muted-foreground" />
              </button>
              
              <div
                ref={scrollRef}
                className="flex gap-2 overflow-x-auto scrollbar-hide px-8"
              >
                {availableFilters.map((filter) => {
                  const isActive = subFilters.includes(filter.id);
                  return (
                    <motion.button
                      key={filter.id}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => toggleSubFilter(filter.id)}
                      className={cn(
                        'relative px-4 py-1.5 rounded-full text-sm font-medium whitespace-nowrap transition-colors',
                        isActive
                          ? 'bg-primary text-primary-foreground'
                          : 'bg-secondary text-muted-foreground hover:text-foreground hover:bg-secondary/80'
                      )}
                    >
                      {isActive && (
                        <motion.div
                          layoutId="pill-indicator"
                          className="absolute inset-0 bg-primary rounded-full"
                          transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                        />
                      )}
                      <span className="relative z-10">{filter.label}</span>
                    </motion.button>
                  );
                })}
              </div>
              
              <button
                onClick={() => scroll('right')}
                className="absolute right-0 top-1/2 -translate-y-1/2 z-10 w-8 h-8 flex items-center justify-center bg-gradient-to-l from-card to-transparent"
              >
                <ChevronRight className="h-4 w-4 text-muted-foreground" />
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Advanced Filters */}
        <AnimatePresence>
          {(advancedFilters.minLiquidity || advancedFilters.closingSoon || advancedFilters.highVolatility) && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="flex flex-wrap gap-2 mt-3 pt-3 border-t border-border/50"
            >
              <Badge
                variant={advancedFilters.minLiquidity ? 'default' : 'outline'}
                className="cursor-pointer"
                onClick={() => setAdvancedFilter('minLiquidity', !advancedFilters.minLiquidity)}
              >
                Min Liquidity $100K
                {advancedFilters.minLiquidity && <X className="h-3 w-3 ml-1" />}
              </Badge>
              <Badge
                variant={advancedFilters.closingSoon ? 'default' : 'outline'}
                className="cursor-pointer"
                onClick={() => setAdvancedFilter('closingSoon', !advancedFilters.closingSoon)}
              >
                Closing Soon
                {advancedFilters.closingSoon && <X className="h-3 w-3 ml-1" />}
              </Badge>
              <Badge
                variant={advancedFilters.highVolatility ? 'default' : 'outline'}
                className="cursor-pointer"
                onClick={() => setAdvancedFilter('highVolatility', !advancedFilters.highVolatility)}
              >
                High Volatility
                {advancedFilters.highVolatility && <X className="h-3 w-3 ml-1" />}
              </Badge>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Active Sub-filters Summary */}
        {subFilters.length > 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex items-center gap-2 mt-3 pt-3 border-t border-border/50"
          >
            <span className="text-xs text-muted-foreground">Active:</span>
            {subFilters.map((filterId) => {
              const filter = availableFilters.find((f) => f.id === filterId);
              if (!filter) return null;
              return (
                <Badge
                  key={filterId}
                  variant="secondary"
                  className="cursor-pointer gap-1"
                  onClick={() => toggleSubFilter(filterId)}
                >
                  {filter.label}
                  <X className="h-3 w-3" />
                </Badge>
              );
            })}
          </motion.div>
        )}
      </div>
    </div>
  );
}
