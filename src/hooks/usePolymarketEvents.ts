'use client';

import { useQuery } from '@tanstack/react-query';
import type {
  MarketResolutionStep,
  PolymarketEvent,
  PolymarketMarket,
  PolymarketTag,
  ParsedEvent,
  ParsedMarket
} from '@/types/market';
import { getEffectiveMarketEndDate, isMarketEnded } from '@/lib/marketStatus';

type EventOrder =
  | 'volume'
  | 'volume24hr'
  | 'createdAt'
  | 'liquidity'
  | 'openInterest'
  | 'updatedAt';

type UsePolymarketEventsParams = {
  tagId?: string | null;
  limit?: number;
  offset?: number;
  order?: EventOrder;
  ascending?: boolean;
  featured?: boolean;
  active?: boolean;
  closed?: boolean;
  /** Optional Polymarket tag IDs to exclude (e.g. stocks, indices) */
  excludeTagIds?: string[];
};

type ResolutionStatusObject = Record<string, unknown>;
const DEFAULT_FINAL_REVIEW_DURATION_MS = 3 * 60 * 60 * 1000;

function toSentenceCase(value: string): string {
  if (!value) return value;
  return value.charAt(0).toUpperCase() + value.slice(1);
}

function readStringField(
  source: ResolutionStatusObject,
  keys: string[]
): string | undefined {
  for (const key of keys) {
    const value = source[key];
    if (typeof value === 'string' && value.trim().length > 0) {
      return value.trim();
    }
  }
  return undefined;
}

function readBooleanField(
  source: ResolutionStatusObject,
  keys: string[]
): boolean | undefined {
  for (const key of keys) {
    const value = source[key];
    if (typeof value === 'boolean') return value;
  }
  return undefined;
}

function parseOutcome(value: unknown): 'Yes' | 'No' | undefined {
  if (typeof value === 'number') {
    if (value >= 0.5) return 'Yes';
    return 'No';
  }

  if (typeof value !== 'string') return undefined;
  const normalized = value.trim().toLowerCase();
  if (!normalized) return undefined;

  if (normalized === 'yes' || normalized === 'true' || normalized === '1') {
    return 'Yes';
  }
  if (normalized === 'no' || normalized === 'false' || normalized === '0') {
    return 'No';
  }

  return undefined;
}

function mapStatusTokenToStep(
  statusToken: string,
  item?: ResolutionStatusObject
): MarketResolutionStep {
  const normalized = statusToken.toLowerCase().replace(/[_-]/g, ' ').trim();
  const itemOutcome =
    item &&
    parseOutcome(
      item.outcome ??
        item.proposedOutcome ??
        item.proposedAnswer ??
        item.answer ??
        item.result ??
        item.price ??
        item.proposedPrice
    );

  if (normalized.includes('propos')) {
    return {
      kind: 'outcome_proposed',
      label: `Outcome proposed: ${itemOutcome || 'Yes'}`,
    };
  }

  if (normalized.includes('disput')) {
    return { kind: 'disputed', label: 'Disputed' };
  }

  if (normalized.includes('review') || normalized.includes('liveness')) {
    return { kind: 'final_review', label: 'Final review' };
  }

  if (
    normalized.includes('resolved') ||
    normalized.includes('settled') ||
    normalized.includes('finalized')
  ) {
    return { kind: 'resolved', label: 'Resolved' };
  }

  return {
    kind: 'other',
    label: toSentenceCase(normalized || 'Resolution update'),
  };
}

function parseResolutionStatusItem(item: unknown): MarketResolutionStep | null {
  if (typeof item === 'string') {
    return mapStatusTokenToStep(item);
  }

  if (!item || typeof item !== 'object') {
    return null;
  }

  const obj = item as ResolutionStatusObject;
  const explicitLabel = readStringField(obj, ['label', 'title', 'message']);
  const statusToken = readStringField(obj, ['status', 'state', 'type', 'action']);
  const occurredAt = readStringField(obj, [
    'timestamp',
    'createdAt',
    'updatedAt',
    'occurredAt',
    'time',
  ]);
  const endsAt = readStringField(obj, [
    'endsAt',
    'endDate',
    'endTime',
    'expiresAt',
    'expirationTime',
    'deadline',
    'reviewEnd',
    'reviewEndsAt',
    'finalReviewEnd',
    'livenessEndsAt',
  ]);
  const current =
    readBooleanField(obj, ['isCurrent', 'current', 'active', 'open']) ?? false;

  const mapped = mapStatusTokenToStep(statusToken || explicitLabel || 'update', obj);
  return {
    ...mapped,
    label: explicitLabel || mapped.label,
    occurredAt,
    endsAt,
    isCurrent: current,
  };
}

function parseResolutionStatuses(rawStatuses?: string): MarketResolutionStep[] {
  if (!rawStatuses) return [];

  let parsed: unknown;
  try {
    parsed = JSON.parse(rawStatuses);
  } catch {
    return [];
  }

  if (!Array.isArray(parsed)) return [];

  return parsed
    .map(parseResolutionStatusItem)
    .filter((entry): entry is MarketResolutionStep => Boolean(entry));
}

function getResolutionDeadline(market: PolymarketMarket): string | undefined {
  const fallback = market as unknown as ResolutionStatusObject;
  const value = readStringField(fallback, [
    'finalReviewEndsAt',
    'finalReviewEnd',
    'reviewEnd',
    'livenessEndsAt',
    'resolutionDeadline',
    'resolutionEnd',
  ]);
  return value;
}

function parseIsoDate(value?: string): number | null {
  if (!value) return null;
  const parsed = new Date(value);
  const timestamp = parsed.getTime();
  return Number.isNaN(timestamp) ? null : timestamp;
}

function getFallbackFinalReviewDeadline(
  market: PolymarketMarket,
  parsedSteps: MarketResolutionStep[]
): string | undefined {
  const stepTimestamps = parsedSteps
    .map((step) => parseIsoDate(step.occurredAt))
    .filter((value): value is number => typeof value === 'number');

  const fallback = market as unknown as ResolutionStatusObject;
  const marketUpdatedAt = parseIsoDate(readStringField(fallback, ['updatedAt', 'createdAt']));
  const marketEndDate = parseIsoDate(market.endDate);

  const baseTimestamp = Math.max(
    ...stepTimestamps,
    marketUpdatedAt ?? Number.NEGATIVE_INFINITY,
    marketEndDate ?? Number.NEGATIVE_INFINITY
  );

  if (!Number.isFinite(baseTimestamp)) {
    return undefined;
  }

  return new Date(baseTimestamp + DEFAULT_FINAL_REVIEW_DURATION_MS).toISOString();
}

function isMarketInResolution(
  market: PolymarketMarket,
  marketEnded: boolean
): boolean {
  const endDate = getEffectiveMarketEndDate(market);
  const hasPassedEnd = Boolean(endDate && endDate.getTime() <= Date.now());

  return (
    !market.closed &&
    (market.ended === true ||
      market.acceptingOrders === false ||
      hasPassedEnd ||
      (!market.active && marketEnded))
  );
}

function buildResolutionSteps(
  market: PolymarketMarket,
  inResolution: boolean
): MarketResolutionStep[] {
  const parsed = parseResolutionStatuses(market.umaResolutionStatuses);
  const deadline =
    getResolutionDeadline(market) || getFallbackFinalReviewDeadline(market, parsed);

  if (!inResolution) {
    return parsed;
  }

  if (!parsed.length) {
    return [
      {
        kind: 'final_review',
        label: 'Final review',
        endsAt: deadline,
        isCurrent: true,
      },
    ];
  }

  const hasResolvedStep = parsed.some((step) => step.kind === 'resolved');
  if (hasResolvedStep) {
    return parsed;
  }

  const steps = parsed.map((step) => ({ ...step, isCurrent: false }));
  const finalReviewIndex = steps.findIndex((step) => step.kind === 'final_review');

  if (finalReviewIndex >= 0) {
    const target = steps[finalReviewIndex];
    steps[finalReviewIndex] = {
      ...target,
      isCurrent: true,
      endsAt: target.endsAt || deadline,
    };
    return steps;
  }

  steps.push({
    kind: 'final_review',
    label: 'Final review',
    endsAt: deadline,
    isCurrent: true,
  });
  return steps;
}

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
  const marketEnded = isMarketEnded(market);
  const isInResolution = isMarketInResolution(market, marketEnded);
  const resolutionSteps = buildResolutionSteps(market, isInResolution);

  return {
    id: market.id,
    question: market.question,
    slug: market.slug,
    endDate: market.endDate,
    endDateIso: market.endDateIso,
    conditionId: market.conditionId,
    outcomes,
    outcomePrices,
    volume: parseFloat(market.volume) || 0,
    liquidity: parseFloat(market.liquidity) || 0,
    active: market.active,
    closed: market.closed,
    acceptingOrders: market.acceptingOrders,
    isEnded: marketEnded,
    groupItemTitle: market.groupItemTitle,
    resolvedBy: market.resolvedBy,
    resolutionRequestId:
      (market.negRisk ? market.negRiskRequestID : market.questionID) ||
      market.questionID,
    isInResolution,
    resolutionSteps,
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
    ticker: event.ticker,
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
async function fetchEvents(params: UsePolymarketEventsParams): Promise<ParsedEvent[]> {
  const url = new URL('/api/polymarket/events', window.location.origin);

  if (params.tagId) {
    url.searchParams.set('tag_id', params.tagId);
  }
  if (params.limit) {
    url.searchParams.set('limit', params.limit.toString());
  }
  if (params.offset) {
    url.searchParams.set('offset', params.offset.toString());
  }
  if (params.order) {
    url.searchParams.set('order', params.order);
  }
  if (typeof params.ascending === 'boolean') {
    url.searchParams.set('ascending', String(params.ascending));
  }
  if (typeof params.featured === 'boolean') {
    url.searchParams.set('featured', String(params.featured));
  }
  if (typeof params.active === 'boolean') {
    url.searchParams.set('active', String(params.active));
  }
  if (typeof params.closed === 'boolean') {
    url.searchParams.set('closed', String(params.closed));
  }
  if (params.excludeTagIds && params.excludeTagIds.length > 0) {
    for (const id of params.excludeTagIds) {
      url.searchParams.append('exclude_tag_id', id);
    }
  }

  const response = await fetch(url.toString());

  if (!response.ok) {
    throw new Error('Failed to fetch events');
  }

  const events: PolymarketEvent[] = await response.json();
  return events.map(parseEvent);
}

// Fetch global search events
async function fetchSearchEvents(query: string, limit = 50): Promise<ParsedEvent[]> {
  const url = new URL('/api/polymarket/search', window.location.origin);
  url.searchParams.set('q', query.trim());
  url.searchParams.set('limit', String(limit));

  const response = await fetch(url.toString());

  if (!response.ok) {
    throw new Error('Failed to search events');
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
export function usePolymarketEvents(params: UsePolymarketEventsParams = {}) {
  return useQuery({
    queryKey: ['polymarket-events', params],
    queryFn: () => fetchEvents(params),
    staleTime: 60 * 1000, // 1 minute
  });
}

// React Query hook for global search events
export function usePolymarketSearchEvents(params: {
  query: string;
  limit?: number;
}) {
  const normalizedQuery = params.query.trim();

  return useQuery({
    queryKey: ['polymarket-search-events', normalizedQuery, params.limit ?? 50],
    queryFn: () => fetchSearchEvents(normalizedQuery, params.limit ?? 50),
    staleTime: 30 * 1000, // 30 seconds
    enabled: normalizedQuery.length > 0,
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
