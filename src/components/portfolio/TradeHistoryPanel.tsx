'use client';

import { motion } from 'framer-motion';
import {
  History,
  ArrowUpRight,
  ArrowDownLeft,
  ExternalLink,
} from 'lucide-react';
import useTradeHistory from '@/hooks/useTradeHistory';
import type { Trade } from '@/types/trading';
import { cn } from '@/lib/utils';

function formatDate(timestamp: number): string {
  if (!timestamp) return '--';
  const d = new Date(
    timestamp > 1e12 ? timestamp : timestamp * 1000
  );
  return d.toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

function TradeCard({ trade }: { trade: Trade }) {
  const price = parseFloat(trade.price) || 0;
  const size = parseFloat(trade.size) || 0;
  const total = price * size;
  const isBuy = trade.side === 'BUY';

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-card rounded-xl border border-border/50 p-4"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <div
            className={cn(
              'w-8 h-8 rounded-lg flex items-center justify-center shrink-0',
              isBuy ? 'bg-success/10' : 'bg-danger/10'
            )}
          >
            {isBuy ? (
              <ArrowDownLeft className="h-4 w-4 text-success" />
            ) : (
              <ArrowUpRight className="h-4 w-4 text-danger" />
            )}
          </div>
          <div>
            <p className="text-sm font-medium">
              {isBuy ? 'Bought' : 'Sold'}{' '}
              <span
                className={cn(
                  trade.outcome === 'YES' ? 'text-success' : 'text-danger'
                )}
              >
                {trade.outcome || '--'}
              </span>
            </p>
            <p className="text-xs text-muted-foreground">
              {trade.market
                ? `${trade.market.slice(0, 10)}...${trade.market.slice(-6)}`
                : 'Unknown Market'}
            </p>
          </div>
        </div>

        {trade.transactionHash && (
          <a
            href={`https://polygonscan.com/tx/${trade.transactionHash}`}
            target="_blank"
            rel="noopener noreferrer"
            className="p-1.5 hover:bg-secondary rounded-lg transition-colors text-muted-foreground hover:text-foreground shrink-0"
            title="View on Polygonscan"
          >
            <ExternalLink className="h-3.5 w-3.5" />
          </a>
        )}
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-3">
        <div>
          <p className="text-xs text-muted-foreground">Price</p>
          <p className="text-sm font-semibold">
            {(price * 100).toFixed(1)}¢
          </p>
        </div>
        <div>
          <p className="text-xs text-muted-foreground">Shares</p>
          <p className="text-sm font-semibold">{size.toFixed(2)}</p>
        </div>
        <div>
          <p className="text-xs text-muted-foreground">Total</p>
          <p className="text-sm font-semibold">${total.toFixed(2)}</p>
        </div>
        <div>
          <p className="text-xs text-muted-foreground">Date</p>
          <p className="text-sm font-semibold">
            {formatDate(trade.timestamp)}
          </p>
        </div>
      </div>
    </motion.div>
  );
}

export default function TradeHistoryPanel() {
  const { trades, isLoading } = useTradeHistory();

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            className="h-28 bg-card rounded-xl border border-border/50 animate-pulse"
          />
        ))}
      </div>
    );
  }

  if (trades.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col items-center justify-center py-16 text-center"
      >
        <div className="w-14 h-14 rounded-2xl bg-muted flex items-center justify-center mb-4">
          <History className="h-7 w-7 text-muted-foreground" />
        </div>
        <h3 className="text-lg font-semibold mb-1">No Trade History</h3>
        <p className="text-sm text-muted-foreground max-w-xs">
          Your completed trades will appear here once you start trading on any
          market.
        </p>
      </motion.div>
    );
  }

  return (
    <div className="space-y-4">
      <p className="text-sm text-muted-foreground">
        {trades.length} trade{trades.length !== 1 ? 's' : ''}
      </p>

      <div className="space-y-3">
        {trades.map((trade, i) => (
          <TradeCard key={trade.id || `trade-${i}`} trade={trade} />
        ))}
      </div>
    </div>
  );
}
