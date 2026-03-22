import { NextRequest, NextResponse } from 'next/server';
import type { PolymarketTag } from '@/types/market';

const GAMMA_API_BASE = 'https://gamma-api.polymarket.com';

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;

  if (!slug) {
    return NextResponse.json({ error: 'Slug required' }, { status: 400 });
  }

  try {
    const url = `${GAMMA_API_BASE}/tags/slug/${encodeURIComponent(slug)}/related-tags/tags`;
    const response = await fetch(url, {
      headers: { Accept: 'application/json' },
      next: { revalidate: 60 },
    });

    if (!response.ok) {
      if (response.status === 404) {
        return NextResponse.json([]);
      }
      throw new Error(`Polymarket API error: ${response.status}`);
    }

    const tags: PolymarketTag[] = await response.json();
    return NextResponse.json(tags);
  } catch (error) {
    console.error('Error fetching related tags:', error);
    return NextResponse.json(
      { error: 'Failed to fetch related tags' },
      { status: 500 }
    );
  }
}
