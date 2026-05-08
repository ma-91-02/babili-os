import { NextRequest, NextResponse } from 'next/server';

const GATEWAY_URL = process.env.API_GATEWAY_URL || 'http://localhost:4000';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, email, password } = body;

    if (!name || !email || !password) {
      return NextResponse.json(
        { error: 'Name, email, and password are required' },
        { status: 400 },
      );
    }

    const res = await fetch(`${GATEWAY_URL}/api/v1/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, email, password }),
    });

    const data = await res.json();

    if (!res.ok || !data.success) {
      return NextResponse.json(
        { error: data.error || 'Registration failed' },
        { status: res.status },
      );
    }

    return NextResponse.json({ user: data.data }, { status: 201 });
  } catch {
    return NextResponse.json({ error: 'Registration service unavailable' }, { status: 503 });
  }
}
