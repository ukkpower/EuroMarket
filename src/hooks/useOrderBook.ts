'use client';

import { useQuery } from '@tanstack/react-query';
import type { ParsedMarket, OrderBookLevel } from '@/types/market';

export type OutcomeOrderBook = {
  bids: OrderBookLevel[];
  asks: OrderBookLevel[];
  bestBid: number;
  bestAsk: number;
  spread: number;
};

export type MarketOrderBook = {
  yes: OutcomeOrderBook;
  no: OutcomeOrderBook;
};

/**
 * Fetch order book data for a market
 */
async function fetchOrderBook(marketId: string): Promise<MarketOrderBook> {
  const url = new URL('/api/polymarket/orderbook', window.location.origin);
  url.searchParams.set('marketId', marketId);

  const response = await fetch(url.toString());

  if (!response.ok) {
    throw new Error('Failed to fetch order book');
  }

  return response.json();
}

/**
 * Hook to get order book data for a market
 */
export function useOrderBook(market: ParsedMarket | null) {
  return useQuery({
    queryKey: ['orderbook', market?.id],
    queryFn: () => fetchOrderBook(market!.id),
    enabled: !!market,
    staleTime: 5 * 1000, // 5 seconds (order books change frequently)
    refetchInterval: 10 * 1000, // Refetch every 10 seconds
  });
}
