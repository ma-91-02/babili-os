/**
 * Temporary mock data for /restaurant (Restaurant Dashboard).
 * Used when real API data is unavailable.
 * TODO: Replace with real API calls when restaurant dashboard endpoints are connected.
 */

export interface MockMenuSection {
  id: string;
  name: string;
  itemCount: number;
}

export interface MockStaffMember {
  name: string;
  email: string;
  role: string;
}

export interface MockTable {
  id: string;
  number: number;
  status: 'available' | 'occupied';
  capacity: number;
}

export interface MockOverviewStats {
  orders: number;
  tables: number;
  staff: number;
  menuItems: number;
}

export const MOCK_MENU_SECTIONS: MockMenuSection[] = [
  { id: 'sec-1', name: 'Appetizers', itemCount: 3 },
  { id: 'sec-2', name: 'Main Course', itemCount: 4 },
  { id: 'sec-3', name: 'Desserts', itemCount: 3 },
  { id: 'sec-4', name: 'Beverages', itemCount: 4 },
];

export const MOCK_STAFF: MockStaffMember[] = [
  { name: 'Restaurant Owner', email: 'owner@babili.dev', role: 'restaurant_owner' },
  { name: 'Sarah Manager', email: 'manager@babili.dev', role: 'manager' },
  { name: 'Ahmed Waiter', email: 'waiter@babili.dev', role: 'waiter' },
  { name: 'Chef Karim', email: 'kitchen@babili.dev', role: 'kitchen' },
  { name: 'Layla Cashier', email: 'cashier@babili.dev', role: 'cashier' },
];

export const MOCK_TABLES: MockTable[] = [
  { id: 'tbl-1', number: 1, status: 'available', capacity: 2 },
  { id: 'tbl-2', number: 2, status: 'occupied', capacity: 4 },
  { id: 'tbl-3', number: 3, status: 'available', capacity: 4 },
  { id: 'tbl-4', number: 4, status: 'available', capacity: 6 },
  { id: 'tbl-5', number: 5, status: 'occupied', capacity: 8 },
];

export function getMockOverviewStats(): MockOverviewStats {
  // TODO: Fetch real stats from API when available
  return {
    orders: 12,
    tables: MOCK_TABLES.length,
    staff: MOCK_STAFF.length,
    menuItems: MOCK_MENU_SECTIONS.reduce((sum, s) => sum + s.itemCount, 0),
  };
}
