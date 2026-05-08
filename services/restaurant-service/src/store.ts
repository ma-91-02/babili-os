import { v4 as uuidv4 } from 'uuid';
import type {
  Restaurant,
  MenuSection,
  MenuItem,
  Table,
  User,
  SupportedLanguage,
} from '@babili/shared';

export interface CreateRestaurantInput {
  name: string;
  slug: string;
  ownerId: string;
  language?: SupportedLanguage;
  country?: string;
  timezone?: string;
  currencies?: string[];
}

const restaurants: Map<string, Restaurant> = new Map();
const menuSections: Map<string, MenuSection> = new Map();
const menuItems: Map<string, MenuItem> = new Map();
const tables: Map<string, Table> = new Map();
const employees: Map<string, User> = new Map();

export function createRestaurant(input: CreateRestaurantInput): Restaurant {
  const existing = Array.from(restaurants.values()).find((r) => r.slug === input.slug);
  if (existing) {
    throw new Error('Restaurant slug already exists');
  }

  const id = uuidv4();
  const now = new Date().toISOString();

  const restaurant: Restaurant = {
    id,
    name: input.name,
    slug: input.slug,
    ownerId: input.ownerId,
    language: input.language || 'en',
    currencies: input.currencies || ['USD'],
    country: input.country || 'US',
    timezone: input.timezone || 'UTC',
    isActive: true,
    createdAt: now,
    updatedAt: now,
  };

  restaurants.set(id, restaurant);
  return restaurant;
}

export function getRestaurant(id: string): Restaurant | undefined {
  return restaurants.get(id);
}

export function getRestaurantBySlug(slug: string): Restaurant | undefined {
  return Array.from(restaurants.values()).find((r) => r.slug === slug);
}

export function listRestaurants(ownerId?: string): Restaurant[] {
  const all = Array.from(restaurants.values());
  if (ownerId) {
    return all.filter((r) => r.ownerId === ownerId);
  }
  return all;
}

export function updateRestaurant(id: string, updates: Partial<Restaurant>): Restaurant | undefined {
  const restaurant = restaurants.get(id);
  if (!restaurant) return undefined;

  const updated = { ...restaurant, ...updates, updatedAt: new Date().toISOString() };
  restaurants.set(id, updated);
  return updated;
}

export function deleteRestaurant(id: string): boolean {
  return restaurants.delete(id);
}

export function createMenuSection(
  restaurantId: string,
  name: string,
  sortOrder?: number,
): MenuSection {
  const id = uuidv4();
  const now = new Date().toISOString();

  const section: MenuSection = {
    id,
    restaurantId,
    name,
    sortOrder: sortOrder ?? 0,
    isActive: true,
    createdAt: now,
    updatedAt: now,
  };

  menuSections.set(id, section);
  return section;
}

export function listMenuSections(restaurantId: string): MenuSection[] {
  return Array.from(menuSections.values()).filter((s) => s.restaurantId === restaurantId);
}

export function updateMenuSection(
  id: string,
  updates: Partial<MenuSection>,
): MenuSection | undefined {
  const section = menuSections.get(id);
  if (!section) return undefined;

  const updated = { ...section, ...updates, updatedAt: new Date().toISOString() };
  menuSections.set(id, updated);
  return updated;
}

export function deleteMenuSection(id: string): boolean {
  return menuSections.delete(id);
}

export function createMenuItem(input: {
  restaurantId: string;
  sectionId: string;
  name: string;
  description?: string;
  price: number;
  currency?: string;
  ingredients?: string[];
}): MenuItem {
  const id = uuidv4();
  const now = new Date().toISOString();

  const item: MenuItem = {
    id,
    restaurantId: input.restaurantId,
    sectionId: input.sectionId,
    name: input.name,
    description: input.description || '',
    price: input.price,
    currency: input.currency || 'USD',
    ingredients: input.ingredients || [],
    isAvailable: true,
    sortOrder: 0,
    createdAt: now,
    updatedAt: now,
  };

  menuItems.set(id, item);
  return item;
}

export function listMenuItems(restaurantId: string, sectionId?: string): MenuItem[] {
  let items = Array.from(menuItems.values()).filter((i) => i.restaurantId === restaurantId);
  if (sectionId) {
    items = items.filter((i) => i.sectionId === sectionId);
  }
  return items;
}

export function updateMenuItem(id: string, updates: Partial<MenuItem>): MenuItem | undefined {
  const item = menuItems.get(id);
  if (!item) return undefined;

  const updated = { ...item, ...updates, updatedAt: new Date().toISOString() };
  menuItems.set(id, updated);
  return updated;
}

export function deleteMenuItem(id: string): boolean {
  return menuItems.delete(id);
}

export function createTable(restaurantId: string, tableNumber: number, capacity?: number): Table {
  const id = uuidv4();
  const now = new Date().toISOString();

  const table: Table = {
    id,
    restaurantId,
    tableNumber,
    capacity: capacity || 4,
    qrCode: `${restaurantId}-${tableNumber}`,
    isActive: true,
    createdAt: now,
    updatedAt: now,
  };

  tables.set(id, table);
  return table;
}

export function listTables(restaurantId: string): Table[] {
  return Array.from(tables.values()).filter((t) => t.restaurantId === restaurantId);
}

export function updateTable(id: string, updates: Partial<Table>): Table | undefined {
  const table = tables.get(id);
  if (!table) return undefined;

  const updated = { ...table, ...updates, updatedAt: new Date().toISOString() };
  tables.set(id, updated);
  return updated;
}

export function deleteTable(id: string): boolean {
  return tables.delete(id);
}

export function addEmployee(restaurantId: string, user: User): void {
  employees.set(user.id, { ...user, restaurantId });
}

export function listEmployees(restaurantId: string): User[] {
  return Array.from(employees.values()).filter((e) => e.restaurantId === restaurantId);
}

export function removeEmployee(userId: string): boolean {
  return employees.delete(userId);
}
