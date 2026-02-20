"use client";

import { useQuery } from "@tanstack/react-query";
import { useWallet } from "@/providers/WalletContext";
import { useTrading } from "@/providers/TradingProvider";
import {
  USDC_E_CONTRACT_ADDRESS,
  USDC_E_DECIMALS,
} from "@/constants/tokens";

const ERC20_BALANCE_ABI = [
  {
    inputs: [{ name: "account", type: "address" }],
    name: "balanceOf",
    outputs: [{ name: "", type: "uint256" }],
    stateMutability: "view",
    type: "function",
  },
] as const;

export default function useUsdcBalance() {
  const { publicClient } = useWallet();
  const { safeAddress } = useTrading();

  const {
    data: balance,
    isLoading,
    isFetching,
    error,
    refetch,
  } = useQuery({
    queryKey: ["usdc-balance", safeAddress],
    queryFn: async () => {
      if (!publicClient || !safeAddress) return null;

      const raw = await publicClient.readContract({
        address: USDC_E_CONTRACT_ADDRESS,
        abi: ERC20_BALANCE_ABI,
        functionName: "balanceOf",
        args: [safeAddress as `0x${string}`],
      });

      const value = Number(raw) / 10 ** USDC_E_DECIMALS;
      return {
        raw: raw.toString(),
        formatted: value.toFixed(2),
        value,
      };
    },
    enabled: !!publicClient && !!safeAddress,
    refetchInterval: 15_000,
    staleTime: 5_000,
    retry: 3,
    retryDelay: (attempt) => Math.min(1_000 * 2 ** attempt, 10_000),
  });

  return {
    balance: balance ?? { raw: "0", formatted: "0.00", value: 0 },
    isLoading,
    isFetching,
    error,
    refetch,
  };
}
