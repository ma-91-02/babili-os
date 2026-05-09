import { NextRequest, NextResponse } from 'next/server';

const GATEWAY_URL = process.env.API_GATEWAY_URL || 'http://localhost:4000';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ restaurantId: string }> },
) {
  const { restaurantId } = await params;
  if (!restaurantId) {
    return NextResponse.json(
      { success: false, error: 'restaurantId is required' },
      { status: 400 },
    );
  }

  try {
    const sessionToken = request.cookies.get('session_token')?.value;
    const res = await fetch(`${GATEWAY_URL}/api/v1/restaurants/${restaurantId}/sections`, {
      headers: {
        ...(sessionToken ? { Authorization: `Bearer ${sessionToken}` } : {}),
      },
      signal: AbortSignal.timeout(5000),
    });
    if (!res.ok) {
      const body = await res.json().catch(() => ({}));
      return NextResponse.json(body, { status: res.status });
    }
    const data = await res.json();
    return NextResponse.json(data);
  } catch {
    return NextResponse.json(
      { success: false, error: 'Restaurant service unavailable' },
      { status: 503 },
    );
  }
}
