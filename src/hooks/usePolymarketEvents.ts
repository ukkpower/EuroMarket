'use client';

import { useQuery } from '@tanstack/react-query';
import type { 
  PolymarketEvent, 
  PolymarketTag, 
  ParsedEvent, 
  ParsedMarket 
} from '@/types/market';

// Helper to parse market data
function parseMarket(market: PolymarketEvent['markets'][0]): ParsedMarket {
  let outcomes: string[] = ['Yes', 'No'];
  let outcomePrices: number[] = [0.5, 0.5];

  try {
    outcomes = JSON.parse(market.outcomes || '["Yes", "No"]');
  } catch {
    // Default to Yes/No
  }

  try {
    outcomePrices = JSON.parse(market.outcomePrices || '[0.5, 0.5]');
  } catch {
    // Default to 50/50
  }

  const yesPrice = outcomePrices[0] || 0.5;
  const noPrice = outcomePrices[1] || 0.5;

  return {
    id: market.id,
    question: market.question,
    slug: market.slug,
    endDate: market.endDate,
    conditionId: market.conditionId,
    outcomes,
    outcomePrices,
    volume: parseFloat(market.volume) || 0,
    liquidity: parseFloat(market.liquidity) || 0,
    active: market.active,
    closed: market.closed,
    groupItemTitle: market.groupItemTitle,
    yesPrice,
    noPrice,
    probability: Math.round(yesPrice * 100),
  };
}

// Helper to parse event data
function parseEvent(event: PolymarketEvent): ParsedEvent {
  const markets = event.markets.map(parseMarket);
  
  // Sort markets by volume (descending) to get top markets
  const sortedMarkets = [...markets].sort((a, b) => b.volume - a.volume);
  
  return {
    id: event.id,
    slug: event.slug,
    title: event.title,
    description: event.description,
    image: event.image,
    icon: event.icon,
    active: event.active,
    closed: event.closed,
    volume: parseFloat(event.volume) || 0,
    liquidity: parseFloat(event.liquidity) || 0,
    markets: sortedMarkets,
    tags: event.tags || [],
    isSingleMarket: markets.length === 1,
    topMarket: sortedMarkets[0] || null,
  };
}

// Fetch events
async function fetchEvents(params: {
  tagId?: string | null;
  search?: string;
  limit?: number;
  offset?: number;
}): Promise<ParsedEvent[]> {
  const url = new URL('/api/polymarket/events', window.location.origin);
  
  if (params.tagId) {
    url.searchParams.set('tag_id', params.tagId);
  }
  if (params.search) {
    url.searchParams.set('search', params.search);
  }
  if (params.limit) {
    url.searchParams.set('limit', params.limit.toString());
  }
  if (params.offset) {
    url.searchParams.set('offset', params.offset.toString());
  }

  const response = await fetch(url.toString());
  
  if (!response.ok) {
    throw new Error('Failed to fetch events');
  }

  const events: PolymarketEvent[] = await response.json();
  return events.map(parseEvent);
}

// Fetch single event by slug
async function fetchEventBySlug(slug: string): Promise<ParsedEvent> {
  const url = new URL(`/api/polymarket/events/${encodeURIComponent(slug)}`, window.location.origin);

  const response = await fetch(url.toString());
  
  if (!response.ok) {
    if (response.status === 404) {
      throw new Error('Event not found');
    }
    throw new Error('Failed to fetch event');
  }

  const event: PolymarketEvent = await response.json();
  return parseEvent(event);
}

// Fetch tags
async function fetchTags(): Promise<PolymarketTag[]> {
  const response = await fetch('/api/polymarket/tags');
  
  if (!response.ok) {
    throw new Error('Failed to fetch tags');
  }

  return response.json();
}

// React Query hook for events
export function usePolymarketEvents(params: {
  tagId?: string | null;
  search?: string;
  limit?: number;
  offset?: number;
} = {}) {
  return useQuery({
    queryKey: ['polymarket-events', params],
    queryFn: () => fetchEvents(params),
    staleTime: 60 * 1000, // 1 minute
  });
}

// React Query hook for single event by slug
export function usePolymarketEvent(slug: string) {
  return useQuery({
    queryKey: ['polymarket-event', slug],
    queryFn: () => fetchEventBySlug(slug),
    staleTime: 30 * 1000, // 30 seconds
    enabled: !!slug,
  });
}

// React Query hook for tags
export function usePolymarketTags() {
  return useQuery({
    queryKey: ['polymarket-tags'],
    queryFn: fetchTags,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

// Helper to format volume for display
export function formatVolume(volume: number): string {
  if (volume >= 1_000_000) {
    return `$${(volume / 1_000_000).toFixed(1)}m`;
  }
  if (volume >= 1_000) {
    return `$${(volume / 1_000).toFixed(0)}k`;
  }
  return `$${volume.toFixed(0)}`;
}

// Helper to format price as percentage
export function formatPrice(price: number): string {
  return `${Math.round(price * 100)}%`;
}
