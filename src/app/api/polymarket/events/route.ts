import { NextRequest, NextResponse } from 'next/server';
import type { PolymarketEvent } from '@/types/market';

const GAMMA_API_BASE = 'https://gamma-api.polymarket.com';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const tagId = searchParams.get('tag_id');
  const limit = searchParams.get('limit') || '50';
  const offset = searchParams.get('offset') || '0';
  const search = searchParams.get('search');

  try {
    // Build the Polymarket API URL
    const url = new URL(`${GAMMA_API_BASE}/events`);
    url.searchParams.set('closed', 'false');
    url.searchParams.set('active', 'true');
    url.searchParams.set('limit', limit);
    url.searchParams.set('offset', offset);
    url.searchParams.set('order', 'volume');
    url.searchParams.set('ascending', 'false');

    if (tagId) {
      url.searchParams.set('tag_id', tagId);
    }

    // Note: Polymarket doesn't have a direct search param for events,
    // we'll filter on our end if search is provided
    
    const response = await fetch(url.toString(), {
      headers: {
        'Accept': 'application/json',
      },
      next: {
        revalidate: 60, // Cache for 60 seconds
      },
    });

    if (!response.ok) {
      throw new Error(`Polymarket API error: ${response.status}`);
    }

    let events: PolymarketEvent[] = await response.json();

    // Client-side search filter if search query provided
    if (search && search.trim()) {
      const searchLower = search.toLowerCase();
      events = events.filter((event) =>
        event.title.toLowerCase().includes(searchLower) ||
        event.description?.toLowerCase().includes(searchLower)
      );
    }

    return NextResponse.json(events);
  } catch (error) {
    console.error('Error fetching Polymarket events:', error);
    return NextResponse.json(
      { error: 'Failed to fetch events' },
      { status: 500 }
    );
  }
}
