'use client';

import { useQuery } from '@tanstack/react-query';

export type PriceHistoryPoint = {
  t: number; // timestamp (Unix timestamp in seconds)
  p: number; // price (0-1)
};

export type PriceHistoryResponse = {
  history: PriceHistoryPoint[];
};

export type PriceHistoryInterval = '1h' | '6h' | '1d' | '1w' | '1m' | 'max';

/**
 * Fetch price history for a market outcome
 */
async function fetchPriceHistory(
  marketId: string,
  outcome: 'yes' | 'no',
  interval: PriceHistoryInterval = '1h'
): Promise<PriceHistoryResponse> {
  const url = new URL('/api/polymarket/prices-history', window.location.origin);
  url.searchParams.set('marketId', marketId);
  url.searchParams.set('outcome', outcome);
  url.searchParams.set('interval', interval);

  const response = await fetch(url.toString());

  if (!response.ok) {
    throw new Error('Failed to fetch price history');
  }

  return response.json();
}

/**
 * Hook to fetch price history for a market
 */
export function usePriceHistory(
  marketId: string | null,
  outcome: 'yes' | 'no',
  interval: PriceHistoryInterval = '1h',
  enabled: boolean = true
) {
  return useQuery({
    queryKey: ['price-history', marketId, outcome, interval],
    queryFn: () => fetchPriceHistory(marketId!, outcome, interval),
    enabled: enabled && !!marketId,
    staleTime: 60 * 1000, // 1 minute
  });
}
