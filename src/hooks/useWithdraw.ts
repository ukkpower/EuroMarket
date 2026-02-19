"use client";

import { useState, useCallback } from "react";
import { encodeFunctionData, erc20Abi, isAddress } from "viem";
import { OperationType } from "@polymarket/builder-relayer-client";
import { useTrading } from "@/providers/TradingProvider";
import { USDC_E_CONTRACT_ADDRESS, USDC_E_DECIMALS } from "@/constants/tokens";

export interface WithdrawResult {
  success: boolean;
  txHash?: string;
  error?: string;
}

export default function useWithdraw() {
  const { relayClient } = useTrading();
  const [isWithdrawing, setIsWithdrawing] = useState(false);
  const [withdrawError, setWithdrawError] = useState<string | null>(null);
  const [lastTxHash, setLastTxHash] = useState<string | null>(null);

  const withdraw = useCallback(
    async (
      toAddress: string,
      amount: number
    ): Promise<WithdrawResult> => {
      setWithdrawError(null);
      setLastTxHash(null);

      // Validate inputs
      if (!isAddress(toAddress)) {
        const error = "Invalid destination address";
        setWithdrawError(error);
        return { success: false, error };
      }

      if (amount <= 0) {
        const error = "Amount must be greater than 0";
        setWithdrawError(error);
        return { success: false, error };
      }

      if (!relayClient) {
        const error = "Trading session not initialized. Please initialize your trading session first.";
        setWithdrawError(error);
        return { success: false, error };
      }

      setIsWithdrawing(true);

      try {
        // Convert amount to raw USDC units (6 decimals)
        const rawAmount = BigInt(
          Math.floor(amount * 10 ** USDC_E_DECIMALS)
        );

        // Encode the ERC20 transfer call
        const transferData = encodeFunctionData({
          abi: erc20Abi,
          functionName: "transfer",
          args: [toAddress as `0x${string}`, rawAmount],
        });

        // Create Safe transaction for the withdrawal
        const safeTx = {
          to: USDC_E_CONTRACT_ADDRESS as string,
          operation: OperationType.Call,
          data: transferData,
          value: "0",
        };

        // Execute via relay client
        const response = await relayClient.execute(
          [safeTx],
          `Withdraw ${amount} USDC.e to ${toAddress}`
        );

        // Wait for confirmation
        const receipt = await response.wait();
        const txHash = receipt?.transactionHash || response.transactionHash || "";

        setLastTxHash(txHash);
        setIsWithdrawing(false);

        return { success: true, txHash };
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : "Withdrawal failed";
        setWithdrawError(errorMessage);
        setIsWithdrawing(false);
        return { success: false, error: errorMessage };
      }
    },
    [relayClient]
  );

  const reset = useCallback(() => {
    setWithdrawError(null);
    setLastTxHash(null);
    setIsWithdrawing(false);
  }, []);

  return {
    withdraw,
    isWithdrawing,
    withdrawError,
    lastTxHash,
    reset,
  };
}
