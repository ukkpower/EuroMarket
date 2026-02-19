import { useState, useCallback } from "react";
import { useWallet } from "@/providers/WalletContext";
import { BuilderConfig } from "@polymarket/builder-signing-sdk";
import { RelayClient } from "@polymarket/builder-relayer-client";

import {
  RELAYER_URL,
  REMOTE_SIGNING_URL,
} from "@/constants/api";

const POLYGON_CHAIN_ID = 137;

export default function useRelayClient() {
  const [relayClient, setRelayClient] = useState<RelayClient | null>(null);
  const { ethersSigner, eoaAddress } = useWallet();

  const initializeRelayClient = useCallback(async () => {
    if (!eoaAddress || !ethersSigner) {
      throw new Error("Wallet not connected");
    }

    const builderConfig = new BuilderConfig({
      remoteBuilderConfig: {
        url: REMOTE_SIGNING_URL(),
      },
    });

    const client = new RelayClient(
      RELAYER_URL,
      POLYGON_CHAIN_ID,
      ethersSigner,
      builderConfig
    );

    setRelayClient(client);
    return client;
  }, [eoaAddress, ethersSigner]);

  const clearRelayClient = useCallback(() => {
    setRelayClient(null);
  }, []);

  return {
    relayClient,
    initializeRelayClient,
    clearRelayClient,
  };
}
