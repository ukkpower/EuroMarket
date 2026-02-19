import { Magic } from "magic-sdk";
import { polygon } from "viem/chains";
import { POLYGON_RPC_URL } from "@/constants/api";

let magicInstance: Magic | null = null;

export default function getMagic(): Magic {
  if (!magicInstance && typeof window !== "undefined") {
    magicInstance = new Magic(process.env.NEXT_PUBLIC_MAGIC_API_KEY!, {
      network: { rpcUrl: POLYGON_RPC_URL, chainId: polygon.id },
    });
  }
  return magicInstance!;
}
