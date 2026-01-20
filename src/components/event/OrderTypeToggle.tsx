'use client';

import { motion } from 'framer-motion';
import type { OrderType } from '@/types/market';
import { cn } from '@/lib/utils';

type OrderTypeToggleProps = {
  orderType: OrderType;
  onChangeOrderType: (type: OrderType) => void;
};

export function OrderTypeToggle({ orderType, onChangeOrderType }: OrderTypeToggleProps) {
  return (
    <div className="space-y-2">
      <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
        Order Type
      </label>
      
      <div className="relative flex rounded-xl bg-secondary p-1">
        {/* Sliding indicator */}
        <motion.div
          className="absolute top-1 bottom-1 rounded-lg bg-card shadow-sm"
          layoutId="order-type-indicator"
          initial={false}
          animate={{
            left: orderType === 'market' ? '4px' : '50%',
            width: 'calc(50% - 4px)',
          }}
          transition={{ type: 'spring', stiffness: 500, damping: 35 }}
        />

        {/* Market Button */}
        <button
          onClick={() => onChangeOrderType('market')}
          className={cn(
            'relative z-10 flex-1 py-2.5 text-sm font-medium rounded-lg transition-colors',
            orderType === 'market' ? 'text-foreground' : 'text-muted-foreground'
          )}
        >
          Market
        </button>

        {/* Limit Button */}
        <button
          onClick={() => onChangeOrderType('limit')}
          className={cn(
            'relative z-10 flex-1 py-2.5 text-sm font-medium rounded-lg transition-colors',
            orderType === 'limit' ? 'text-foreground' : 'text-muted-foreground'
          )}
        >
          Limit
        </button>
      </div>
    </div>
  );
}
