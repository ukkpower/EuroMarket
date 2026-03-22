'use client';

import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { useMarketStore } from '@/store/marketStore';
import type { MarketSortOption, MarketStatusFilter } from '@/types/market';

const SORT_OPTIONS: MarketSortOption[] = [
  'volume24hr',
  'createdAt',
  'volume',
  'liquidity',
  'endingSoon',
];

const STATUS_OPTIONS: MarketStatusFilter[] = ['active', 'resolved'];

export function SubFilterBar() {
  const { t } = useTranslation();
  const {
    activeCategory,
    sortOption,
    statusFilter,
    setSortOption,
    setStatusFilter,
  } = useMarketStore();

  return (
    <div className="border-b border-border/50 bg-background">
      <div className="px-4 lg:px-6 py-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <motion.h1
            key={activeCategory}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            className="text-2xl font-bold"
          >
            {t(`categories.title.${activeCategory}`)}
          </motion.h1>

          <div className="flex flex-wrap items-center gap-2">
            <label className="sr-only" htmlFor="markets-sort-select">
              {t('subFilterBar.controls.sortBy')}
            </label>
            <select
              id="markets-sort-select"
              value={sortOption}
              onChange={(event) => setSortOption(event.target.value as MarketSortOption)}
              className="h-9 rounded-md border border-input bg-background px-3 text-sm font-medium text-foreground shadow-sm outline-none transition-colors focus-visible:ring-2 focus-visible:ring-ring"
            >
              {SORT_OPTIONS.map((option) => (
                <option key={option} value={option}>
                  {t(`subFilterBar.controls.sortOptions.${option}`)}
                </option>
              ))}
            </select>

            <label className="sr-only" htmlFor="markets-status-select">
              {t('subFilterBar.controls.status')}
            </label>
            <select
              id="markets-status-select"
              value={statusFilter}
              onChange={(event) => setStatusFilter(event.target.value as MarketStatusFilter)}
              className="h-9 rounded-md border border-input bg-background px-3 text-sm font-medium text-foreground shadow-sm outline-none transition-colors focus-visible:ring-2 focus-visible:ring-ring"
            >
              {STATUS_OPTIONS.map((option) => (
                <option key={option} value={option}>
                  {t(`subFilterBar.controls.statusOptions.${option}`)}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>
    </div>
  );
}
