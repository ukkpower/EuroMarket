"use client";

import { useState, useCallback } from "react";
import { encodeFunctionData } from "viem";
import { OperationType } from "@polymarket/builder-relayer-client";
import { useQueryClient } from "@tanstack/react-query";
import { useTrading } from "@/providers/TradingProvider";
import {
  USDC_E_CONTRACT_ADDRESS,
  CTF_CONTRACT_ADDRESS,
} from "@/constants/tokens";

const PARENT_COLLECTION_ID =
  "0x0000000000000000000000000000000000000000000000000000000000000000" as const;

const INDEX_SETS = [1, 2];

const ctfRedeemAbi = [
  {
    inputs: [
      { name: "collateralToken", type: "address" },
      { name: "parentCollectionId", type: "bytes32" },
      { name: "conditionId", type: "bytes32" },
      { name: "indexSets", type: "uint256[]" },
    ],
    name: "redeemPositions",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
] as const;

export interface RedeemResult {
  success: boolean;
  txHash?: string;
  error?: string;
}

export default function useRedeemPosition() {
  const { relayClient } = useTrading();
  const queryClient = useQueryClient();
  const [isRedeeming, setIsRedeeming] = useState(false);
  const [redeemError, setRedeemError] = useState<string | null>(null);
  const [lastTxHash, setLastTxHash] = useState<string | null>(null);

  const redeem = useCallback(
    async (conditionId: string): Promise<RedeemResult> => {
      setRedeemError(null);
      setLastTxHash(null);

      if (!conditionId) {
        const error = "Condition ID is required";
        setRedeemError(error);
        return { success: false, error };
      }

      if (!relayClient) {
        const error =
          "Trading session not initialized. Please initialize your trading session first.";
        setRedeemError(error);
        return { success: false, error };
      }

      setIsRedeeming(true);

      try {
        const redeemData = encodeFunctionData({
          abi: ctfRedeemAbi,
          functionName: "redeemPositions",
          args: [
            USDC_E_CONTRACT_ADDRESS as `0x${string}`,
            PARENT_COLLECTION_ID,
            conditionId as `0x${string}`,
            INDEX_SETS.map((s) => BigInt(s)),
          ],
        });

        const safeTx = {
          to: CTF_CONTRACT_ADDRESS as string,
          operation: OperationType.Call,
          data: redeemData,
          value: "0",
        };

        const response = await relayClient.execute(
          [safeTx],
          `Redeem winning position for condition ${conditionId.slice(0, 10)}...`
        );

        const receipt = await response.wait();
        const txHash =
          receipt?.transactionHash || response.transactionHash || "";

        setLastTxHash(txHash);
        setIsRedeeming(false);

        queryClient.invalidateQueries({ queryKey: ["portfolio-value"] });
        queryClient.invalidateQueries({ queryKey: ["usdc-balance"] });

        return { success: true, txHash };
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : "Redemption failed";
        setRedeemError(errorMessage);
        setIsRedeeming(false);
        return { success: false, error: errorMessage };
      }
    },
    [relayClient, queryClient]
  );

  const reset = useCallback(() => {
    setRedeemError(null);
    setLastTxHash(null);
    setIsRedeeming(false);
  }, []);

  return {
    redeem,
    isRedeeming,
    redeemError,
    lastTxHash,
    reset,
  };
}
