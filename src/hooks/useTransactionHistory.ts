"use client";

import { useQuery } from "@tanstack/react-query";
import { useTrading } from "@/providers/TradingProvider";

export interface Transaction {
  hash: string;
  from: string;
  to: string;
  value: string;
  formattedValue: string;
  timestamp: number;
  direction: "deposit" | "withdraw";
  blockNumber: string;
}

interface TransactionResponse {
  transactions: Transaction[];
  total: number;
}

export default function useTransactionHistory(page: number = 1) {
  const { safeAddress } = useTrading();

  const {
    data,
    isLoading,
    error,
    refetch,
  } = useQuery<TransactionResponse>({
    queryKey: ["transaction-history", safeAddress, page],
    queryFn: async () => {
      if (!safeAddress) {
        return { transactions: [], total: 0 };
      }

      const res = await fetch(
        `/api/polygonscan/transactions?address=${safeAddress}&page=${page}&offset=25`
      );

      if (!res.ok) {
        throw new Error("Failed to fetch transaction history");
      }

      return res.json();
    },
    enabled: !!safeAddress,
    refetchInterval: 60_000,
    staleTime: 30_000,
  });

  return {
    transactions: data?.transactions ?? [],
    total: data?.total ?? 0,
    isLoading,
    error,
    refetch,
    page,
  };
}
