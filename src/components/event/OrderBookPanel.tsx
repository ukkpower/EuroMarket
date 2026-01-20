'use client';

import { useRef, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { ArrowUpDown, Maximize2 } from 'lucide-react';
import type { ParsedMarket } from '@/types/market';
import { useOrderBook } from '@/hooks/useOrderBook';
import { useEventStore } from '@/store/eventStore';
import { cn, formatPrice } from '@/lib/utils';

type OrderBookPanelProps = {
  market: ParsedMarket;
};

export function OrderBookPanel({ market }: OrderBookPanelProps) {
  const { data: orderBook, isLoading, error } = useOrderBook(market);
  const { selectedOutcome } = useEventStore();
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const centerLineRef = useRef<HTMLDivElement>(null);
  const asksContainerRef = useRef<HTMLDivElement>(null);
  
  // Function to scroll center line to the middle of the visible area
  const scrollToCenter = useCallback((instant: boolean = false) => {
    if (!scrollContainerRef.current || !centerLineRef.current || !asksContainerRef.current) return;
    
    const container = scrollContainerRef.current;
    const asksContainer = asksContainerRef.current;
    const centerLine = centerLineRef.current;
    
    // Get container dimensions
    const containerHeight = container.clientHeight;
    
    // Calculate the height of asks section (this is where center line naturally starts)
    const asksHeight = asksContainer.offsetHeight;
    const centerLineHeight = centerLine.offsetHeight;
    
    // To center the center line, we need to scroll so that its natural position
    // (asksHeight) is at the middle of the container
    // Since it's sticky at top-0, we scroll so that when it reaches its natural position,
    // it appears centered (but it will stick to top when scrolling)
    // Actually, to show it centered, we scroll so that asksHeight is at containerHeight/2
    const targetScrollTop = asksHeight - (containerHeight / 2) + (centerLineHeight / 2);
    
    container.scrollTo({
      top: Math.max(0, targetScrollTop),
      behavior: instant ? 'auto' : 'smooth',
    });
  }, []);

  // Scroll to center on mount and when order book data changes (instant)
  useEffect(() => {
    if (orderBook && !isLoading) {
      // Use requestAnimationFrame for instant update without delay
      requestAnimationFrame(() => {
        scrollToCenter(true); // Instant scroll
      });
    }
  }, [orderBook, isLoading, selectedOutcome, scrollToCenter]);

  // Handler for center button click (smooth scroll)
  const handleCenterClick = useCallback(() => {
    scrollToCenter(false); // Smooth scroll for button click
  }, [scrollToCenter]);
  
  if (isLoading) {
    return <OrderBookPanelSkeleton />;
  }
  
  if (error || !orderBook) {
    return null;
  }

  // Use selected outcome order book for display
  const outcomeData = orderBook[selectedOutcome];
  const { bids, asks, spread } = outcomeData;
  
  // Get the current price for the selected outcome
  const currentPrice = selectedOutcome === 'yes' ? market.yesPrice : market.noPrice;
  const outcomeLabel = selectedOutcome === 'yes' ? 'Yes' : 'No';
  
  // Handle empty order books
  if (bids.length === 0 && asks.length === 0) {
    return (
      <div className="bg-card rounded-2xl border border-border/50 overflow-hidden">
        <div className="flex items-center justify-center px-4 py-8 text-sm text-muted-foreground">
          No order book data available
        </div>
      </div>
    );
  }
  
  // Reverse asks to show highest first (for display)
  const displayAsks = [...asks].reverse();
  
  const maxSize = Math.max(
    ...(bids.length > 0 ? bids.map(b => b.size) : [0]),
    ...(asks.length > 0 ? asks.map(a => a.size) : [0]),
    1
  );

  // Calculate max height to show approximately 4 asks + center + 4 bids
  // Each row is approximately py-1.5 (6px top + 6px bottom) + text height (~20px) = ~32px per row
  // 4 asks (4 * 32px = 128px) + center (~40px) + 4 bids (4 * 32px = 128px) = ~296px
  // Use max-h-[300px] to show roughly 4 asks and 4 bids, with scrolling for more
  const maxHeight = 'max-h-[300px]';

  return (
    <div className="bg-card rounded-2xl border border-border/50 overflow-hidden flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-border/50 shrink-0">
        <div className="flex items-center gap-2">
          <h3 className="font-semibold text-sm text-foreground">Order Book</h3>
          <button
            onClick={handleCenterClick}
            className="p-1 hover:bg-secondary/50 rounded transition-colors"
            title="Center order book"
            aria-label="Center order book"
          >
            <Maximize2 className="h-3.5 w-3.5 text-muted-foreground" />
          </button>
        </div>
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <span>Spread:</span>
          <span className="font-medium text-foreground">
            {formatPrice(spread)}¢
          </span>
        </div>
      </div>

      {/* Column Headers */}
      <div className="grid grid-cols-3 px-4 py-2 text-xs font-medium text-muted-foreground border-b border-border/30 shrink-0">
        <span>Price</span>
        <span className="text-center">Shares</span>
        <span className="text-right">Total</span>
      </div>

      {/* Scrollable Order Book Content */}
      <div ref={scrollContainerRef} className={`overflow-y-auto ${maxHeight} flex flex-col`}>
        {/* Asks (Sell orders) - Reversed to show highest first */}
        <div ref={asksContainerRef} className="divide-y divide-border/20">
          {displayAsks.map((level, index) => {
            const widthPercent = (level.size / maxSize) * 100;
            // Calculate running total from best ask (lowest price) upward
            // Since displayAsks is reversed, we need to calculate from the end
            const originalIndex = asks.length - 1 - index;
            const runningTotal = asks
              .slice(0, originalIndex + 1)
              .reduce((sum, l) => sum + l.size, 0);
            
            return (
              <div key={`ask-${index}`} className="relative grid grid-cols-3 px-4 py-1.5 text-sm">
                {/* Background bar */}
                <div 
                  className="absolute inset-y-0 right-0 bg-danger/10"
                  style={{ width: `${widthPercent}%` }}
                />
                <span className="relative text-danger font-medium">
                  {formatPrice(level.price)}¢
                </span>
                <span className="relative text-center text-muted-foreground">
                  {level.size.toLocaleString()}
                </span>
                <span className="relative text-right text-muted-foreground">
                  {runningTotal.toLocaleString()}
                </span>
              </div>
            );
          })}
        </div>

        {/* Mid Price Indicator - Sticky so it stays visible when scrolling */}
        <div ref={centerLineRef} className="flex items-center justify-center gap-2 py-2 bg-secondary/50 border-y border-border/30 sticky top-0 z-10 shrink-0">
          <ArrowUpDown className="h-4 w-4 text-muted-foreground" />
          <span className="text-sm font-semibold text-foreground">
            {formatPrice(currentPrice)}¢
          </span>
          <span className="text-xs text-muted-foreground">
            {outcomeLabel} Price
          </span>
        </div>

        {/* Bids (Buy orders) */}
        <div className="divide-y divide-border/20">
          {bids.map((level, index) => {
            const widthPercent = (level.size / maxSize) * 100;
            const runningTotal = bids
              .slice(0, index + 1)
              .reduce((sum, l) => sum + l.size, 0);
            
            return (
              <div key={`bid-${index}`} className="relative grid grid-cols-3 px-4 py-1.5 text-sm">
                {/* Background bar */}
                <div 
                  className="absolute inset-y-0 right-0 bg-success/10"
                  style={{ width: `${widthPercent}%` }}
                />
                <span className="relative text-success font-medium">
                  {formatPrice(level.price)}¢
                </span>
                <span className="relative text-center text-muted-foreground">
                  {level.size.toLocaleString()}
                </span>
                <span className="relative text-right text-muted-foreground">
                  {runningTotal.toLocaleString()}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// Skeleton for loading state
export function OrderBookPanelSkeleton() {
  return (
    <div className="bg-card rounded-2xl border border-border/50 overflow-hidden flex flex-col">
      {/* Header skeleton */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-border/50 shrink-0">
        <div className="h-5 w-24 bg-secondary animate-pulse rounded" />
        <div className="h-4 w-20 bg-secondary animate-pulse rounded" />
      </div>

      {/* Column headers skeleton */}
      <div className="grid grid-cols-3 px-4 py-2 border-b border-border/30 shrink-0">
        <div className="h-4 w-10 bg-secondary animate-pulse rounded" />
        <div className="h-4 w-12 bg-secondary animate-pulse rounded mx-auto" />
        <div className="h-4 w-14 bg-secondary animate-pulse rounded ml-auto" />
      </div>

      {/* Rows skeleton - compact view */}
      <div className="max-h-[300px] overflow-hidden">
        <div className="divide-y divide-border/20">
          {Array.from({ length: 9 }).map((_, i) => (
            <div key={i} className="grid grid-cols-3 px-4 py-1.5">
              <div className="h-4 w-10 bg-secondary animate-pulse rounded" />
              <div className="h-4 w-12 bg-secondary animate-pulse rounded mx-auto" />
              <div className="h-4 w-14 bg-secondary animate-pulse rounded ml-auto" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
