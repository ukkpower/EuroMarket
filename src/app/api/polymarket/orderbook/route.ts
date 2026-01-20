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

  if (!marketId) {
    return NextResponse.json(
      { error: 'marketId is required' },
      { status: 400 }
    );
  }

  try {
    // Fetch order books for both Yes (index 0) and No (index 1) outcomes
    const [yesTokenId, noTokenId] = await Promise.all([
      getTokenIdFromMarket(marketId, 0),
      getTokenIdFromMarket(marketId, 1),
    ]);

    console.log(`Order book request for market ${marketId}:`, { yesTokenId, noTokenId });

    if (!yesTokenId || !noTokenId) {
      return NextResponse.json(
        { 
          error: 'Unable to determine token IDs for this market. The market may not be CLOB-enabled.',
          details: `Yes token: ${yesTokenId || 'not found'}, No token: ${noTokenId || 'not found'}`,
        },
        { status: 400 }
      );
    }

    // Fetch order books from CLOB API for both outcomes
    const [yesResponse, noResponse] = await Promise.all([
      fetch(`${CLOB_API_BASE}/book?token_id=${yesTokenId}`, {
        headers: {
          'Accept': 'application/json',
        },
        next: {
          revalidate: 5, // Cache for 5 seconds (order books change frequently)
        },
      }),
      fetch(`${CLOB_API_BASE}/book?token_id=${noTokenId}`, {
        headers: {
          'Accept': 'application/json',
        },
        next: {
          revalidate: 5, // Cache for 5 seconds
        },
      }),
    ]);

    // Check responses and handle errors
    if (!yesResponse.ok) {
      let errorText = '';
      try {
        errorText = await yesResponse.text();
      } catch (e) {
        errorText = `Unable to read error response: ${yesResponse.status}`;
      }
      console.error(`CLOB API error for Yes token (${yesTokenId}):`, errorText, `Status: ${yesResponse.status}`);
      return NextResponse.json(
        { 
          error: `Failed to fetch order book from CLOB API`,
          details: `Yes token error: ${errorText}`,
          status: yesResponse.status
        },
        { status: yesResponse.status >= 400 && yesResponse.status < 500 ? yesResponse.status : 500 }
      );
    }

    if (!noResponse.ok) {
      let errorText = '';
      try {
        errorText = await noResponse.text();
      } catch (e) {
        errorText = `Unable to read error response: ${noResponse.status}`;
      }
      console.error(`CLOB API error for No token (${noTokenId}):`, errorText, `Status: ${noResponse.status}`);
      return NextResponse.json(
        { 
          error: `Failed to fetch order book from CLOB API`,
          details: `No token error: ${errorText}`,
          status: noResponse.status
        },
        { status: noResponse.status >= 400 && noResponse.status < 500 ? noResponse.status : 500 }
      );
    }

    // Parse JSON responses
    let yesData, noData;
    try {
      yesData = await yesResponse.json();
      noData = await noResponse.json();
    } catch (parseError) {
      console.error('Error parsing CLOB API response:', parseError);
      // Try to get text responses for debugging
      try {
        const yesClone = yesResponse.clone();
        const noClone = noResponse.clone();
        const yesText = await yesClone.text().catch(() => 'Unable to read response');
        const noText = await noClone.text().catch(() => 'Unable to read response');
        console.error('Yes response (first 500 chars):', yesText.substring(0, 500));
        console.error('No response (first 500 chars):', noText.substring(0, 500));
      } catch (e) {
        console.error('Could not read response bodies for debugging');
      }
      return NextResponse.json(
        { 
          error: 'Failed to parse order book response from CLOB API',
          details: parseError instanceof Error ? parseError.message : 'Unknown parsing error'
        },
        { status: 500 }
      );
    }

    // Transform the CLOB API response to our format
    // CLOB API returns: { bids: [{price: string, size: string}, ...], asks: [{price: string, size: string}, ...] }
    const transformOrderBook = (data: any) => {
      // Handle both formats: array of objects or array of arrays
      const parseBids = (bids: any[]) => {
        if (!bids || bids.length === 0) return [];
        
        // Check if it's array of arrays format: [[price, size], ...]
        if (Array.isArray(bids[0]) && bids[0].length === 2) {
          return bids.map(([price, size]: [string, string]) => ({
            price: parseFloat(price),
            size: parseFloat(size),
          }));
        }
        
        // Otherwise it's array of objects format: [{price: string, size: string}, ...]
        return bids.map((item: any) => ({
          price: parseFloat(item.price || item[0] || '0'),
          size: parseFloat(item.size || item[1] || '0'),
        }));
      };

      const parseAsks = (asks: any[]) => {
        if (!asks || asks.length === 0) return [];
        
        // Check if it's array of arrays format: [[price, size], ...]
        if (Array.isArray(asks[0]) && asks[0].length === 2) {
          return asks.map(([price, size]: [string, string]) => ({
            price: parseFloat(price),
            size: parseFloat(size),
          }));
        }
        
        // Otherwise it's array of objects format: [{price: string, size: string}, ...]
        return asks.map((item: any) => ({
          price: parseFloat(item.price || item[0] || '0'),
          size: parseFloat(item.size || item[1] || '0'),
        }));
      };

      const bids = parseBids(data.bids || []).sort((a, b) => b.price - a.price); // Sort bids descending (highest first)
      const asks = parseAsks(data.asks || []).sort((a, b) => a.price - b.price); // Sort asks ascending (lowest first)

      const bestBid = bids[0]?.price || 0;
      const bestAsk = asks[0]?.price || 0;
      const spread = bestAsk - bestBid;

      return {
        bids,
        asks,
        bestBid,
        bestAsk,
        spread,
      };
    };

    return NextResponse.json({
      yes: transformOrderBook(yesData),
      no: transformOrderBook(noData),
    });
  } catch (error) {
    console.error('Error fetching order book:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    const errorStack = error instanceof Error ? error.stack : undefined;
    console.error('Error stack:', errorStack);
    return NextResponse.json(
      { 
        error: 'Failed to fetch order book',
        details: errorMessage,
        stack: process.env.NODE_ENV === 'development' ? errorStack : undefined
      },
      { status: 500 }
    );
  }
}
