import { NextRequest, NextResponse } from 'next/server';

const CLOB_API_BASE = 'https://clob.polymarket.com';
const GAMMA_API_BASE = 'https://gamma-api.polymarket.com';

/**
 * Get token ID from market data using Gamma API
 * The Gamma API markets endpoint includes clobTokenIds array
 */
async function getTokenIdFromMarket(
  marketId: string,
  outcomeIndex: number
): Promise<string | null> {
  try {
    // Try different query parameter formats for the Gamma API
    // The API might use 'id', 'market', or return all markets
    const url = new URL(`${GAMMA_API_BASE}/markets`);
    url.searchParams.set('id', marketId);

    const response = await fetch(url.toString(), {
      headers: { 'Accept': 'application/json' },
      next: { revalidate: 300 }, // Cache for 5 minutes
    });

    if (!response.ok) {
      // Try alternative: fetch all markets and filter
      const altUrl = new URL(`${GAMMA_API_BASE}/markets`);
      const altResponse = await fetch(altUrl.toString(), {
        headers: { 'Accept': 'application/json' },
        next: { revalidate: 300 },
      });

      if (!altResponse.ok) {
        return null;
      }

      const allMarkets = await altResponse.json();
      const market = Array.isArray(allMarkets)
        ? allMarkets.find((m: any) => m.id === marketId)
        : null;

      if (market?.clobTokenIds) {
        let clobTokenIds: string[] = [];
        
        // Parse if it's a JSON string
        if (typeof market.clobTokenIds === 'string') {
          try {
            clobTokenIds = JSON.parse(market.clobTokenIds);
          } catch (e) {
            console.error('Error parsing clobTokenIds:', e);
          }
        } else if (Array.isArray(market.clobTokenIds)) {
          clobTokenIds = market.clobTokenIds;
        }
        
        if (clobTokenIds.length > outcomeIndex) {
          const tokenId = clobTokenIds[outcomeIndex];
          if (tokenId) {
            return tokenId;
          }
        }
      }

      return null;
    }

    const markets = await response.json();
    const market = Array.isArray(markets) ? markets[0] : markets;

    // The Gamma API includes clobTokenIds as a JSON string
    // clobTokenIds[0] = Yes token, clobTokenIds[1] = No token
    if (market?.clobTokenIds) {
      let clobTokenIds: string[] = [];
      
      // Parse if it's a JSON string
      if (typeof market.clobTokenIds === 'string') {
        try {
          clobTokenIds = JSON.parse(market.clobTokenIds);
        } catch (e) {
          console.error('Error parsing clobTokenIds:', e);
        }
      } else if (Array.isArray(market.clobTokenIds)) {
        clobTokenIds = market.clobTokenIds;
      }
      
      if (clobTokenIds.length > outcomeIndex) {
        const tokenId = clobTokenIds[outcomeIndex];
        if (tokenId) {
          return tokenId;
        }
      }
    }

    // Also check for alternative field names
    if (market?.tokens && Array.isArray(market.tokens)) {
      const token = market.tokens[outcomeIndex];
      if (token?.tokenId) {
        return token.tokenId;
      }
    }

    return null;
  } catch (error) {
    console.error('Error fetching token ID from market:', error);
    return null;
  }
}

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const marketId = searchParams.get('marketId');
  const outcome = searchParams.get('outcome') || 'yes'; // 'yes' or 'no'
  const interval = searchParams.get('interval') || '1h';

  // Valid intervals according to Polymarket API
  const validIntervals = ['1h', '6h', '1d', '1w', '1m', 'max'];

  if (!marketId) {
    return NextResponse.json(
      { error: 'marketId is required' },
      { status: 400 }
    );
  }

  if (!validIntervals.includes(interval)) {
    return NextResponse.json(
      { error: `Invalid interval. Must be one of: ${validIntervals.join(', ')}` },
      { status: 400 }
    );
  }

  try {
    // Determine outcome index: 0 for Yes, 1 for No
    const outcomeIndex = outcome === 'yes' ? 0 : 1;

    // Get token ID from market data
    const tokenId = await getTokenIdFromMarket(marketId, outcomeIndex);

    if (!tokenId) {
      return NextResponse.json(
        { 
          error: 'Unable to determine token ID for this market. The market may not be CLOB-enabled.',
        },
        { status: 400 }
      );
    }

    // Fetch price history from CLOB API
    const url = new URL(`${CLOB_API_BASE}/prices-history`);
    url.searchParams.set('market', tokenId);
    url.searchParams.set('interval', interval);
    
    // Add fidelity parameter for intervals that require it
    // Minimum fidelity: 1w = 5 minutes, 1m = 10 minutes
    if (interval === '1w') {
      url.searchParams.set('fidelity', '5');
    } else if (interval === '1m') {
      url.searchParams.set('fidelity', '10');
    }

    const response = await fetch(url.toString(), {
      headers: {
        'Accept': 'application/json',
      },
      next: {
        revalidate: 60, // Cache for 60 seconds
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`CLOB API error (${response.status}):`, errorText);
      return NextResponse.json(
        { 
          error: `Failed to fetch price history from CLOB API`,
          details: response.status === 400 ? 'Invalid request parameters' : 'CLOB API error',
          status: response.status
        },
        { status: response.status }
      );
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error fetching price history:', error);
    return NextResponse.json(
      { 
        error: 'Failed to fetch price history',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
