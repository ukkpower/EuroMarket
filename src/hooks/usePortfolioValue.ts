"use client";

import { useQuery } from "@tanstack/react-query";
import { useTrading } from "@/providers/TradingProvider";
import type { EnhancedPortfolioData, EnhancedPosition } from "@/types/trading";

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

const EMPTY_PORTFOLIO: EnhancedPortfolioData = {
  totalValue: 0,
  totalPnl: 0,
  positions: [],
  positionCount: 0,
  activePositions: [],
  resolvedPositions: [],
  claimablePositions: [],
};

export default function usePortfolioValue() {
  const { safeAddress } = useTrading();

  const {
    data: portfolio,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ["portfolio-value", safeAddress],
    queryFn: async (): Promise<EnhancedPortfolioData> => {
      if (!safeAddress) return EMPTY_PORTFOLIO;

      try {
        const res = await fetch(
          `/api/polymarket/positions?address=${safeAddress}`
        );

        if (!res.ok) return EMPTY_PORTFOLIO;

        const data = await res.json();

        return {
          totalValue: data.totalValue ?? 0,
          totalPnl: data.totalPnl ?? 0,
          positions: (data.positions ?? []) as EnhancedPosition[],
          positionCount: data.positionCount ?? 0,
          activePositions: (data.activePositions ?? []) as EnhancedPosition[],
          resolvedPositions: (data.resolvedPositions ?? []) as EnhancedPosition[],
          claimablePositions: (data.claimablePositions ?? []) as EnhancedPosition[],
        };
      } catch {
        return EMPTY_PORTFOLIO;
      }
    },
    enabled: !!safeAddress,
    refetchInterval: 60_000,
    staleTime: 30_000,
  });

  return {
    portfolio: portfolio ?? EMPTY_PORTFOLIO,
    isLoading,
    error,
    refetch,
  };
}
