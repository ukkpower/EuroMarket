import { useCallback, useMemo } from "react";
import {
  RelayClient,
  RelayerTransactionState,
} from "@polymarket/builder-relayer-client";
import { useWallet } from "@/providers/WalletContext";
import { deriveSafe } from "@polymarket/builder-relayer-client/dist/builder/derive";
import { getContractConfig } from "@polymarket/builder-relayer-client/dist/config";

const POLYGON_CHAIN_ID = 137;

export default function useSafeDeployment(eoaAddress?: string) {
  const { publicClient } = useWallet();

  const derivedSafeAddressFromEoa = useMemo(() => {
    if (!eoaAddress || !publicClient || !POLYGON_CHAIN_ID) return undefined;

    try {
      const config = getContractConfig(POLYGON_CHAIN_ID);
      return deriveSafe(eoaAddress, config.SafeContracts.SafeFactory);
    } catch (error) {
      console.error("Error deriving Safe address:", error);
      return undefined;
    }
  }, [eoaAddress, publicClient]);

  const isSafeDeployed = useCallback(
    async (relayClient: RelayClient, safeAddr: string): Promise<boolean> => {
      try {
        const deployed = await (relayClient as any).getDeployed(safeAddr);
        return deployed;
      } catch (err) {
        console.warn("API check failed, falling back to RPC", err);

        const code = await publicClient?.getCode({
          address: safeAddr as `0x${string}`,
        });
        return !!code && code !== "0x";
      }
    },
    [publicClient]
  );

  const deploySafe = useCallback(
    async (relayClient: RelayClient): Promise<string> => {
      try {
        const response = await relayClient.deploy();

        const result = await relayClient.pollUntilState(
          response.transactionID,
          [
            RelayerTransactionState.STATE_MINED,
            RelayerTransactionState.STATE_CONFIRMED,
            RelayerTransactionState.STATE_FAILED,
          ],
          "60",
          3000
        );

        if (!result) {
          throw new Error("Safe deployment failed");
        }

        return result.proxyAddress;
      } catch (err) {
        const error =
          err instanceof Error ? err : new Error("Failed to deploy Safe");
        throw error;
      }
    },
    []
  );

  return {
    derivedSafeAddressFromEoa,
    isSafeDeployed,
    deploySafe,
  };
}
