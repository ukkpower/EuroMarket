import { NextRequest, NextResponse } from "next/server";

const GAMMA_API_BASE = "https://gamma-api.polymarket.com";
const CLOB_API_BASE = "https://clob.polymarket.com";

interface RawPosition {
  title?: string;
  market?: string;
  outcome?: string;
  asset?: string;
  size?: string;
  avgPrice?: string;
  curPrice?: string;
  price?: string;
  conditionId?: string;
  proxyWallet?: string;
  cashBalance?: string;
  redeemable?: boolean;
  mergeable?: boolean;
  token?: {
    id?: string;
    token_id?: string;
    outcome?: string;
  };
}

interface MarketInfo {
  conditionId: string;
  closed: boolean;
  active: boolean;
  negRisk?: boolean;
}

export async function GET(request: NextRequest) {
  const address = request.nextUrl.searchParams.get("address");

  if (!address) {
    return NextResponse.json(
      { error: "address parameter is required" },
      { status: 400 }
    );
  }

  try {
    const positionsRes = await fetch(
      `${CLOB_API_BASE}/data/positions?user=${address}`,
      {
        headers: { Accept: "application/json" },
        next: { revalidate: 30 },
      }
    );

    if (!positionsRes.ok) {
      return NextResponse.json({
        totalValue: 0,
        totalPnl: 0,
        positions: [],
        positionCount: 0,
        activePositions: [],
        resolvedPositions: [],
        claimablePositions: [],
      });
    }

    const rawPositions: RawPosition[] = await positionsRes.json();

    if (!Array.isArray(rawPositions) || rawPositions.length === 0) {
      return NextResponse.json({
        totalValue: 0,
        totalPnl: 0,
        positions: [],
        positionCount: 0,
        activePositions: [],
        resolvedPositions: [],
        claimablePositions: [],
      });
    }

    // Collect unique condition IDs to look up market resolution status
    const conditionIds = [
      ...new Set(
        rawPositions
          .map((p) => p.conditionId)
          .filter(Boolean) as string[]
      ),
    ];

    // Batch-fetch market info from Gamma API for resolution status
    const marketInfoMap = new Map<string, MarketInfo>();
    if (conditionIds.length > 0) {
      try {
        const marketsRes = await fetch(
          `${GAMMA_API_BASE}/markets?closed=true&limit=200&condition_ids=${conditionIds.join(",")}`,
          {
            headers: { Accept: "application/json" },
            next: { revalidate: 60 },
          }
        );
        if (marketsRes.ok) {
          const markets = await marketsRes.json();
          if (Array.isArray(markets)) {
            for (const m of markets) {
              if (m.conditionId) {
                marketInfoMap.set(m.conditionId, {
                  conditionId: m.conditionId,
                  closed: !!m.closed,
                  active: !!m.active,
                  negRisk: !!m.negRisk,
                });
              }
            }
          }
        }
      } catch {
        // Non-critical: we just won't have resolution data
      }
    }

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
      tokenId: string;
      negRisk: boolean;
      resolved: boolean;
      redeemable: boolean;
      claimableAmount: number;
    }> = [];

    for (const pos of rawPositions) {
      const size = parseFloat(pos.size || "0");
      const avgPrice = parseFloat(pos.avgPrice || "0");
      const curPrice = parseFloat(pos.curPrice || pos.price || "0");
      const value = size * curPrice;
      const pnl = size * (curPrice - avgPrice);

      if (size <= 0) continue;

      const conditionId = pos.conditionId || "";
      const mktInfo = marketInfoMap.get(conditionId);
      const resolved = mktInfo ? mktInfo.closed : false;
      const negRisk = mktInfo ? !!mktInfo.negRisk : false;

      // A position is redeemable if the market is resolved and the current
      // price is 1 (winning side) and user holds tokens
      const isWinner = resolved && curPrice >= 0.95;
      const claimableAmount = isWinner ? size : 0;

      const tokenId =
        pos.token?.token_id || pos.token?.id || pos.asset || "";

      positions.push({
        market: pos.title || pos.market || "Unknown",
        outcome: pos.outcome || pos.asset || "Unknown",
        size,
        avgPrice,
        currentPrice: curPrice,
        value,
        pnl,
        asset: pos.asset || "",
        conditionId,
        tokenId,
        negRisk,
        resolved,
        redeemable: isWinner,
        claimableAmount,
      });

      totalValue += value;
      totalPnl += pnl;
    }

    const activePositions = positions.filter((p) => !p.resolved);
    const resolvedPositions = positions.filter((p) => p.resolved);
    const claimablePositions = positions.filter((p) => p.redeemable);

    return NextResponse.json({
      totalValue: Math.round(totalValue * 100) / 100,
      totalPnl: Math.round(totalPnl * 100) / 100,
      positions,
      positionCount: positions.length,
      activePositions,
      resolvedPositions,
      claimablePositions,
    });
  } catch (error) {
    console.error("Error fetching positions:", error);
    return NextResponse.json({
      totalValue: 0,
      totalPnl: 0,
      positions: [],
      positionCount: 0,
      activePositions: [],
      resolvedPositions: [],
      claimablePositions: [],
    });
  }
}
