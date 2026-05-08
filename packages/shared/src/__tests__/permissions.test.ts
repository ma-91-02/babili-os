import { describe, it, expect } from 'vitest';
import {
  PLATFORM_ROLES,
  RESTAURANT_ROLES,
  CUSTOMER_ROLES,
  isPlatformRole,
  isRestaurantRole,
  roleHasAtLeast,
  canManageRestaurant,
  canManageStaff,
  canAccessPlatformAdmin,
  canManageTranslations,
  canAccessFinance,
} from '../permissions';

describe('PLATFORM_ROLES', () => {
  it('contains all platform roles', () => {
    expect(PLATFORM_ROLES).toHaveLength(5);
    expect(PLATFORM_ROLES).toContain('platform_owner');
    expect(PLATFORM_ROLES).toContain('platform_admin');
    expect(PLATFORM_ROLES).toContain('support_agent');
    expect(PLATFORM_ROLES).toContain('finance_admin');
    expect(PLATFORM_ROLES).toContain('translation_manager');
  });
});

describe('RESTAURANT_ROLES', () => {
  it('contains all restaurant roles', () => {
    expect(RESTAURANT_ROLES).toHaveLength(6);
    expect(RESTAURANT_ROLES).toContain('restaurant_owner');
    expect(RESTAURANT_ROLES).toContain('manager');
    expect(RESTAURANT_ROLES).toContain('cashier');
    expect(RESTAURANT_ROLES).toContain('kitchen');
    expect(RESTAURANT_ROLES).toContain('waiter');
    expect(RESTAURANT_ROLES).toContain('viewer');
  });
});

describe('CUSTOMER_ROLES', () => {
  it('contains customer role', () => {
    expect(CUSTOMER_ROLES).toEqual(['customer']);
  });
});

describe('isPlatformRole', () => {
  it('returns true for platform_owner', () => {
    expect(isPlatformRole('platform_owner')).toBe(true);
  });

  it('returns false for restaurant roles', () => {
    expect(isPlatformRole('restaurant_owner')).toBe(false);
    expect(isPlatformRole('waiter')).toBe(false);
  });
});

describe('isRestaurantRole', () => {
  it('returns true for restaurant roles', () => {
    expect(isRestaurantRole('restaurant_owner')).toBe(true);
    expect(isRestaurantRole('waiter')).toBe(true);
  });

  it('returns false for platform roles', () => {
    expect(isRestaurantRole('platform_admin')).toBe(false);
  });
});

describe('roleHasAtLeast', () => {
  it('manager has at least waiter level', () => {
    expect(roleHasAtLeast('manager', 'waiter')).toBe(true);
  });

  it('waiter does not have at least manager level', () => {
    expect(roleHasAtLeast('waiter', 'manager')).toBe(false);
  });

  it('same role returns true', () => {
    expect(roleHasAtLeast('waiter', 'waiter')).toBe(true);
  });
});

describe('canManageRestaurant', () => {
  it('returns true for restaurant_owner', () => {
    expect(canManageRestaurant('restaurant_owner')).toBe(true);
  });

  it('returns false for waiter', () => {
    expect(canManageRestaurant('waiter')).toBe(false);
  });
});

describe('canManageStaff', () => {
  it('returns true for manager', () => {
    expect(canManageStaff('manager')).toBe(true);
  });

  it('returns false for cashier', () => {
    expect(canManageStaff('cashier')).toBe(false);
  });
});

describe('canAccessPlatformAdmin', () => {
  it('returns true for platform_admin', () => {
    expect(canAccessPlatformAdmin('platform_admin')).toBe(true);
  });

  it('returns false for support_agent', () => {
    expect(canAccessPlatformAdmin('support_agent')).toBe(false);
  });

  it('returns false for restaurant roles', () => {
    expect(canAccessPlatformAdmin('restaurant_owner')).toBe(false);
  });
});

describe('canManageTranslations', () => {
  it('returns true for translation_manager', () => {
    expect(canManageTranslations('translation_manager')).toBe(true);
  });

  it('returns true for platform_owner', () => {
    expect(canManageTranslations('platform_owner')).toBe(true);
  });

  it('returns false for support_agent', () => {
    expect(canManageTranslations('support_agent')).toBe(false);
  });
});

describe('canAccessFinance', () => {
  it('returns true for finance_admin', () => {
    expect(canAccessFinance('finance_admin')).toBe(true);
  });

  it('returns false for translation_manager', () => {
    expect(canAccessFinance('translation_manager')).toBe(false);
  });
});
