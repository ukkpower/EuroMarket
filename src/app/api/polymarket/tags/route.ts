import { NextResponse } from 'next/server';
import type { PolymarketTag } from '@/types/market';

const GAMMA_API_BASE = 'https://gamma-api.polymarket.com';

export async function GET() {
  try {
    const response = await fetch(`${GAMMA_API_BASE}/tags`, {
      headers: {
        'Accept': 'application/json',
      },
      next: {
        revalidate: 300, // Cache for 5 minutes (tags don't change often)
      },
    });

    if (!response.ok) {
      throw new Error(`Polymarket API error: ${response.status}`);
    }

    const tags: PolymarketTag[] = await response.json();

    // Filter to only show tags that are marked as forceShow or have significant usage
    // We'll return all for now and let the UI decide what to display
    return NextResponse.json(tags);
  } catch (error) {
    console.error('Error fetching Polymarket tags:', error);
    return NextResponse.json(
      { error: 'Failed to fetch tags' },
      { status: 500 }
    );
  }
}
