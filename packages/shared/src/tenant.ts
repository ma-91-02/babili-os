import type { Role, User } from './types';
import { isPlatformRole } from './permissions';

export interface TenantContext {
  userId: string;
  role: Role;
  restaurantId?: string;
}

export function createTenantContext(user: User): TenantContext {
  return {
    userId: user.id,
    role: user.role,
    restaurantId: user.restaurantId,
  };
}

export function assertRestaurantAccess(context: TenantContext, targetRestaurantId: string): void {
  if (isPlatformRole(context.role)) {
    return;
  }

  if (context.restaurantId !== targetRestaurantId) {
    throw new Error('Tenant isolation: access denied to this restaurant');
  }
}

export function assertPlatformAccess(context: TenantContext): void {
  if (!isPlatformRole(context.role)) {
    throw new Error('Tenant isolation: platform access denied');
  }
}

export function assertOwnership(context: TenantContext, resourceRestaurantId: string): void {
  if (isPlatformRole(context.role)) {
    return;
  }

  if (context.restaurantId !== resourceRestaurantId) {
    throw new Error('Tenant isolation: you do not own this resource');
  }
}

export function canAccessRestaurant(
  userRole: Role,
  userRestaurantId: string | undefined,
  targetRestaurantId: string,
): boolean {
  if (isPlatformRole(userRole)) {
    return true;
  }
  return userRestaurantId === targetRestaurantId;
}

export function isTenantIsolated(user: User, targetRestaurantId: string): boolean {
  if (isPlatformRole(user.role)) {
    return false;
  }
  return user.restaurantId !== targetRestaurantId;
}
