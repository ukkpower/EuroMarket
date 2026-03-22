'use client';

import { useCallback, useMemo, useSyncExternalStore } from 'react';
import { useWallet } from '@/providers/WalletContext';
import type { BookmarkRecord } from '@/types/bookmark';
import type { ParsedEvent } from '@/types/market';
import {
  BOOKMARKS_UPDATED_EVENT,
  addBookmarkForAddress,
  bookmarkStorageKey,
  composeBookmarkId,
  loadBookmarksForAddress,
  readBookmarksSnapshotForAddress,
  removeBookmarkForAddress,
} from '@/utils/bookmarks';

type ToggleBookmarkInput = {
  event: ParsedEvent;
  marketId?: string | null;
};
const EMPTY_BOOKMARKS: BookmarkRecord[] = [];

export function useBookmarks() {
  const { eoaAddress, connect } = useWallet();
  const normalizedAddress = useMemo(() => eoaAddress?.toLowerCase() ?? null, [eoaAddress]);

  const subscribe = useCallback(
    (onStoreChange: () => void) => {
      if (typeof window === 'undefined') return () => {};

      const onBookmarksUpdated = (event: Event) => {
        if (!normalizedAddress) return;
        const detailAddress = (event as CustomEvent<{ address?: string }>).detail?.address?.toLowerCase();
        if (!detailAddress || detailAddress === normalizedAddress) {
          onStoreChange();
        }
      };

      const onStorage = (event: StorageEvent) => {
        if (!normalizedAddress) return;
        if (event.key === bookmarkStorageKey(normalizedAddress)) {
          onStoreChange();
        }
      };

      window.addEventListener(BOOKMARKS_UPDATED_EVENT, onBookmarksUpdated);
      window.addEventListener('storage', onStorage);
      return () => {
        window.removeEventListener(BOOKMARKS_UPDATED_EVENT, onBookmarksUpdated);
        window.removeEventListener('storage', onStorage);
      };
    },
    [normalizedAddress]
  );

  const getSnapshot = useCallback((): BookmarkRecord[] => {
    if (!normalizedAddress) return EMPTY_BOOKMARKS;
    return readBookmarksSnapshotForAddress(normalizedAddress);
  }, [normalizedAddress]);

  const getServerSnapshot = useCallback((): BookmarkRecord[] => EMPTY_BOOKMARKS, []);

  const bookmarks = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

  const isBookmarked = useCallback(
    (eventId: string, marketId: string | null = null): boolean => {
      const bookmarkId = composeBookmarkId(eventId, marketId);
      return bookmarks.some((item) => item.id === bookmarkId);
    },
    [bookmarks]
  );

  const removeBookmark = useCallback(
    (eventId: string, marketId: string | null = null): BookmarkRecord[] => {
      if (!normalizedAddress) return bookmarks;
      return removeBookmarkForAddress(normalizedAddress, eventId, marketId);
    },
    [bookmarks, normalizedAddress]
  );

  const toggleBookmark = useCallback(
    async ({ event, marketId = null }: ToggleBookmarkInput): Promise<boolean> => {
      let address = normalizedAddress;

      if (!address) {
        const connectedAddress = await connect();
        if (!connectedAddress) return false;
        address = connectedAddress.toLowerCase();
      }

      const bookmarkId = composeBookmarkId(event.id, marketId);
      const current = loadBookmarksForAddress(address);
      const currentlySaved = current.some((item) => item.id === bookmarkId);

      if (currentlySaved) {
        removeBookmarkForAddress(address, event.id, marketId);
      } else {
        addBookmarkForAddress(address, { event, marketId });
      }

      return !currentlySaved;
    },
    [connect, normalizedAddress]
  );

  return {
    bookmarks,
    isBookmarked,
    toggleBookmark,
    removeBookmark,
  };
}
