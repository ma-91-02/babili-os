import { NextRequest, NextResponse } from 'next/server';

const GATEWAY_URL = process.env.API_GATEWAY_URL || 'http://localhost:4000';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const sessionToken = request.cookies.get('session_token')?.value;

    const res = await fetch(`${GATEWAY_URL}/api/v1/orders`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(sessionToken ? { Authorization: `Bearer ${sessionToken}` } : {}),
      },
      body: JSON.stringify(body),
      signal: AbortSignal.timeout(5000),
    });

    const data = await res.json();
    return NextResponse.json(data, { status: res.status });
  } catch {
    return NextResponse.json(
      { success: false, error: 'Order service unavailable' },
      { status: 503 },
    );
  }
}
