'use client';

import { useEffect } from 'react';
import { motion } from 'framer-motion';
import { useParams, useSearchParams } from 'next/navigation';
import { AlertCircle } from 'lucide-react';
import {
  EventHeader,
  EventHeaderSkeleton,
  MarketSelector,
  MarketSelectorSkeleton,
  TradeSidebar,
  TradeSidebarSkeleton,
  OrderBookPanel,
  OrderBookPanelSkeleton,
  PriceChart,
  PriceChartSkeleton,
  EventDescription,
  EventDescriptionSkeleton,
  ResolutionHistoryTimeline,
} from '@/components/event';
import { usePolymarketEvent } from '@/hooks/usePolymarketEvents';
import { useEventStore } from '@/store/eventStore';
import type { ParsedMarket } from '@/types/market';

export default function EventPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const slug = params.slug as string;
  const marketFromQuery = searchParams.get('market');

  const { data: event, isLoading, isError, error } = usePolymarketEvent(slug);
  const { selectedMarketId, setSelectedMarket, resetTradeForm } = useEventStore();

  // Set initial selected market when event loads
  useEffect(() => {
    if (event && !selectedMarketId) {
      const queryMarket = marketFromQuery
        ? event.markets.find((item) => item.id === marketFromQuery)
        : null;
      const initialMarket = queryMarket || event.topMarket || event.markets[0];
      if (initialMarket) {
        setSelectedMarket(initialMarket.id);
      }
    }
  }, [event, marketFromQuery, selectedMarketId, setSelectedMarket]);

  // Reset trade form when leaving the page
  useEffect(() => {
    return () => {
      resetTradeForm();
      setSelectedMarket(null);
    };
  }, [resetTradeForm, setSelectedMarket]);

  // Get the currently selected market
  const selectedMarket: ParsedMarket | null = event
    ? event.markets.find((m) => m.id === selectedMarketId) || event.topMarket
    : null;

  // Loading state
  if (isLoading) {
    return <EventPageSkeleton />;
  }

  // Error state
  if (isError) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center py-20 px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center max-w-md"
        >
          <div className="w-16 h-16 rounded-2xl bg-danger/10 flex items-center justify-center mx-auto mb-4">
            <AlertCircle className="h-8 w-8 text-danger" />
          </div>
          <h2 className="text-xl font-semibold mb-2">Event Not Found</h2>
          <p className="text-muted-foreground text-sm mb-6">
            {error instanceof Error
              ? error.message
              : 'The event you are looking for could not be found.'}
          </p>
        </motion.div>
      </div>
    );
  }

  // No event found
  if (!event) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center py-20 px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center"
        >
          <h2 className="text-xl font-semibold mb-2">Event Not Found</h2>
          <p className="text-muted-foreground text-sm">
            The event you are looking for does not exist.
          </p>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="flex-1">
      {/* Main Content */}
      <div className="flex flex-col lg:flex-row gap-6 p-4 lg:p-6 pb-24 lg:pb-6">
        {/* Left Column - Main Content */}
        <div className="flex-1 min-w-0 space-y-6">
          {/* Event Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <EventHeader event={event} selectedMarket={selectedMarket || undefined} />
          </motion.div>

          {/* Market Selector (Multi-market only) */}
          {!event.isSingleMarket && selectedMarketId && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
            >
              <MarketSelector
                markets={event.markets}
                selectedMarketId={selectedMarketId}
                onSelectMarket={setSelectedMarket}
              />
            </motion.div>
          )}

          {/* Price Chart */}
          {selectedMarket && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15 }}
            >
              <PriceChart market={selectedMarket} />
            </motion.div>
          )}

          {/* Order Book */}
          {selectedMarket && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <OrderBookPanel market={selectedMarket} />
            </motion.div>
          )}

          {/* Description */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.25 }}
          >
            <EventDescription
              description={event.description}
              resolverAddress={selectedMarket?.resolvedBy}
            />
          </motion.div>

          {selectedMarket?.isInResolution &&
            (selectedMarket.resolutionSteps?.length ?? 0) > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              <ResolutionHistoryTimeline
                steps={selectedMarket.resolutionSteps || []}
                resolutionRequestId={selectedMarket.resolutionRequestId}
              />
            </motion.div>
            )}
        </div>

        {/* Right Column - Trade Sidebar (Desktop) */}
        {selectedMarket && (
          <div className="hidden lg:block">
            <TradeSidebar market={selectedMarket} />
          </div>
        )}
      </div>

      {/* Mobile Trade Bar */}
      {selectedMarket && <MobileTradBar market={selectedMarket} eventTitle={event.title} />}
    </div>
  );
}

// Mobile Trade Bar Component
function MobileTradBar({
  market,
  eventTitle,
}: {
  market: ParsedMarket;
  eventTitle: string;
}) {
  const { setSelectedOutcome } = useEventStore();

  return (
    <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-card border-t border-border/50 p-4 pb-[calc(1rem+env(safe-area-inset-bottom))] z-50">
      <div className="flex items-center gap-3">
        {/* Price Display */}
        <div className="flex-1 min-w-0">
          <p className="text-xs text-muted-foreground truncate">{market.groupItemTitle || eventTitle}</p>
          <div className="flex items-center gap-2 mt-0.5">
            <span className="text-sm font-semibold text-success">
              Yes {Math.round(market.yesPrice * 100)}¢
            </span>
            <span className="text-muted-foreground">/</span>
            <span className="text-sm font-semibold text-danger">
              No {Math.round(market.noPrice * 100)}¢
            </span>
          </div>
        </div>

        {/* Quick Trade Buttons */}
        <div className="flex gap-2">
          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={() => setSelectedOutcome('yes')}
            className="px-5 py-2.5 rounded-xl bg-success text-success-foreground font-semibold text-sm"
          >
            Buy Yes
          </motion.button>
          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={() => setSelectedOutcome('no')}
            className="px-5 py-2.5 rounded-xl bg-danger text-danger-foreground font-semibold text-sm"
          >
            Buy No
          </motion.button>
        </div>
      </div>
    </div>
  );
}

// Loading skeleton for the entire page
function EventPageSkeleton() {
  return (
    <div className="flex-1">
      <div className="flex flex-col lg:flex-row gap-6 p-4 lg:p-6 pb-24 lg:pb-6">
        {/* Left Column */}
        <div className="flex-1 min-w-0 space-y-6">
          <EventHeaderSkeleton />
          <MarketSelectorSkeleton />
          <PriceChartSkeleton />
          <OrderBookPanelSkeleton />
          <EventDescriptionSkeleton />
        </div>

        {/* Right Column */}
        <div className="hidden lg:block">
          <TradeSidebarSkeleton />
        </div>
      </div>
    </div>
  );
}
