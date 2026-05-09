import type { SupportedLanguage } from '@babili/shared';

/**
 * Temporary mock data for /ma (Platform Admin).
 * Used when real API data is unavailable.
 * TODO: Replace with real API calls when platform admin API endpoints are built.
 */

export interface MockRestaurant {
  id: string;
  name: string;
  slug: string;
  staffCount: number;
  status: 'active' | 'inactive';
}

export interface MockUser {
  id: string;
  email: string;
  name: string;
  role: string;
}

export interface MockPlan {
  name: string;
  description: string;
  price: number;
  features: string[];
}

export interface MockCountry {
  code: string;
  name: string;
  currency: string;
}

export interface MockTranslationCategory {
  name: string;
  keyCount: number;
  coverage: number;
}

export const MOCK_RESTAURANTS: MockRestaurant[] = [
  { id: '1', name: 'Babylon Bistro', slug: 'babylon-bistro', staffCount: 4, status: 'active' },
];

export const MOCK_USERS: MockUser[] = [
  { id: '1', email: 'admin@babili.dev', name: 'Platform Admin', role: 'platform_admin' },
  { id: '2', email: 'owner@babili.dev', name: 'Restaurant Owner', role: 'restaurant_owner' },
  { id: '3', email: 'manager@babili.dev', name: 'Sarah Manager', role: 'manager' },
  { id: '4', email: 'waiter@babili.dev', name: 'Ahmed Waiter', role: 'waiter' },
  { id: '5', email: 'kitchen@babili.dev', name: 'Chef Karim', role: 'kitchen' },
  { id: '6', email: 'cashier@babili.dev', name: 'Layla Cashier', role: 'cashier' },
];

export const MOCK_PLANS: MockPlan[] = [
  {
    name: 'Starter',
    description: 'For small restaurants',
    price: 29,
    features: ['Up to 50 orders/mo', '1 location', 'Basic reports'],
  },
  {
    name: 'Professional',
    description: 'For growing restaurants',
    price: 79,
    features: ['Up to 500 orders/mo', '3 locations', 'Advanced reports', 'Priority support'],
  },
  {
    name: 'Enterprise',
    description: 'For large chains',
    price: 199,
    features: [
      'Unlimited orders',
      'Unlimited locations',
      'Full analytics',
      'Dedicated support',
      'Custom branding',
    ],
  },
];

export const MOCK_COUNTRIES: MockCountry[] = [
  { code: 'EG', name: 'Egypt', currency: 'EGP' },
  { code: 'AE', name: 'UAE', currency: 'AED' },
  { code: 'SA', name: 'Saudi Arabia', currency: 'SAR' },
];

export const MOCK_TRANSLATION_CATEGORIES: MockTranslationCategory[] = [
  { name: 'common', keyCount: 7, coverage: 100 },
  { name: 'nav', keyCount: 9, coverage: 100 },
  { name: 'auth', keyCount: 14, coverage: 100 },
  { name: 'admin', keyCount: 5, coverage: 100 },
  { name: 'landing', keyCount: 6, coverage: 100 },
  { name: 'restaurant', keyCount: 10, coverage: 100 },
];

export function getMockOverviewStats(_lang: SupportedLanguage) {
  return {
    restaurants: MOCK_RESTAURANTS.length,
    users: MOCK_USERS.length,
    plans: MOCK_PLANS.length,
    countries: MOCK_COUNTRIES.length,
  };
}
