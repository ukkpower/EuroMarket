"use client";

import { ReactNode, useEffect, useMemo, useState, useCallback } from "react";
import {
  createPublicClient,
  createWalletClient,
  custom,
  fallback,
  http,
  WalletClient,
} from "viem";
import getMagic from "@/lib/magic";
import { providers } from "ethers";
import { polygon } from "viem/chains";
import { WalletContext, WalletContextType } from "./WalletContext";
import { POLYGON_RPC_URL } from "@/constants/api";

// Use multiple public RPC endpoints with automatic fallback so a single
// provider outage or rate-limit doesn't silently break balance fetching.
const FALLBACK_RPC_URLS = [
  POLYGON_RPC_URL,
  "https://polygon-bor-rpc.publicnode.com",
  "https://rpc-mainnet.matic.quiknode.pro",
  "https://polygon.meowrpc.com",
];

const publicClient = createPublicClient({
  chain: polygon,
  transport: fallback(
    FALLBACK_RPC_URLS.map((url) => http(url, { timeout: 8_000 }))
  ),
});

export function WalletProvider({ children }: { children: ReactNode }) {
  const [eoaAddress, setEoaAddress] = useState<`0x${string}` | undefined>(
    undefined
  );
  const [email, setEmail] = useState<string | undefined>(undefined);
  const magic = useMemo(() => getMagic(), []);
  const rpcProvider = useMemo(
    () => (magic ? (magic.rpcProvider as providers.ExternalProvider) : null),
    [magic]
  );
  const walletClient = useMemo<WalletClient | null>(() => {
    if (!rpcProvider) return null;

    return createWalletClient({
      chain: polygon,
      transport: custom(rpcProvider),
    });
  }, [rpcProvider]);
  const ethersSigner = useMemo<providers.JsonRpcSigner | null>(() => {
    if (!rpcProvider) return null;
    return new providers.Web3Provider(rpcProvider).getSigner();
  }, [rpcProvider]);

  const fetchUser = useCallback(async (): Promise<`0x${string}` | null> => {
    const magic = getMagic();
    if (!magic) return null;

    type MagicUserInfo = {
      email?: string | null;
      wallets?: {
        ethereum?: {
          publicAddress?: string;
        };
      };
    };

    const userInfo = (await magic.user.getInfo()) as MagicUserInfo;
    const address = userInfo.wallets?.ethereum?.publicAddress;
    const normalizedAddress = address ? (address as `0x${string}`) : undefined;
    setEoaAddress(normalizedAddress);
    setEmail(userInfo.email ?? undefined);
    return normalizedAddress ?? null;
  }, []);

  useEffect(() => {
    if (!magic) return;
    let cancelled = false;

    magic.user.isLoggedIn().then((isLoggedIn) => {
      if (!cancelled && isLoggedIn) {
        fetchUser();
      }
    });
    return () => {
      cancelled = true;
    };
  }, [fetchUser, magic]);

  const connect = useCallback(async (): Promise<`0x${string}` | null> => {
    const magic = getMagic();
    if (!magic) return null;
    try {
      await magic.wallet.connectWithUI();
      return await fetchUser();
    } catch (error) {
      console.error("Connect error:", error);
      return null;
    }
  }, [fetchUser]);

  const disconnect = useCallback(async () => {
    const magic = getMagic();
    if (!magic) return;
    try {
      await magic.user.logout();
      setEoaAddress(undefined);
      setEmail(undefined);
    } catch (error) {
      console.error("Disconnect error:", error);
    }
  }, []);

  const value = useMemo<WalletContextType>(
    () => ({
      magic,
      eoaAddress,
      walletClient,
      ethersSigner,
      publicClient,
      connect,
      disconnect,
      isConnected: !!eoaAddress,
      email,
    }),
    [magic, eoaAddress, walletClient, ethersSigner, connect, disconnect, email]
  );

  return (
    <WalletContext.Provider value={value}>{children}</WalletContext.Provider>
  );
}
