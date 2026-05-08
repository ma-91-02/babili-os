import { describe, it, expect, afterAll } from 'vitest';
import {
  buildAuthContext,
  buildUnauthenticatedContext,
  validateInternalToken,
  extractAuthContextFromHeaders,
  isInternalRequest,
  AUTH_HEADERS,
} from '../auth';
import type { AuthenticatedUser } from '../types';

describe('buildAuthContext', () => {
  it('creates an authenticated context from user', () => {
    const user: AuthenticatedUser = {
      userId: 'user-1',
      email: 'test@example.com',
      role: 'waiter',
      restaurantId: 'rest-1',
    };

    const ctx = buildAuthContext(user);

    expect(ctx.authenticated).toBe(true);
    expect(ctx.user?.userId).toBe('user-1');
    expect(ctx.user?.role).toBe('waiter');
    expect(ctx.error).toBeNull();
  });

  it('creates an unauthenticated context when user is null', () => {
    const ctx = buildAuthContext(null, 'Token expired');

    expect(ctx.authenticated).toBe(false);
    expect(ctx.user).toBeNull();
    expect(ctx.error).toBe('Token expired');
  });

  it('creates context for platform admin without restaurantId', () => {
    const user: AuthenticatedUser = {
      userId: 'admin-1',
      email: 'admin@example.com',
      role: 'platform_admin',
      restaurantId: null,
    };

    const ctx = buildAuthContext(user);

    expect(ctx.authenticated).toBe(true);
    expect(ctx.user?.role).toBe('platform_admin');
    expect(ctx.user?.restaurantId).toBeNull();
  });
});

describe('buildUnauthenticatedContext', () => {
  it('creates context with error message', () => {
    const ctx = buildUnauthenticatedContext('Missing token');

    expect(ctx.authenticated).toBe(false);
    expect(ctx.user).toBeNull();
    expect(ctx.error).toBe('Missing token');
  });
});

describe('validateInternalToken', () => {
  const originalToken = process.env.INTERNAL_SERVICE_TOKEN;

  afterAll(() => {
    if (originalToken) {
      process.env.INTERNAL_SERVICE_TOKEN = originalToken;
    } else {
      delete process.env.INTERNAL_SERVICE_TOKEN;
    }
  });

  it('returns true when env is not set', () => {
    delete process.env.INTERNAL_SERVICE_TOKEN;
    expect(validateInternalToken('any-token')).toBe(true);
  });

  it('returns true when token matches', () => {
    process.env.INTERNAL_SERVICE_TOKEN = 'my-secret';
    expect(validateInternalToken('my-secret')).toBe(true);
  });

  it('returns false when token does not match', () => {
    process.env.INTERNAL_SERVICE_TOKEN = 'my-secret';
    expect(validateInternalToken('wrong-token')).toBe(false);
  });

  it('returns false when token is undefined', () => {
    process.env.INTERNAL_SERVICE_TOKEN = 'my-secret';
    expect(validateInternalToken(undefined)).toBe(false);
  });
});

describe('extractAuthContextFromHeaders', () => {
  it('extracts user from valid headers', () => {
    const ctx = extractAuthContextFromHeaders({
      [AUTH_HEADERS.USER_ID]: 'user-1',
      [AUTH_HEADERS.EMAIL]: 'test@example.com',
      [AUTH_HEADERS.ROLE]: 'manager',
      [AUTH_HEADERS.RESTAURANT_ID]: 'rest-1',
    });

    expect(ctx.authenticated).toBe(true);
    expect(ctx.user?.userId).toBe('user-1');
    expect(ctx.user?.email).toBe('test@example.com');
    expect(ctx.user?.role).toBe('manager');
    expect(ctx.user?.restaurantId).toBe('rest-1');
  });

  it('returns unauthenticated when userId is missing', () => {
    const ctx = extractAuthContextFromHeaders({
      [AUTH_HEADERS.EMAIL]: 'test@example.com',
      [AUTH_HEADERS.ROLE]: 'waiter',
    });

    expect(ctx.authenticated).toBe(false);
    expect(ctx.error).toBe('No auth context provided');
  });

  it('returns unauthenticated when role is missing', () => {
    const ctx = extractAuthContextFromHeaders({
      [AUTH_HEADERS.USER_ID]: 'user-1',
      [AUTH_HEADERS.EMAIL]: 'test@example.com',
    });

    expect(ctx.authenticated).toBe(false);
    expect(ctx.error).toBe('No auth role provided');
  });

  it('handles empty restaurantId as null', () => {
    const ctx = extractAuthContextFromHeaders({
      [AUTH_HEADERS.USER_ID]: 'user-1',
      [AUTH_HEADERS.EMAIL]: 'test@example.com',
      [AUTH_HEADERS.ROLE]: 'platform_admin',
      [AUTH_HEADERS.RESTAURANT_ID]: '',
    });

    expect(ctx.authenticated).toBe(true);
    expect(ctx.user?.restaurantId).toBeNull();
  });

  it('handles platform role without restaurantId', () => {
    const ctx = extractAuthContextFromHeaders({
      [AUTH_HEADERS.USER_ID]: 'admin-1',
      [AUTH_HEADERS.EMAIL]: 'admin@example.com',
      [AUTH_HEADERS.ROLE]: 'platform_admin',
    });

    expect(ctx.authenticated).toBe(true);
    expect(ctx.user?.role).toBe('platform_admin');
    expect(ctx.user?.restaurantId).toBeNull();
  });
});

describe('isInternalRequest', () => {
  const originalToken = process.env.INTERNAL_SERVICE_TOKEN;

  afterAll(() => {
    if (originalToken) {
      process.env.INTERNAL_SERVICE_TOKEN = originalToken;
    }
  });

  it('returns true when token matches', () => {
    process.env.INTERNAL_SERVICE_TOKEN = 'secret123';
    const result = isInternalRequest({
      [AUTH_HEADERS.INTERNAL_TOKEN]: 'secret123',
    });
    expect(result).toBe(true);
  });

  it('returns false when token does not match', () => {
    process.env.INTERNAL_SERVICE_TOKEN = 'secret123';
    const result = isInternalRequest({
      [AUTH_HEADERS.INTERNAL_TOKEN]: 'wrong',
    });
    expect(result).toBe(false);
  });

  it('returns false when header is missing', () => {
    process.env.INTERNAL_SERVICE_TOKEN = 'secret123';
    const result = isInternalRequest({});
    expect(result).toBe(false);
  });
});
