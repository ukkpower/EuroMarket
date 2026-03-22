'use client';

import { useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { SearchX } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { SingleMarketCard, SingleMarketCardSkeleton } from './SingleMarketCard';
import { MultiMarketCard, MultiMarketCardSkeleton } from './MultiMarketCard';
import { useMarketStore } from '@/store/marketStore';
import { usePolymarketEvents } from '@/hooks/usePolymarketEvents';
import { useRelatedTags } from '@/hooks/useRelatedTags';
import { CATEGORY_TO_TAG_ID } from '@/types/market';
import { subFilters, isDynamicCategory } from '@/data/categories';
import { CRYPTO_TIME_FILTERS, FINANCE_TIME_FILTERS } from '@/data/sidebarConfig';
import { resolveSportsTagId, SPORTS_ROOT_TAG_ID } from '@/data/sportsTagMap';
import type { ParsedEvent } from '@/types/market';
import { shouldUseSingleStyleCard } from '@/lib/sportsCardMeta';

const CRYPTO_EXCLUDE_STOCKS_AND_INDICES_FOR = new Set([
  'daily',
  'weekly',
  'monthly',
  'yearly',
  'pre-market',
  'etf',
]);

const CRYPTO_EXCLUDE_TAG_IDS = ['102682', '604', '107', '101031', '102932'];
const FINANCE_EXCLUDE_TAG_IDS = ['21']; // Exclude crypto
const HIDE_FROM_NEW_TAG_ID = '102169';

function getSoonestMarketEndTimestamp(event: ParsedEvent): number {
  let soonest = Number.POSITIVE_INFINITY;

  for (const market of event.markets) {
    const rawDate = market.endDateIso || market.endDate;
    const timestamp = rawDate ? Date.parse(rawDate) : Number.NaN;

    if (!Number.isNaN(timestamp) && timestamp < soonest) {
      soonest = timestamp;
    }
  }

  return soonest;
}

export function MarketGrid() {
  const { t } = useTranslation();
  const {
    activeCategory,
    activeSubFilterId,
    activeSportsTopFilter,
    sortOption,
    statusFilter,
  } = useMarketStore();
  const { subFilters: dynamicSubFilters } = useRelatedTags(activeCategory);

  const categoryTagId = CATEGORY_TO_TAG_ID[activeCategory];
  const subFiltersForCategory = isDynamicCategory(activeCategory)
    ? dynamicSubFilters
    : subFilters[activeCategory] ?? [];
  const activeSub = activeSubFilterId
    ? subFiltersForCategory.find((s) => s.id === activeSubFilterId)
    : null;
  let tagId = activeSub?.tagId ?? categoryTagId;
  let order:
    | 'volume'
    | 'volume24hr'
    | 'createdAt'
    | 'liquidity'
    | 'openInterest'
    | 'updatedAt'
    | undefined;
  let ascending: boolean | undefined;

  switch (sortOption) {
    case 'volume24hr':
      order = 'volume24hr';
      ascending = false;
      break;
    case 'createdAt':
      order = 'createdAt';
      ascending = false;
      break;
    case 'volume':
      order = 'volume';
      ascending = false;
      break;
    case 'liquidity':
      order = 'liquidity';
      ascending = false;
      break;
    case 'endingSoon':
      // API does not expose end-date sorting, so fetch with stable order and sort client-side.
      order = 'volume';
      ascending = false;
      break;
  }

  if (activeCategory === 'sports') {
    const hasSportsTopFilter =
      activeSportsTopFilter === 'live' || activeSportsTopFilter === 'futures';
    tagId = hasSportsTopFilter
      ? SPORTS_ROOT_TAG_ID
      : resolveSportsTagId(activeSubFilterId);
  }

  // For crypto timeframe filters that should exclude stocks/indices,
  // configure Polymarket exclude_tag_id params.
  const excludeTagIds: string[] = [];

  if (activeCategory === 'new') {
    excludeTagIds.push(HIDE_FROM_NEW_TAG_ID);
  }

  // For crypto category, treat activeSubFilterId as the single selected
  // menu item (timeframe OR coin) and derive tag/exclusions from it.
  if (activeCategory === 'crypto' && activeSubFilterId) {
    const activeTimeFilter = CRYPTO_TIME_FILTERS.find(
      (f) => f.id === activeSubFilterId && f.tagId
    );

    if (activeTimeFilter?.tagId) {
      tagId = activeTimeFilter.tagId;
    }

    if (CRYPTO_EXCLUDE_STOCKS_AND_INDICES_FOR.has(activeSubFilterId)) {
      excludeTagIds.push(...CRYPTO_EXCLUDE_TAG_IDS);
    }
  }

  // For finance category, make time filters drive the tag selection and
  // exclude crypto results.
  if (activeCategory === 'finance' && activeSubFilterId) {
    const activeTimeFilter = FINANCE_TIME_FILTERS.find(
      (f) => f.id === activeSubFilterId && f.tagId
    );

    if (activeTimeFilter?.tagId) {
      tagId = activeTimeFilter.tagId;
      excludeTagIds.push(...FINANCE_EXCLUDE_TAG_IDS);
    }
  }

  const uniqueExcludeTagIds =
    excludeTagIds.length > 0 ? Array.from(new Set(excludeTagIds)) : undefined;

  const isActiveStatus = statusFilter === 'active';

  const { data: events, isLoading, isError, error } = usePolymarketEvents({
    tagId,
    order,
    ascending,
    active: isActiveStatus,
    closed: !isActiveStatus,
    limit: 50,
    excludeTagIds: uniqueExcludeTagIds,
  });

  const displayEvents = useMemo(() => {
    if (!events || sortOption !== 'endingSoon') {
      return events;
    }

    return [...events].sort((a, b) => {
      const aTimestamp = getSoonestMarketEndTimestamp(a);
      const bTimestamp = getSoonestMarketEndTimestamp(b);
      return aTimestamp - bTimestamp;
    });
  }, [events, sortOption]);

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
        <h3 className="font-semibold text-lg mb-2">{t('marketGrid.failedTitle')}</h3>
        <p className="text-muted-foreground text-sm max-w-md">
          {error instanceof Error ? error.message : t('marketGrid.failedHint')}
        </p>
      </motion.div>
    );
  }

  if (!displayEvents || displayEvents.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col items-center justify-center py-20 text-center"
      >
        <div className="w-16 h-16 rounded-2xl bg-secondary flex items-center justify-center mb-4">
          <SearchX className="h-8 w-8 text-muted-foreground" />
        </div>
        <h3 className="font-semibold text-lg mb-2">{t('marketGrid.noMarketsTitle')}</h3>
        <p className="text-muted-foreground text-sm max-w-md">
          {t('marketGrid.noMarketsHint')}
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
        {displayEvents.map((event) => (
          shouldUseSingleStyleCard(event) ? (
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
