import { NextRequest, NextResponse } from 'next/server';
import type { PolymarketEvent } from '@/types/market';

const GAMMA_API_BASE = 'https://gamma-api.polymarket.com';
const DEFAULT_LIMIT = 50;
const MAX_LIMIT = 100;

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const query = searchParams.get('q')?.trim();
  const limitParam = searchParams.get('limit');

  if (!query) {
    return NextResponse.json(
      { error: 'Query parameter "q" is required' },
      { status: 400 }
    );
  }

  let limit = DEFAULT_LIMIT;
  if (limitParam) {
    const parsedLimit = Number.parseInt(limitParam, 10);
    if (Number.isFinite(parsedLimit) && parsedLimit > 0) {
      limit = Math.min(parsedLimit, MAX_LIMIT);
    }
  }

  try {
    const url = new URL(`${GAMMA_API_BASE}/public-search`);
    url.searchParams.set('q', query);
    url.searchParams.set('limit_per_type', String(limit));
    url.searchParams.set('search_tags', 'false');
    url.searchParams.set('search_profiles', 'false');
    url.searchParams.set('optimized', 'false');

    const response = await fetch(url.toString(), {
      headers: {
        Accept: 'application/json',
      },
      cache: 'no-store',
    });

    if (!response.ok) {
      throw new Error(`Polymarket API error: ${response.status}`);
    }

    const data = await response.json() as { events?: PolymarketEvent[] };
    const events = Array.isArray(data.events) ? data.events : [];

    return NextResponse.json(events);
  } catch (error) {
    console.error('Error searching Polymarket events:', error);
    return NextResponse.json(
      { error: 'Failed to search events' },
      { status: 500 }
    );
  }
}
