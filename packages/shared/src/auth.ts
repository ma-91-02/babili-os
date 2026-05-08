import type { AuthContext, AuthenticatedUser } from './types';
import type { Role } from './types';

export const AUTH_HEADERS = {
  USER_ID: 'x-auth-user-id',
  EMAIL: 'x-auth-email',
  ROLE: 'x-auth-role',
  RESTAURANT_ID: 'x-auth-restaurant-id',
  INTERNAL_TOKEN: 'x-internal-service-token',
} as const;

export function buildAuthContext(
  user: AuthenticatedUser | null,
  error: string | null = null,
): AuthContext {
  return {
    authenticated: user !== null,
    user,
    error,
  };
}

export function buildUnauthenticatedContext(error: string): AuthContext {
  return {
    authenticated: false,
    user: null,
    error,
  };
}

export function validateInternalToken(token: string | undefined): boolean {
  if (!process.env.INTERNAL_SERVICE_TOKEN) {
    return true;
  }
  return token === process.env.INTERNAL_SERVICE_TOKEN;
}

export function extractAuthContextFromHeaders(
  headers: Record<string, string | string[] | undefined>,
): AuthContext {
  const userId = headers[AUTH_HEADERS.USER_ID] as string | undefined;
  if (!userId) {
    return buildUnauthenticatedContext('No auth context provided');
  }

  const role = headers[AUTH_HEADERS.ROLE] as Role | undefined;
  if (!role) {
    return buildUnauthenticatedContext('No auth role provided');
  }

  const email = (headers[AUTH_HEADERS.EMAIL] as string) || '';
  const restaurantId = (headers[AUTH_HEADERS.RESTAURANT_ID] as string) || null;

  return buildAuthContext({
    userId,
    email,
    role,
    restaurantId,
  });
}

export function isInternalRequest(headers: Record<string, string | string[] | undefined>): boolean {
  const token = headers[AUTH_HEADERS.INTERNAL_TOKEN] as string | undefined;
  return validateInternalToken(token);
}
