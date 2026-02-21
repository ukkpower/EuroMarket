"use client";

import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useTrading } from "@/providers/TradingProvider";
import type { OpenOrder } from "@/types/trading";

export default function useOpenOrders() {
  const { clobClient, isTradingSessionComplete } = useTrading();
  const queryClient = useQueryClient();

  const {
    data: orders,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ["open-orders"],
    queryFn: async (): Promise<OpenOrder[]> => {
      if (!clobClient) return [];

      try {
        const rawOrders = await clobClient.getOpenOrders(
          {},
          true
        );

        if (!Array.isArray(rawOrders)) return [];

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        return rawOrders.map((order: any) => ({
          id: String(order.id ?? ""),
          status: String(order.status ?? ""),
          market: String(order.market ?? ""),
          assetId: String(order.asset_id ?? ""),
          side: (order.side === "SELL" ? "SELL" : "BUY") as "BUY" | "SELL",
          price: String(order.price ?? "0"),
          originalSize: String(order.original_size ?? "0"),
          sizeMatched: String(order.size_matched ?? "0"),
          outcome: String(order.outcome ?? ""),
          orderType: String(order.order_type ?? "GTC"),
          expiration: String(order.expiration ?? "0"),
          createdAt: Number(order.created_at ?? 0),
          associateTrades: Array.isArray(order.associate_trades)
            ? order.associate_trades
            : [],
        }));
      } catch (err) {
        console.error("Failed to fetch open orders:", err);
        return [];
      }
    },
    enabled: !!clobClient && !!isTradingSessionComplete,
    refetchInterval: 15_000,
    staleTime: 10_000,
  });

  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: ["open-orders"] });
  };

  return {
    orders: orders ?? [],
    isLoading,
    error,
    refetch,
    invalidate,
  };
}
