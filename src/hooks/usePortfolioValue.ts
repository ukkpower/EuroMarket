"use client";

import { useQuery } from "@tanstack/react-query";
import { useTrading } from "@/providers/TradingProvider";

export interface Position {
  market: string;
  outcome: string;
  size: number;
  avgPrice: number;
  currentPrice: number;
  value: number;
  pnl: number;
  asset: string;
  conditionId: string;
}

export interface PortfolioData {
  totalValue: number;
  totalPnl: number;
  positions: Position[];
  positionCount: number;
}

export default function usePortfolioValue() {
  const { safeAddress, clobClient } = useTrading();

  const {
    data: portfolio,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ["portfolio-value", safeAddress],
    queryFn: async (): Promise<PortfolioData> => {
      if (!safeAddress) {
        return { totalValue: 0, totalPnl: 0, positions: [], positionCount: 0 };
      }

      try {
        const res = await fetch(
          `/api/polymarket/positions?address=${safeAddress}`
        );

        if (!res.ok) {
          return { totalValue: 0, totalPnl: 0, positions: [], positionCount: 0 };
        }

        const data = await res.json();
        return data as PortfolioData;
      } catch {
        return { totalValue: 0, totalPnl: 0, positions: [], positionCount: 0 };
      }
    },
    enabled: !!safeAddress,
    refetchInterval: 60_000,
    staleTime: 30_000,
  });

  return {
    portfolio: portfolio ?? {
      totalValue: 0,
      totalPnl: 0,
      positions: [],
      positionCount: 0,
    },
    isLoading,
    error,
    refetch,
  };
}
