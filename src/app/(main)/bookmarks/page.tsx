'use client';

import { motion } from 'framer-motion';
import { Bookmark, LogIn } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { SingleMarketCard } from '@/components/SingleMarketCard';
import { MultiMarketCard } from '@/components/MultiMarketCard';
import { useWallet } from '@/providers/WalletContext';
import { useBookmarks } from '@/hooks/useBookmarks';
import { shouldUseSingleStyleCard } from '@/lib/sportsCardMeta';

export default function BookmarksPage() {
  const { t } = useTranslation();
  const { isConnected, connect } = useWallet();
  const { bookmarks } = useBookmarks();

  if (!isConnected) {
    return (
      <div className="flex-1 flex items-center justify-center p-4 lg:p-6">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-md rounded-2xl border border-border/50 bg-card p-8 text-center"
        >
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10">
            <Bookmark className="h-7 w-7 text-primary" />
          </div>
          <h1 className="mb-2 text-xl font-semibold">{t('bookmarks.loginTitle')}</h1>
          <p className="mb-6 text-sm text-muted-foreground">{t('bookmarks.loginHint')}</p>
          <Button onClick={connect} className="gap-2">
            <LogIn className="h-4 w-4" />
            {t('bookmarks.loginCta')}
          </Button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="flex-1 p-4 lg:p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">{t('bookmarks.title')}</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          {t('bookmarks.count', { count: bookmarks.length })}
        </p>
      </div>

      {bookmarks.length === 0 ? (
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col items-center justify-center rounded-2xl border border-border/50 bg-card py-20 text-center"
        >
          <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-secondary">
            <Bookmark className="h-7 w-7 text-muted-foreground" />
          </div>
          <h2 className="mb-2 text-lg font-semibold">{t('bookmarks.emptyTitle')}</h2>
          <p className="max-w-md text-sm text-muted-foreground">{t('bookmarks.emptyHint')}</p>
        </motion.div>
      ) : (
        <motion.div
          layout
          className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3"
          transition={{ layout: { duration: 0.2 } }}
        >
          {bookmarks.map((bookmark) =>
            shouldUseSingleStyleCard(bookmark.eventSnapshot) ? (
              <SingleMarketCard
                key={bookmark.id}
                event={bookmark.eventSnapshot}
                preferredMarketId={bookmark.marketId}
              />
            ) : (
              <MultiMarketCard
                key={bookmark.id}
                event={bookmark.eventSnapshot}
                preferredMarketId={bookmark.marketId}
              />
            )
          )}
        </motion.div>
      )}
    </div>
  );
}
