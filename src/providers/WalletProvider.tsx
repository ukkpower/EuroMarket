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
  const [ethersSigner, setEthersSigner] =
    useState<providers.JsonRpcSigner | null>(null);
  const [walletClient, setWalletClient] = useState<WalletClient | null>(null);
  const [eoaAddress, setEoaAddress] = useState<`0x${string}` | undefined>(
    undefined
  );
  const [email, setEmail] = useState<string | undefined>(undefined);

  useEffect(() => {
    const magic = getMagic();
    if (!magic) return;

    const client = createWalletClient({
      chain: polygon,
      transport: custom(magic.rpcProvider as any),
    });

    const ethersProvider = new providers.Web3Provider(magic.rpcProvider as any);

    setWalletClient(client);
    setEthersSigner(ethersProvider.getSigner());

    magic.user.isLoggedIn().then((isLoggedIn) => {
      if (isLoggedIn) {
        fetchUser();
      }
    });
  }, []);

  const fetchUser = useCallback(async () => {
    const magic = getMagic();
    if (!magic) return;
    const userInfo = await magic.user.getInfo();
    const address = (userInfo as any).wallets?.ethereum?.publicAddress;
    setEoaAddress(address ? (address as `0x${string}`) : undefined);
    setEmail(userInfo.email ?? undefined);
  }, []);

  const connect = useCallback(async () => {
    const magic = getMagic();
    if (!magic) return;
    try {
      await magic.wallet.connectWithUI();
      await fetchUser();
    } catch (error) {
      console.error("Connect error:", error);
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
      magic: getMagic(),
      eoaAddress,
      walletClient,
      ethersSigner,
      publicClient,
      connect,
      disconnect,
      isConnected: !!eoaAddress,
      email,
    }),
    [eoaAddress, walletClient, ethersSigner, connect, disconnect, email]
  );

  return (
    <WalletContext.Provider value={value}>{children}</WalletContext.Provider>
  );
}
