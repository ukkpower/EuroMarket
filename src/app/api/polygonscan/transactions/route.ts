import { NextRequest, NextResponse } from "next/server";

const POLYGONSCAN_API_BASE = "https://api.polygonscan.com/api";
const USDC_E_ADDRESS = "0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174";

export interface PolygonscanTokenTx {
  blockNumber: string;
  timeStamp: string;
  hash: string;
  from: string;
  to: string;
  value: string;
  tokenName: string;
  tokenSymbol: string;
  tokenDecimal: string;
  contractAddress: string;
}

export interface FormattedTransaction {
  hash: string;
  from: string;
  to: string;
  value: string;
  formattedValue: string;
  timestamp: number;
  direction: "deposit" | "withdraw";
  blockNumber: string;
}

export async function GET(request: NextRequest) {
  const address = request.nextUrl.searchParams.get("address");
  const page = request.nextUrl.searchParams.get("page") || "1";
  const offset = request.nextUrl.searchParams.get("offset") || "25";

  if (!address) {
    return NextResponse.json(
      { error: "address parameter is required" },
      { status: 400 }
    );
  }

  const apiKey = process.env.POLYGONSCAN_API_KEY;

  try {
    const url = new URL(POLYGONSCAN_API_BASE);
    url.searchParams.set("module", "account");
    url.searchParams.set("action", "tokentx");
    url.searchParams.set("contractaddress", USDC_E_ADDRESS);
    url.searchParams.set("address", address);
    url.searchParams.set("page", page);
    url.searchParams.set("offset", offset);
    url.searchParams.set("sort", "desc");

    if (apiKey) {
      url.searchParams.set("apikey", apiKey);
    }

    const response = await fetch(url.toString(), {
      next: { revalidate: 30 },
    });

    if (!response.ok) {
      throw new Error(`Polygonscan API error: ${response.status}`);
    }

    const data = await response.json();

    if (data.status !== "1" || !Array.isArray(data.result)) {
      // status "0" with "No transactions found" is not an error
      if (data.message === "No transactions found") {
        return NextResponse.json({ transactions: [], total: 0 });
      }
      return NextResponse.json({ transactions: [], total: 0 });
    }

    const lowerAddress = address.toLowerCase();

    const transactions: FormattedTransaction[] = data.result.map(
      (tx: PolygonscanTokenTx) => {
        const decimals = parseInt(tx.tokenDecimal) || 6;
        const rawValue = BigInt(tx.value);
        const formattedValue = (
          Number(rawValue) / Math.pow(10, decimals)
        ).toFixed(2);

        return {
          hash: tx.hash,
          from: tx.from,
          to: tx.to,
          value: tx.value,
          formattedValue,
          timestamp: parseInt(tx.timeStamp) * 1000,
          direction:
            tx.to.toLowerCase() === lowerAddress ? "deposit" : "withdraw",
          blockNumber: tx.blockNumber,
        };
      }
    );

    return NextResponse.json({
      transactions,
      total: transactions.length,
    });
  } catch (error) {
    console.error("Error fetching Polygonscan transactions:", error);
    return NextResponse.json(
      { error: "Failed to fetch transactions" },
      { status: 500 }
    );
  }
}
