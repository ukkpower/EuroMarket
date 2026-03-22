import type { ParsedEvent } from '@/types/market';

export type BookmarkRecord = {
  id: string;
  eventId: string;
  eventSlug: string;
  marketId: string | null;
  savedAt: number;
  eventSnapshot: ParsedEvent;
};
