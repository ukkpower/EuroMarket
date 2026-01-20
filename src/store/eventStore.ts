'use client';

import { create } from 'zustand';
import type { EventPageStore, TradeOutcome, TradeSide, OrderType } from '@/types/market';

export const useEventStore = create<EventPageStore>((set) => ({
  selectedMarketId: null,
  tradeSide: 'buy',
  selectedOutcome: 'yes',
  orderType: 'market',
  limitPrice: null,
  amount: '',

  setSelectedMarket: (id: string | null) => 
    set({ selectedMarketId: id }),

  setTradeSide: (side: TradeSide) =>
    set({ tradeSide: side }),

  setSelectedOutcome: (outcome: TradeOutcome) => 
    set({ selectedOutcome: outcome }),

  setOrderType: (type: OrderType) => 
    set({ orderType: type, limitPrice: type === 'market' ? null : null }),

  setLimitPrice: (price: number | null) => 
    set({ limitPrice: price }),

  setAmount: (amount: string) => 
    set({ amount }),

  resetTradeForm: () => 
    set({
      tradeSide: 'buy',
      selectedOutcome: 'yes',
      orderType: 'market',
      limitPrice: null,
      amount: '',
    }),
}));

// Helper to calculate trade estimates
export function calculateTradeEstimate(
  amount: string,
  price: number,
  outcome: TradeOutcome
): { shares: number; cost: number; payout: number } {
  const amountNum = parseFloat(amount) || 0;
  
  if (amountNum <= 0 || price <= 0) {
    return { shares: 0, cost: 0, payout: 0 };
  }

  // Calculate shares: amount / price
  const shares = amountNum / price;
  const cost = amountNum;
  // If the outcome resolves to true, payout is 1 share = $1
  const payout = shares;

  return {
    shares: Math.round(shares * 100) / 100,
    cost: Math.round(cost * 100) / 100,
    payout: Math.round(payout * 100) / 100,
  };
}
