import { SupportedLanguage } from './constants';

export type PlatformRole =
  | 'platform_owner'
  | 'platform_admin'
  | 'support_agent'
  | 'finance_admin'
  | 'translation_manager';

export type RestaurantRole =
  | 'restaurant_owner'
  | 'manager'
  | 'cashier'
  | 'kitchen'
  | 'waiter'
  | 'viewer';

export type CustomerRole = 'customer';

export type Role = PlatformRole | RestaurantRole | CustomerRole;

export interface User {
  id: string;
  email: string;
  name: string;
  role: Role;
  restaurantId?: string;
  language: SupportedLanguage;
  emailVerified: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Restaurant {
  id: string;
  name: string;
  slug: string;
  ownerId: string;
  language: SupportedLanguage;
  currencies: string[];
  country: string;
  timezone: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface MenuSection {
  id: string;
  restaurantId: string;
  name: string;
  sortOrder: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface MenuItem {
  id: string;
  restaurantId: string;
  sectionId: string;
  name: string;
  description: string;
  price: number;
  currency: string;
  image?: string;
  ingredients: string[];
  isAvailable: boolean;
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
}

export interface Table {
  id: string;
  restaurantId: string;
  tableNumber: number;
  capacity: number;
  qrCode: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export type OrderStatus =
  | 'pending'
  | 'confirmed'
  | 'preparing'
  | 'ready'
  | 'delivered'
  | 'cancelled';
export type KitchenStatus = 'received' | 'preparing' | 'ready';
export type CashierStatus = 'unpaid' | 'paid' | 'refunded';

export interface OrderItem {
  menuItemId: string;
  name: string;
  quantity: number;
  price: number;
  notes?: string;
}

export interface Order {
  id: string;
  restaurantId: string;
  tableId: string;
  customerId?: string;
  waiterId?: string;
  items: OrderItem[];
  total: number;
  currency: string;
  orderStatus: OrderStatus;
  kitchenStatus?: KitchenStatus;
  cashierStatus: CashierStatus;
  language: SupportedLanguage;
  createdAt: string;
  updatedAt: string;
}

export interface TranslationKey {
  key: string;
  translations: Partial<Record<SupportedLanguage, string>>;
  category: string;
}

export interface PaginationParams {
  page: number;
  limit: number;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  pagination?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface HealthCheck {
  status: 'ok' | 'degraded' | 'down';
  service: string;
  version: string;
  timestamp: string;
  uptime: number;
}

export interface AuthenticatedUser {
  userId: string;
  email: string;
  role: Role;
  restaurantId: string | null;
}

export interface AuthContext {
  authenticated: boolean;
  user: AuthenticatedUser | null;
  error: string | null;
}
