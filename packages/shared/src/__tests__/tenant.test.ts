import { describe, it, expect } from 'vitest';
import {
  createTenantContext,
  assertRestaurantAccess,
  assertPlatformAccess,
  assertOwnership,
  canAccessRestaurant,
  isTenantIsolated,
} from '../tenant';
import type { User } from '../types';

function makeUser(overrides: Partial<User> = {}): User {
  return {
    id: 'user-1',
    email: 'test@example.com',
    name: 'Test User',
    role: 'waiter',
    restaurantId: 'rest-1',
    language: 'en',
    emailVerified: true,
    createdAt: '2025-01-01T00:00:00Z',
    updatedAt: '2025-01-01T00:00:00Z',
    ...overrides,
  };
}

describe('createTenantContext', () => {
  it('creates context from user', () => {
    const user = makeUser();
    const ctx = createTenantContext(user);
    expect(ctx.userId).toBe('user-1');
    expect(ctx.role).toBe('waiter');
    expect(ctx.restaurantId).toBe('rest-1');
  });
});

describe('assertRestaurantAccess', () => {
  it('allows access when restaurant matches', () => {
    const user = makeUser({ role: 'waiter', restaurantId: 'rest-1' });
    const ctx = createTenantContext(user);
    expect(() => assertRestaurantAccess(ctx, 'rest-1')).not.toThrow();
  });

  it('throws when restaurant does not match for restaurant role', () => {
    const user = makeUser({ role: 'waiter', restaurantId: 'rest-1' });
    const ctx = createTenantContext(user);
    expect(() => assertRestaurantAccess(ctx, 'rest-2')).toThrow('access denied');
  });

  it('allows platform admin to access any restaurant', () => {
    const user = makeUser({ role: 'platform_admin', restaurantId: undefined });
    const ctx = createTenantContext(user);
    expect(() => assertRestaurantAccess(ctx, 'rest-2')).not.toThrow();
  });
});

describe('assertPlatformAccess', () => {
  it('allows platform_admin', () => {
    const user = makeUser({ role: 'platform_admin', restaurantId: undefined });
    const ctx = createTenantContext(user);
    expect(() => assertPlatformAccess(ctx)).not.toThrow();
  });

  it('throws for restaurant role', () => {
    const user = makeUser({ role: 'waiter', restaurantId: 'rest-1' });
    const ctx = createTenantContext(user);
    expect(() => assertPlatformAccess(ctx)).toThrow('platform access denied');
  });
});

describe('assertOwnership', () => {
  it('allows owner of resource', () => {
    const user = makeUser({ role: 'waiter', restaurantId: 'rest-1' });
    const ctx = createTenantContext(user);
    expect(() => assertOwnership(ctx, 'rest-1')).not.toThrow();
  });

  it('throws for non-owner', () => {
    const user = makeUser({ role: 'waiter', restaurantId: 'rest-1' });
    const ctx = createTenantContext(user);
    expect(() => assertOwnership(ctx, 'rest-2')).toThrow('do not own');
  });
});

describe('canAccessRestaurant', () => {
  it('returns true for same restaurant', () => {
    expect(canAccessRestaurant('waiter', 'rest-1', 'rest-1')).toBe(true);
  });

  it('returns false for different restaurant', () => {
    expect(canAccessRestaurant('waiter', 'rest-1', 'rest-2')).toBe(false);
  });

  it('returns true for platform role', () => {
    expect(canAccessRestaurant('platform_admin', undefined, 'rest-2')).toBe(true);
  });
});

describe('isTenantIsolated', () => {
  it('returns false for same restaurant', () => {
    expect(isTenantIsolated(makeUser({ role: 'waiter', restaurantId: 'rest-1' }), 'rest-1')).toBe(
      false,
    );
  });

  it('returns true for different restaurant', () => {
    expect(isTenantIsolated(makeUser({ role: 'waiter', restaurantId: 'rest-1' }), 'rest-2')).toBe(
      true,
    );
  });

  it('returns false for platform role', () => {
    expect(
      isTenantIsolated(makeUser({ role: 'platform_admin', restaurantId: undefined }), 'rest-1'),
    ).toBe(false);
  });
});
