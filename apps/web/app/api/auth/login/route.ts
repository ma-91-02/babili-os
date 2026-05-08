import { NextRequest, NextResponse } from 'next/server';

const GATEWAY_URL = process.env.API_GATEWAY_URL || 'http://localhost:4000';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, password } = body;

    if (!email || !password) {
      return NextResponse.json({ error: 'Email and password are required' }, { status: 400 });
    }

    const res = await fetch(`${GATEWAY_URL}/api/v1/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });

    const data = await res.json();

    if (!res.ok || !data.success) {
      return NextResponse.json(
        { error: data.error || 'Invalid email or password' },
        { status: res.status },
      );
    }

    const response = NextResponse.json({
      user: {
        userId: data.data.userId,
        email: data.data.email,
        role: data.data.role,
        restaurantId: data.data.restaurantId ?? null,
      },
    });

    response.cookies.set('session_token', data.data.token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 24 * 30,
    });

    return response;
  } catch {
    return NextResponse.json({ error: 'Authentication service unavailable' }, { status: 503 });
  }
}
