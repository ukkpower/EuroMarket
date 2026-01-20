import { NextRequest, NextResponse } from 'next/server';
import type { PolymarketEvent } from '@/types/market';

const GAMMA_API_BASE = 'https://gamma-api.polymarket.com';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;

  if (!slug) {
    return NextResponse.json(
      { error: 'Event slug is required' },
      { status: 400 }
    );
  }

  try {
    // Fetch event by slug from Polymarket API
    const url = new URL(`${GAMMA_API_BASE}/events`);
    url.searchParams.set('slug', slug);

    const response = await fetch(url.toString(), {
      headers: {
        'Accept': 'application/json',
      },
      next: {
        revalidate: 30, // Cache for 30 seconds
      },
    });

    if (!response.ok) {
      throw new Error(`Polymarket API error: ${response.status}`);
    }

    const events: PolymarketEvent[] = await response.json();

    // The API returns an array, we want the first match
    if (!events || events.length === 0) {
      return NextResponse.json(
        { error: 'Event not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(events[0]);
  } catch (error) {
    console.error('Error fetching Polymarket event:', error);
    return NextResponse.json(
      { error: 'Failed to fetch event' },
      { status: 500 }
    );
  }
}
