const SEARCH_HISTORY_KEY = 'euromarket_search_history_v1';
const MAX_HISTORY_ENTRIES = 8;

function normalizeQuery(query: string): string {
  return query.trim();
}

function sanitizeHistory(raw: unknown): string[] {
  if (!Array.isArray(raw)) return [];

  return raw
    .filter((item): item is string => typeof item === 'string')
    .map(normalizeQuery)
    .filter(Boolean)
    .slice(0, MAX_HISTORY_ENTRIES);
}

export function loadSearchHistory(): string[] {
  if (typeof window === 'undefined') return [];

  const stored = localStorage.getItem(SEARCH_HISTORY_KEY);
  if (!stored) return [];

  try {
    return sanitizeHistory(JSON.parse(stored));
  } catch (error) {
    console.error('Failed to parse search history:', error);
    return [];
  }
}

export function addSearchHistory(query: string): string[] {
  if (typeof window === 'undefined') return [];

  const trimmed = normalizeQuery(query);
  if (!trimmed) return loadSearchHistory();

  const existing = loadSearchHistory();
  const deduped = existing.filter(
    (item) => item.toLowerCase() !== trimmed.toLowerCase()
  );

  const updated = [trimmed, ...deduped].slice(0, MAX_HISTORY_ENTRIES);
  localStorage.setItem(SEARCH_HISTORY_KEY, JSON.stringify(updated));

  return updated;
}

export function clearSearchHistory(): void {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(SEARCH_HISTORY_KEY);
}
