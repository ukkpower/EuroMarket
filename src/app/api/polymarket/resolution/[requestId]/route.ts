import { NextRequest, NextResponse } from 'next/server';

const POLYMARKET_RESOLUTION_API_BASE = 'https://data-api.polymarket.com/subgraph/resolution';

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ requestId: string }> }
) {
  const { requestId } = await params;

  if (!requestId) {
    return NextResponse.json(
      { error: 'Resolution request id is required' },
      { status: 400 }
    );
  }

  try {
    const url = `${POLYMARKET_RESOLUTION_API_BASE}/${encodeURIComponent(requestId)}`;
    const response = await fetch(url, {
      headers: {
        Accept: 'application/json',
      },
      next: {
        revalidate: 30,
      },
    });

    if (!response.ok) {
      throw new Error(`Resolution API error: ${response.status}`);
    }

    const payload = await response.json();
    return NextResponse.json(payload);
  } catch (error) {
    console.error('Error fetching Polymarket resolution data:', error);
    return NextResponse.json(
      { error: 'Failed to fetch resolution data' },
      { status: 500 }
    );
  }
}
