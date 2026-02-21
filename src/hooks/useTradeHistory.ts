"use client";

import { useQuery } from "@tanstack/react-query";
import { useTrading } from "@/providers/TradingProvider";
import type { Trade } from "@/types/trading";

export default function useTradeHistory() {
  const { clobClient, isTradingSessionComplete } = useTrading();

  const {
    data: trades,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ["trade-history"],
    queryFn: async (): Promise<Trade[]> => {
      if (!clobClient) return [];

      try {
        const rawTrades = await clobClient.getTrades(
          {},
          true
        );

        if (!Array.isArray(rawTrades)) return [];

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        return rawTrades.map((trade: any) => ({
          id: String(trade.id ?? ""),
          market: String(trade.market ?? ""),
          assetId: String(trade.asset_id ?? ""),
          side: (trade.side === "SELL" ? "SELL" : "BUY") as "BUY" | "SELL",
          price: String(trade.price ?? "0"),
          size: String(trade.size ?? "0"),
          outcome: String(trade.outcome ?? ""),
          timestamp: Number(trade.match_time ?? trade.created_at ?? 0),
          feeRateBps: String(trade.fee_rate_bps ?? "0"),
          status: String(trade.status ?? ""),
          matchOrderId: String(trade.match_order_id ?? ""),
          takerOrderId: String(trade.taker_order_id ?? ""),
          transactionHash: String(trade.transaction_hash ?? ""),
        }));
      } catch (err) {
        console.error("Failed to fetch trade history:", err);
        return [];
      }
    },
    enabled: !!clobClient && !!isTradingSessionComplete,
    refetchInterval: 30_000,
    staleTime: 15_000,
  });

  return {
    trades: trades ?? [],
    isLoading,
    error,
    refetch,
  };
}
