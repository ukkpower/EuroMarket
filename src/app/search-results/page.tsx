'use client';

import { Suspense } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, SearchX } from 'lucide-react';
import { useSearchParams } from 'next/navigation';
import { useTranslation } from 'react-i18next';
import { usePolymarketSearchEvents } from '@/hooks/usePolymarketEvents';
import {
  SingleMarketCard,
  SingleMarketCardSkeleton,
} from '@/components/SingleMarketCard';
import {
  MultiMarketCard,
  MultiMarketCardSkeleton,
} from '@/components/MultiMarketCard';
import { formatInteger } from '@/lib/intl';
import { shouldUseSingleStyleCard } from '@/lib/sportsCardMeta';

export default function SearchResultsPage() {
  return (
    <Suspense fallback={<SearchResultsFallback />}>
      <SearchResultsContent />
    </Suspense>
  );
}

function SearchResultsContent() {
  const { t, i18n } = useTranslation();
  const searchParams = useSearchParams();
  const query = searchParams.get('q')?.trim() ?? '';

  const { data: events, isLoading, isError, error } = usePolymarketSearchEvents({
    query,
    limit: 50,
  });

  if (!query) {
    return (
      <div className="flex-1 p-4 lg:p-6">
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <div className="w-16 h-16 rounded-2xl bg-secondary flex items-center justify-center mb-4">
            <Search className="h-8 w-8 text-muted-foreground" />
          </div>
          <h2 className="font-semibold text-lg mb-2">{t('search.startSearchingTitle')}</h2>
          <p className="text-muted-foreground text-sm max-w-md">
            {t('search.startSearchingHint')}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 p-4 lg:p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">
          {t('search.resultsFor', { query })}
        </h1>
        {!isLoading && !isError && (
          <p className="text-sm text-muted-foreground mt-1">
            {t('search.resultsCount', {
              formattedCount: formatInteger(
                events?.length ?? 0,
                i18n.resolvedLanguage || i18n.language
              ),
            })}
          </p>
        )}
      </div>

      {isLoading && <SearchResultsSkeleton />}

      {isError && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col items-center justify-center py-20 text-center"
        >
          <div className="w-16 h-16 rounded-2xl bg-danger/10 flex items-center justify-center mb-4">
            <SearchX className="h-8 w-8 text-danger" />
          </div>
          <h3 className="font-semibold text-lg mb-2">{t('search.searchFailed')}</h3>
          <p className="text-muted-foreground text-sm max-w-md">
            {error instanceof Error ? error.message : t('search.searchFailedHint')}
          </p>
        </motion.div>
      )}

      {!isLoading && !isError && (!events || events.length === 0) && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col items-center justify-center py-20 text-center"
        >
          <div className="w-16 h-16 rounded-2xl bg-secondary flex items-center justify-center mb-4">
            <SearchX className="h-8 w-8 text-muted-foreground" />
          </div>
          <h3 className="font-semibold text-lg mb-2">{t('search.noMarketsFound')}</h3>
          <p className="text-muted-foreground text-sm max-w-md">
            {t('search.noMarketsHint')}
          </p>
        </motion.div>
      )}

      {!isLoading && !isError && events && events.length > 0 && (
        <motion.div
          layout
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4"
          transition={{ layout: { duration: 0.2 } }}
        >
          <AnimatePresence mode="popLayout">
            {events.map((event) => (
              shouldUseSingleStyleCard(event) ? (
                <SingleMarketCard key={event.id} event={event} />
              ) : (
                <MultiMarketCard key={event.id} event={event} />
              )
            ))}
          </AnimatePresence>
        </motion.div>
      )}
    </div>
  );
}

function SearchResultsSkeleton() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
      {Array.from({ length: 6 }).map((_, index) => (
        index % 2 === 0
          ? <SingleMarketCardSkeleton key={index} />
          : <MultiMarketCardSkeleton key={index} />
      ))}
    </div>
  );
}

function SearchResultsFallback() {
  return (
    <div className="flex-1 p-4 lg:p-6">
      <SearchResultsSkeleton />
    </div>
  );
}
