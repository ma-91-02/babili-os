import type { PlatformRole, RestaurantRole, Role, CustomerRole } from './types';

export const PLATFORM_ROLES: PlatformRole[] = [
  'platform_owner',
  'platform_admin',
  'support_agent',
  'finance_admin',
  'translation_manager',
];

export const RESTAURANT_ROLES: RestaurantRole[] = [
  'restaurant_owner',
  'manager',
  'cashier',
  'kitchen',
  'waiter',
  'viewer',
];

export const CUSTOMER_ROLES: CustomerRole[] = ['customer'];

export function isPlatformRole(role: Role): role is PlatformRole {
  return (PLATFORM_ROLES as readonly string[]).includes(role);
}

export function isRestaurantRole(role: Role): role is RestaurantRole {
  return (RESTAURANT_ROLES as readonly string[]).includes(role);
}

export function isCustomerRole(role: Role): role is CustomerRole {
  return role === 'customer';
}

export const ROLE_HIERARCHY: Record<string, number> = {
  platform_owner: 100,
  platform_admin: 90,
  support_agent: 70,
  finance_admin: 80,
  translation_manager: 75,
  restaurant_owner: 60,
  manager: 50,
  cashier: 30,
  kitchen: 20,
  waiter: 10,
  viewer: 5,
  customer: 1,
};

export function roleHasAtLeast(role: Role, minimum: Role): boolean {
  const roleLevel = ROLE_HIERARCHY[role] ?? 0;
  const minimumLevel = ROLE_HIERARCHY[minimum] ?? 0;
  return roleLevel >= minimumLevel;
}

export function canManageRestaurant(role: Role): boolean {
  return roleHasAtLeast(role, 'restaurant_owner');
}

export function canManageStaff(role: Role): boolean {
  return roleHasAtLeast(role, 'manager');
}

export function canManageOrders(role: Role): boolean {
  return roleHasAtLeast(role, 'waiter');
}

export function canViewKitchen(role: Role): boolean {
  return roleHasAtLeast(role, 'kitchen');
}

export function canViewCashier(role: Role): boolean {
  return roleHasAtLeast(role, 'cashier');
}

export function canAccessPlatformAdmin(role: Role): boolean {
  return isPlatformRole(role) && roleHasAtLeast(role, 'platform_admin');
}

export function canManageTranslations(role: Role): boolean {
  return role === 'translation_manager' || role === 'platform_owner' || role === 'platform_admin';
}

export function canAccessFinance(role: Role): boolean {
  return role === 'finance_admin' || role === 'platform_owner';
}
