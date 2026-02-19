'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  ArrowDownToLine,
  ArrowUpFromLine,
  ExternalLink,
  Clock,
  ChevronLeft,
  ChevronRight,
  Inbox,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import useTransactionHistory, { Transaction } from '@/hooks/useTransactionHistory';

function truncateAddress(address: string): string {
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
}

function formatDate(timestamp: number): string {
  const date = new Date(timestamp);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;

  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined,
  });
}

function TransactionRow({ tx }: { tx: Transaction }) {
  const isDeposit = tx.direction === 'deposit';

  return (
    <div className="flex items-center justify-between py-3 border-b border-border/30 last:border-b-0">
      <div className="flex items-center gap-3">
        <div
          className={`w-8 h-8 rounded-full flex items-center justify-center ${
            isDeposit
              ? 'bg-success/10 text-success'
              : 'bg-danger/10 text-danger'
          }`}
        >
          {isDeposit ? (
            <ArrowDownToLine className="h-4 w-4" />
          ) : (
            <ArrowUpFromLine className="h-4 w-4" />
          )}
        </div>
        <div>
          <div className="text-sm font-medium">
            {isDeposit ? 'Deposit' : 'Withdrawal'}
          </div>
          <div className="text-xs text-muted-foreground">
            {isDeposit ? 'From ' : 'To '}
            <span className="font-mono">
              {truncateAddress(isDeposit ? tx.from : tx.to)}
            </span>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <div className="text-right">
          <div
            className={`text-sm font-medium ${
              isDeposit ? 'text-success' : 'text-danger'
            }`}
          >
            {isDeposit ? '+' : '-'}${tx.formattedValue}
          </div>
          <div className="flex items-center gap-1 text-xs text-muted-foreground">
            <Clock className="h-3 w-3" />
            {formatDate(tx.timestamp)}
          </div>
        </div>
        <a
          href={`https://polygonscan.com/tx/${tx.hash}`}
          target="_blank"
          rel="noopener noreferrer"
          className="p-1.5 hover:bg-secondary rounded-lg transition-colors text-muted-foreground hover:text-foreground"
          title="View on Polygonscan"
        >
          <ExternalLink className="h-3.5 w-3.5" />
        </a>
      </div>
    </div>
  );
}

export default function TransactionHistory() {
  const [page, setPage] = useState(1);
  const { transactions, total, isLoading, error } = useTransactionHistory(page);

  const hasMore = total >= 25;
  const hasPrev = page > 1;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3 }}
      className="bg-card rounded-2xl border border-border/50 p-6 space-y-4"
    >
      <div className="flex items-center gap-2 text-lg font-semibold">
        <Clock className="h-5 w-5 text-primary" />
        Transaction History
      </div>

      {isLoading && (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="animate-pulse flex items-center justify-between py-3">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-muted" />
                <div className="space-y-1">
                  <div className="h-4 w-20 bg-muted rounded" />
                  <div className="h-3 w-28 bg-muted rounded" />
                </div>
              </div>
              <div className="space-y-1">
                <div className="h-4 w-16 bg-muted rounded ml-auto" />
                <div className="h-3 w-12 bg-muted rounded ml-auto" />
              </div>
            </div>
          ))}
        </div>
      )}

      {!isLoading && error && (
        <div className="text-center py-8 text-sm text-muted-foreground">
          Failed to load transaction history. Please try again later.
        </div>
      )}

      {!isLoading && !error && transactions.length === 0 && (
        <div className="text-center py-8 space-y-2">
          <Inbox className="h-10 w-10 text-muted-foreground/40 mx-auto" />
          <p className="text-sm text-muted-foreground">
            No transactions yet. Deposit USDC to get started.
          </p>
        </div>
      )}

      {!isLoading && !error && transactions.length > 0 && (
        <>
          <div className="divide-y-0">
            {transactions.map((tx) => (
              <TransactionRow key={tx.hash} tx={tx} />
            ))}
          </div>

          {/* Pagination */}
          {(hasMore || hasPrev) && (
            <div className="flex items-center justify-between pt-2">
              <Button
                variant="outline"
                size="sm"
                disabled={!hasPrev}
                onClick={() => setPage((p) => p - 1)}
                className="gap-1"
              >
                <ChevronLeft className="h-4 w-4" />
                Prev
              </Button>
              <span className="text-sm text-muted-foreground">
                Page {page}
              </span>
              <Button
                variant="outline"
                size="sm"
                disabled={!hasMore}
                onClick={() => setPage((p) => p + 1)}
                className="gap-1"
              >
                Next
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          )}
        </>
      )}
    </motion.div>
  );
}
