'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  ClipboardList,
  X,
  XCircle,
  Loader2,
  AlertCircle,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import useOpenOrders from '@/hooks/useOpenOrders';
import useClobOrder from '@/hooks/useClobOrder';
import { useTrading } from '@/providers/TradingProvider';
import type { OpenOrder } from '@/types/trading';
import { cn } from '@/lib/utils';

function formatSize(rawSize: string): string {
  const num = parseFloat(rawSize);
  if (isNaN(num)) return '0';
  const shares = num / 1_000_000;
  return shares.toFixed(2);
}

function formatDate(timestamp: number): string {
  if (!timestamp) return '--';
  const d = new Date(timestamp * 1000);
  return d.toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

function filledPercent(order: OpenOrder): number {
  const original = parseFloat(order.originalSize);
  const matched = parseFloat(order.sizeMatched);
  if (!original || isNaN(original) || isNaN(matched)) return 0;
  return Math.round((matched / original) * 100);
}

function OrderCard({
  order,
  onCancel,
  isCancelling,
}: {
  order: OpenOrder;
  onCancel: (id: string) => void;
  isCancelling: boolean;
}) {
  const filled = filledPercent(order);

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      className="bg-card rounded-xl border border-border/50 p-4"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium truncate">
            {order.market
              ? `${order.market.slice(0, 10)}...${order.market.slice(-6)}`
              : 'Unknown Market'}
          </p>
          <div className="flex items-center gap-2 mt-1 flex-wrap">
            <span
              className={cn(
                'text-xs font-semibold px-2 py-0.5 rounded-full',
                order.side === 'BUY'
                  ? 'bg-success/10 text-success'
                  : 'bg-danger/10 text-danger'
              )}
            >
              {order.side}
            </span>
            <span
              className={cn(
                'text-xs font-semibold px-2 py-0.5 rounded-full',
                order.outcome === 'YES'
                  ? 'bg-success/10 text-success'
                  : 'bg-danger/10 text-danger'
              )}
            >
              {order.outcome || '--'}
            </span>
            <span className="text-xs text-muted-foreground px-2 py-0.5 rounded-full bg-secondary">
              {order.orderType}
            </span>
          </div>
        </div>

        <Button
          variant="outline"
          size="sm"
          onClick={() => onCancel(order.id)}
          disabled={isCancelling}
          className="gap-1 shrink-0 text-danger border-danger/20 hover:bg-danger/10 hover:text-danger"
        >
          {isCancelling ? (
            <Loader2 className="h-3.5 w-3.5 animate-spin" />
          ) : (
            <X className="h-3.5 w-3.5" />
          )}
          Cancel
        </Button>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-3">
        <div>
          <p className="text-xs text-muted-foreground">Price</p>
          <p className="text-sm font-semibold">
            {(parseFloat(order.price) * 100).toFixed(1)}¢
          </p>
        </div>
        <div>
          <p className="text-xs text-muted-foreground">Size</p>
          <p className="text-sm font-semibold">
            {formatSize(order.originalSize)}
          </p>
        </div>
        <div>
          <p className="text-xs text-muted-foreground">Filled</p>
          <div className="flex items-center gap-1.5">
            <div className="flex-1 h-1.5 bg-secondary rounded-full overflow-hidden">
              <div
                className="h-full bg-primary rounded-full transition-all"
                style={{ width: `${filled}%` }}
              />
            </div>
            <span className="text-xs font-medium">{filled}%</span>
          </div>
        </div>
        <div>
          <p className="text-xs text-muted-foreground">Created</p>
          <p className="text-sm font-semibold">
            {formatDate(order.createdAt)}
          </p>
        </div>
      </div>
    </motion.div>
  );
}

export default function OpenOrdersPanel() {
  const { orders, isLoading, refetch } = useOpenOrders();
  const { clobClient, safeAddress } = useTrading();
  const { cancelOrder, cancelAllOrders, isSubmitting, error } = useClobOrder(
    clobClient,
    safeAddress
  );
  const [cancellingId, setCancellingId] = useState<string | null>(null);

  const handleCancel = async (orderId: string) => {
    setCancellingId(orderId);
    try {
      await cancelOrder(orderId);
      refetch();
    } catch {
      // error is set in the hook
    }
    setCancellingId(null);
  };

  const handleCancelAll = async () => {
    setCancellingId('all');
    try {
      await cancelAllOrders();
      refetch();
    } catch {
      // error is set in the hook
    }
    setCancellingId(null);
  };

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

  if (orders.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col items-center justify-center py-16 text-center"
      >
        <div className="w-14 h-14 rounded-2xl bg-muted flex items-center justify-center mb-4">
          <ClipboardList className="h-7 w-7 text-muted-foreground" />
        </div>
        <h3 className="text-lg font-semibold mb-1">No Open Orders</h3>
        <p className="text-sm text-muted-foreground max-w-xs">
          Your pending limit orders will appear here. Place a limit order on
          any market to get started.
        </p>
      </motion.div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header with cancel all */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          {orders.length} open order{orders.length !== 1 ? 's' : ''}
        </p>
        {orders.length > 1 && (
          <Button
            variant="outline"
            size="sm"
            onClick={handleCancelAll}
            disabled={isSubmitting}
            className="gap-1 text-danger border-danger/20 hover:bg-danger/10 hover:text-danger"
          >
            {cancellingId === 'all' ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
            ) : (
              <XCircle className="h-3.5 w-3.5" />
            )}
            Cancel All
          </Button>
        )}
      </div>

      {error && (
        <div className="bg-danger/5 border border-danger/20 rounded-xl p-3 flex items-center gap-2">
          <AlertCircle className="h-4 w-4 text-danger shrink-0" />
          <p className="text-sm text-danger">{error.message}</p>
        </div>
      )}

      {/* Orders list */}
      <div className="space-y-3">
        {orders.map((order) => (
          <OrderCard
            key={order.id}
            order={order}
            onCancel={handleCancel}
            isCancelling={
              isSubmitting && cancellingId === order.id
            }
          />
        ))}
      </div>
    </div>
  );
}
