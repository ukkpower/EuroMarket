import { useMemo } from "react";
import { useWallet } from "@/providers/WalletContext";
import { ClobClient } from "@polymarket/clob-client";
import useSafeDeployment from "@/hooks/useSafeDeployment";
import { BuilderConfig } from "@polymarket/builder-signing-sdk";

import { TradingSession } from "@/utils/session";
import {
  CLOB_API_URL,
  REMOTE_SIGNING_URL,
} from "@/constants/api";

const POLYGON_CHAIN_ID = 137;

export default function useClobClient(
  tradingSession: TradingSession | null,
  isTradingSessionComplete: boolean | undefined
) {
  const { eoaAddress, ethersSigner } = useWallet();
  const { derivedSafeAddressFromEoa } = useSafeDeployment(eoaAddress);

  const clobClient = useMemo(() => {
    if (
      !ethersSigner ||
      !eoaAddress ||
      !derivedSafeAddressFromEoa ||
      !isTradingSessionComplete ||
      !tradingSession?.apiCredentials
    ) {
      return null;
    }

    const builderConfig = new BuilderConfig({
      remoteBuilderConfig: {
        url: REMOTE_SIGNING_URL(),
      },
    });

    return new ClobClient(
      CLOB_API_URL,
      POLYGON_CHAIN_ID,
      ethersSigner,
      tradingSession.apiCredentials,
      2, // signatureType = 2 for embedded wallet EOA to sign for Safe proxy wallet
      derivedSafeAddressFromEoa,
      undefined, // mandatory placeholder
      false,
      builderConfig // Builder order attribution
    );
  }, [
    eoaAddress,
    ethersSigner,
    derivedSafeAddressFromEoa,
    isTradingSessionComplete,
    tradingSession?.apiCredentials,
  ]);

  return { clobClient };
}
