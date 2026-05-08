import { NextRequest, NextResponse } from 'next/server';

const GATEWAY_URL = process.env.API_GATEWAY_URL || 'http://localhost:4000';

export async function GET(request: NextRequest) {
  try {
    const token = request.cookies.get('session_token')?.value;

    if (!token) {
      return NextResponse.json({ user: null }, { status: 401 });
    }

    const res = await fetch(`${GATEWAY_URL}/api/v1/auth/verify`, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    const data = await res.json();

    if (!res.ok || !data.success) {
      return NextResponse.json({ user: null }, { status: 401 });
    }

    return NextResponse.json({ user: data.data });
  } catch {
    return NextResponse.json({ user: null }, { status: 503 });
  }
}
