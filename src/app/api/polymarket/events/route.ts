import { NextRequest, NextResponse } from 'next/server';
import type { PolymarketEvent } from '@/types/market';

const GAMMA_API_BASE = 'https://gamma-api.polymarket.com';
const ALLOWED_EVENT_ORDER_FIELDS = new Set([
  'volume',
  'volume24hr',
  'createdAt',
  'liquidity',
  'openInterest',
  'updatedAt',
]);

function parseBooleanParam(value: string | null): boolean | null {
  if (!value) return null;
  const normalized = value.toLowerCase();
  if (normalized === 'true') return true;
  if (normalized === 'false') return false;
  return null;
}

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const tagId = searchParams.get('tag_id');
  const limit = searchParams.get('limit') || '50';
  const offset = searchParams.get('offset') || '0';
  const excludeTagIds = searchParams.getAll('exclude_tag_id');
  const requestedOrder = searchParams.get('order');
  const requestedAscending = parseBooleanParam(searchParams.get('ascending'));
  const requestedFeatured = parseBooleanParam(searchParams.get('featured'));
  const requestedActive = parseBooleanParam(searchParams.get('active'));
  const requestedClosed = parseBooleanParam(searchParams.get('closed'));
  const order =
    requestedOrder && ALLOWED_EVENT_ORDER_FIELDS.has(requestedOrder)
      ? requestedOrder
      : 'volume';
  const ascending = requestedAscending ?? false;
  const active = requestedActive ?? true;
  const closed = requestedClosed ?? false;

  try {
    // Build the Polymarket API URL
    const url = new URL(`${GAMMA_API_BASE}/events`);
    url.searchParams.set('closed', String(closed));
    url.searchParams.set('active', String(active));
    url.searchParams.set('limit', limit);
    url.searchParams.set('offset', offset);
    url.searchParams.set('order', order);
    url.searchParams.set('ascending', String(ascending));

    if (tagId) {
      url.searchParams.set('tag_id', tagId);
    }

    if (requestedFeatured !== null) {
      url.searchParams.set('featured', String(requestedFeatured));
    }

    if (excludeTagIds && excludeTagIds.length > 0) {
      for (const id of excludeTagIds) {
        if (id) {
          url.searchParams.append('exclude_tag_id', id);
        }
      }
    }

    const response = await fetch(url.toString(), {
      headers: {
        Accept: 'application/json',
      },
      // Avoid Next.js Data Cache size limits (>2MB responses for some tags).
      cache: 'no-store',
    });

    if (!response.ok) {
      throw new Error(`Polymarket API error: ${response.status}`);
    }

    const events: PolymarketEvent[] = await response.json();

    return NextResponse.json(events);
  } catch (error) {
    console.error('Error fetching Polymarket events:', error);
    return NextResponse.json(
      { error: 'Failed to fetch events' },
      { status: 500 }
    );
  }
}
