import { NextRequest, NextResponse } from "next/server";

const GAMMA_API_BASE = "https://gamma-api.polymarket.com";
const CLOB_API_BASE = "https://clob.polymarket.com";

export async function GET(request: NextRequest) {
  const address = request.nextUrl.searchParams.get("address");

  if (!address) {
    return NextResponse.json(
      { error: "address parameter is required" },
      { status: 400 }
    );
  }

  try {
    // Fetch user positions from the CLOB API
    const positionsRes = await fetch(
      `${CLOB_API_BASE}/data/positions?user=${address}`,
      {
        headers: { Accept: "application/json" },
        next: { revalidate: 30 },
      }
    );

    if (!positionsRes.ok) {
      // Fallback: return empty portfolio if API fails
      return NextResponse.json({
        totalValue: 0,
        totalPnl: 0,
        positions: [],
        positionCount: 0,
      });
    }

    const rawPositions = await positionsRes.json();

    // Parse positions into our format
    let totalValue = 0;
    let totalPnl = 0;
    const positions: Array<{
      market: string;
      outcome: string;
      size: number;
      avgPrice: number;
      currentPrice: number;
      value: number;
      pnl: number;
      asset: string;
      conditionId: string;
    }> = [];

    if (Array.isArray(rawPositions)) {
      for (const pos of rawPositions) {
        const size = parseFloat(pos.size || "0");
        const avgPrice = parseFloat(pos.avgPrice || "0");
        const curPrice = parseFloat(pos.curPrice || pos.price || "0");
        const value = size * curPrice;
        const pnl = size * (curPrice - avgPrice);

        if (size > 0) {
          positions.push({
            market: pos.title || pos.market || "Unknown",
            outcome: pos.outcome || pos.asset || "Unknown",
            size,
            avgPrice,
            currentPrice: curPrice,
            value,
            pnl,
            asset: pos.asset || "",
            conditionId: pos.conditionId || "",
          });

          totalValue += value;
          totalPnl += pnl;
        }
      }
    }

    return NextResponse.json({
      totalValue: Math.round(totalValue * 100) / 100,
      totalPnl: Math.round(totalPnl * 100) / 100,
      positions,
      positionCount: positions.length,
    });
  } catch (error) {
    console.error("Error fetching positions:", error);
    return NextResponse.json({
      totalValue: 0,
      totalPnl: 0,
      positions: [],
      positionCount: 0,
    });
  }
}
