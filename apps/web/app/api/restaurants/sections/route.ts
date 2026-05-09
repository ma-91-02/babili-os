import { NextResponse } from 'next/server';

const GATEWAY_URL = process.env.API_GATEWAY_URL || 'http://localhost:4000';

export async function GET() {
  try {
    const res = await fetch(`${GATEWAY_URL}/api/v1/restaurants/sections`, {
      signal: AbortSignal.timeout(5000),
    });
    if (!res.ok) {
      return NextResponse.json({ success: false, data: [] }, { status: 200 });
    }
    const data = await res.json();
    return NextResponse.json(data);
  } catch {
    return NextResponse.json({ success: false, data: [] }, { status: 200 });
  }
}
