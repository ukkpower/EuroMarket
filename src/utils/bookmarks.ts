import type { BookmarkRecord } from '@/types/bookmark';
import type { ParsedEvent, ParsedMarket, PolymarketTag } from '@/types/market';
import { isMarketEnded } from '@/lib/marketStatus';

const STORAGE_PREFIX = 'euromarket_bookmarks_v1_';
export const BOOKMARKS_UPDATED_EVENT = 'euromarket:bookmarks-updated';
const EMPTY_BOOKMARKS: BookmarkRecord[] = [];
const bookmarkSnapshotCache = new Map<string, { raw: string | null; parsed: BookmarkRecord[] }>();

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

function isFiniteNumber(value: unknown): value is number {
  return typeof value === 'number' && Number.isFinite(value);
}

function toStringValue(value: unknown): string | null {
  if (typeof value === 'string') return value;
  if (typeof value === 'number' && Number.isFinite(value)) return String(value);
  return null;
}

function toBooleanValue(value: unknown, fallback = false): boolean {
  return typeof value === 'boolean' ? value : fallback;
}

function toNumberValue(value: unknown, fallback = 0): number {
  if (typeof value === 'number' && Number.isFinite(value)) return value;
  if (typeof value === 'string') {
    const parsed = Number(value);
    if (Number.isFinite(parsed)) return parsed;
  }
  return fallback;
}

function isStringArray(value: unknown): value is string[] {
  return Array.isArray(value) && value.every((item) => typeof item === 'string');
}

function isNumberArray(value: unknown): value is number[] {
  return Array.isArray(value) && value.every((item) => isFiniteNumber(item));
}

function sanitizeTag(raw: unknown): PolymarketTag | null {
  if (!isRecord(raw)) return null;

  const { id, slug, label, forceShow } = raw;
  const normalizedId = toStringValue(id);
  const normalizedSlug = toStringValue(slug);
  const normalizedLabel = toStringValue(label);
  if (!normalizedId || !normalizedSlug || !normalizedLabel) {
    return null;
  }

  return {
    id: normalizedId,
    slug: normalizedSlug,
    label: normalizedLabel,
    forceShow: typeof forceShow === 'boolean' ? forceShow : undefined,
  };
}

function sanitizeMarket(raw: unknown): ParsedMarket | null {
  if (!isRecord(raw)) return null;

  const {
    id,
    question,
    slug,
    endDate,
    endDateIso,
    conditionId,
    outcomes,
    outcomePrices,
    volume,
    liquidity,
    active,
    closed,
    acceptingOrders,
    isEnded,
    groupItemTitle,
    yesPrice,
    noPrice,
    probability,
  } = raw;
  const normalizedId = toStringValue(id);
  const normalizedQuestion = toStringValue(question);
  const normalizedSlug = toStringValue(slug);
  const normalizedEndDate = toStringValue(endDate);
  const normalizedEndDateIso = toStringValue(endDateIso);
  const normalizedConditionId = toStringValue(conditionId);

  if (
    !normalizedId ||
    !normalizedQuestion ||
    !normalizedSlug ||
    !normalizedEndDate ||
    !normalizedConditionId
  ) {
    return null;
  }

  const normalizedOutcomes = isStringArray(outcomes) ? outcomes : ['Yes', 'No'];
  const normalizedOutcomePrices = isNumberArray(outcomePrices)
    ? outcomePrices
    : [0.5, 0.5];
  const normalizedActive = toBooleanValue(active, false);
  const normalizedClosed = toBooleanValue(closed, false);
  const normalizedIsEnded = toBooleanValue(
    isEnded,
    isMarketEnded({
      active: normalizedActive,
      closed: normalizedClosed,
      endDate: normalizedEndDate,
      endDateIso: normalizedEndDateIso,
    })
  );

  return {
    id: normalizedId,
    question: normalizedQuestion,
    slug: normalizedSlug,
    endDate: normalizedEndDate,
    endDateIso: normalizedEndDateIso ?? undefined,
    conditionId: normalizedConditionId,
    outcomes: normalizedOutcomes,
    outcomePrices: normalizedOutcomePrices,
    volume: toNumberValue(volume, 0),
    liquidity: toNumberValue(liquidity, 0),
    active: normalizedActive,
    closed: normalizedClosed,
    acceptingOrders: typeof acceptingOrders === 'boolean' ? acceptingOrders : undefined,
    isEnded: normalizedIsEnded,
    groupItemTitle: typeof groupItemTitle === 'string' ? groupItemTitle : undefined,
    yesPrice: toNumberValue(yesPrice, normalizedOutcomePrices[0] ?? 0.5),
    noPrice: toNumberValue(noPrice, normalizedOutcomePrices[1] ?? 0.5),
    probability: toNumberValue(
      probability,
      Math.round(toNumberValue(yesPrice, normalizedOutcomePrices[0] ?? 0.5) * 100)
    ),
  };
}

function sanitizeEventSnapshot(raw: unknown): ParsedEvent | null {
  if (!isRecord(raw)) return null;

  const {
    id,
    ticker,
    slug,
    title,
    description,
    image,
    icon,
    active,
    closed,
    volume,
    liquidity,
    markets,
    tags,
    isSingleMarket,
    topMarket,
  } = raw;
  const normalizedId = toStringValue(id);
  const normalizedSlug = toStringValue(slug);
  const normalizedTitle = toStringValue(title);

  if (
    !normalizedId ||
    !normalizedSlug ||
    !normalizedTitle ||
    !Array.isArray(markets)
  ) {
    return null;
  }

  const sanitizedMarkets = markets
    .map(sanitizeMarket)
    .filter((market): market is ParsedMarket => market !== null);
  const sanitizedTags = (Array.isArray(tags) ? tags : [])
    .map(sanitizeTag)
    .filter((tag): tag is PolymarketTag => tag !== null);

  if (sanitizedMarkets.length === 0) return null;

  const sanitizedTopMarket = sanitizeMarket(topMarket);
  const topMarketFromList = sanitizedTopMarket
    ? sanitizedMarkets.find((market) => market.id === sanitizedTopMarket.id) ?? null
    : null;

  return {
    id: normalizedId,
    ticker: toStringValue(ticker) ?? undefined,
    slug: normalizedSlug,
    title: normalizedTitle,
    description: toStringValue(description) ?? '',
    image: toStringValue(image) ?? '',
    icon: toStringValue(icon) ?? '',
    active: toBooleanValue(active, false),
    closed: toBooleanValue(closed, false),
    volume: toNumberValue(volume, 0),
    liquidity: toNumberValue(liquidity, 0),
    markets: sanitizedMarkets,
    tags: sanitizedTags,
    isSingleMarket: typeof isSingleMarket === 'boolean' ? isSingleMarket : sanitizedMarkets.length === 1,
    topMarket: topMarketFromList ?? sanitizedMarkets[0] ?? null,
  };
}

function sanitizeBookmark(raw: unknown): BookmarkRecord | null {
  if (!isRecord(raw)) return null;

  const { id, eventId, eventSlug, marketId, savedAt, eventSnapshot } = raw;
  const normalizedEventId = toStringValue(eventId);
  const normalizedEventSlug = toStringValue(eventSlug);
  const normalizedMarketId = marketId == null ? null : toStringValue(marketId);
  const normalizedSavedAt = toNumberValue(savedAt, Date.now());

  if (
    !normalizedEventId ||
    !normalizedEventSlug
  ) {
    return null;
  }

  const normalizedId = composeBookmarkId(normalizedEventId, normalizedMarketId);
  const normalizedRawId = toStringValue(id);
  if (normalizedRawId && normalizedRawId !== normalizedId) return null;

  const sanitizedSnapshot = sanitizeEventSnapshot(eventSnapshot);
  if (!sanitizedSnapshot) return null;

  return {
    id: normalizedId,
    eventId: normalizedEventId,
    eventSlug: normalizedEventSlug,
    marketId: normalizedMarketId,
    savedAt: normalizedSavedAt,
    eventSnapshot: sanitizedSnapshot,
  };
}

function normalizeBookmarks(raw: unknown): BookmarkRecord[] {
  if (!Array.isArray(raw)) return [];

  const deduped = new Map<string, BookmarkRecord>();
  for (const entry of raw) {
    const sanitized = sanitizeBookmark(entry);
    if (!sanitized) continue;
    const existing = deduped.get(sanitized.id);
    if (!existing || sanitized.savedAt > existing.savedAt) {
      deduped.set(sanitized.id, sanitized);
    }
  }

  return Array.from(deduped.values()).sort((a, b) => b.savedAt - a.savedAt);
}

function emitBookmarksUpdated(address: string): void {
  if (typeof window === 'undefined') return;
  window.dispatchEvent(
    new CustomEvent<{ address: string }>(BOOKMARKS_UPDATED_EVENT, {
      detail: { address: address.toLowerCase() },
    })
  );
}

export function bookmarkStorageKey(address: string): string {
  return `${STORAGE_PREFIX}${address.toLowerCase()}`;
}

export function composeBookmarkId(eventId: string, marketId: string | null): string {
  return `${eventId}:${marketId ?? 'event'}`;
}

export function loadBookmarksForAddress(address: string): BookmarkRecord[] {
  if (typeof window === 'undefined') return [];

  const key = bookmarkStorageKey(address);
  const stored = localStorage.getItem(key);
  if (!stored) return [];

  try {
    return normalizeBookmarks(JSON.parse(stored));
  } catch (error) {
    console.error('Failed to parse bookmarks:', error);
    return [];
  }
}

export function readBookmarksSnapshotForAddress(address: string): BookmarkRecord[] {
  if (typeof window === 'undefined') return EMPTY_BOOKMARKS;

  const key = bookmarkStorageKey(address);
  const raw = localStorage.getItem(key);
  const cached = bookmarkSnapshotCache.get(key);

  if (cached && cached.raw === raw) {
    return cached.parsed;
  }

  if (!raw) {
    bookmarkSnapshotCache.set(key, { raw: null, parsed: EMPTY_BOOKMARKS });
    return EMPTY_BOOKMARKS;
  }

  try {
    const parsed = normalizeBookmarks(JSON.parse(raw));
    bookmarkSnapshotCache.set(key, { raw, parsed });
    return parsed;
  } catch (error) {
    console.error('Failed to parse bookmarks:', error);
    bookmarkSnapshotCache.set(key, { raw, parsed: EMPTY_BOOKMARKS });
    return EMPTY_BOOKMARKS;
  }
}

export function saveBookmarksForAddress(address: string, bookmarks: BookmarkRecord[]): BookmarkRecord[] {
  if (typeof window === 'undefined') return [];

  const normalized = normalizeBookmarks(bookmarks);
  const key = bookmarkStorageKey(address);
  const raw = JSON.stringify(normalized);
  localStorage.setItem(key, raw);
  bookmarkSnapshotCache.set(key, { raw, parsed: normalized });
  emitBookmarksUpdated(address);
  return normalized;
}

export function addBookmarkForAddress(
  address: string,
  input: { event: ParsedEvent; marketId?: string | null; savedAt?: number }
): BookmarkRecord[] {
  const marketId = input.marketId ? String(input.marketId) : null;
  const eventId = String(input.event.id);
  const eventSlug = String(input.event.slug);
  const record: BookmarkRecord = {
    id: composeBookmarkId(eventId, marketId),
    eventId,
    eventSlug,
    marketId,
    savedAt: input.savedAt ?? Date.now(),
    eventSnapshot: input.event,
  };

  const current = loadBookmarksForAddress(address).filter((item) => item.id !== record.id);
  return saveBookmarksForAddress(address, [record, ...current]);
}

export function removeBookmarkForAddress(
  address: string,
  eventId: string,
  marketId: string | null
): BookmarkRecord[] {
  const bookmarkId = composeBookmarkId(eventId, marketId);
  const current = loadBookmarksForAddress(address);
  const filtered = current.filter((item) => item.id !== bookmarkId);
  return saveBookmarksForAddress(address, filtered);
}
