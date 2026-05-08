import { describe, it, expect } from 'vitest';
import {
  createRestaurant,
  getRestaurant,
  getRestaurantBySlug,
  listRestaurants,
  updateRestaurant,
  deleteRestaurant,
  createMenuSection,
  listMenuSections,
  updateMenuSection,
  deleteMenuSection,
  createMenuItem,
  listMenuItems,
  createTable,
  listTables,
  addEmployee,
  listEmployees,
  removeEmployee,
} from '../store';

describe('Restaurant Store', () => {
  describe('createRestaurant', () => {
    it('creates a restaurant', () => {
      const r = createRestaurant({
        name: 'Test Restaurant',
        slug: 'test-rest',
        ownerId: 'owner-1',
      });
      expect(r.name).toBe('Test Restaurant');
      expect(r.slug).toBe('test-rest');
      expect(r.isActive).toBe(true);
    });

    it('throws on duplicate slug', () => {
      createRestaurant({ name: 'First', slug: 'dup-slug', ownerId: 'owner-1' });
      expect(() =>
        createRestaurant({ name: 'Second', slug: 'dup-slug', ownerId: 'owner-2' }),
      ).toThrow('slug already exists');
    });
  });

  describe('getRestaurant', () => {
    it('gets restaurant by id', () => {
      const r = createRestaurant({ name: 'Get Test', slug: 'get-test', ownerId: 'owner-1' });
      const found = getRestaurant(r.id);
      expect(found).toBeDefined();
      expect(found!.name).toBe('Get Test');
    });
  });

  describe('getRestaurantBySlug', () => {
    it('gets restaurant by slug', () => {
      createRestaurant({ name: 'Slug Test', slug: 'slug-test', ownerId: 'owner-1' });
      const found = getRestaurantBySlug('slug-test');
      expect(found).toBeDefined();
      expect(found!.name).toBe('Slug Test');
    });
  });

  describe('listRestaurants', () => {
    it('lists all restaurants', () => {
      const all = listRestaurants();
      expect(all.length).toBeGreaterThan(0);
    });

    it('filters by ownerId', () => {
      const ownerRestaurants = listRestaurants('owner-1');
      expect(ownerRestaurants.every((r) => r.ownerId === 'owner-1')).toBe(true);
    });
  });

  describe('updateRestaurant', () => {
    it('updates restaurant fields', () => {
      const r = createRestaurant({ name: 'Update Test', slug: 'update-test', ownerId: 'owner-1' });
      const updated = updateRestaurant(r.id, { name: 'Updated Name' });
      expect(updated!.name).toBe('Updated Name');
    });
  });

  describe('deleteRestaurant', () => {
    it('deletes a restaurant', () => {
      const r = createRestaurant({ name: 'Delete Test', slug: 'delete-test', ownerId: 'owner-1' });
      deleteRestaurant(r.id);
      expect(getRestaurant(r.id)).toBeUndefined();
    });
  });

  describe('Menu Sections', () => {
    it('creates and lists sections', () => {
      const r = createRestaurant({
        name: 'Menu Section Test',
        slug: 'menu-section-test',
        ownerId: 'owner-1',
      });
      createMenuSection(r.id, 'Appetizers', 1);
      createMenuSection(r.id, 'Main Course', 2);
      const sections = listMenuSections(r.id);
      expect(sections).toHaveLength(2);
      expect(sections[0]!.name).toBe('Appetizers');
    });

    it('updates a section', () => {
      const r = createRestaurant({
        name: 'Section Update',
        slug: 'section-update',
        ownerId: 'owner-1',
      });
      const s = createMenuSection(r.id, 'Old Name');
      const updated = updateMenuSection(s.id, { name: 'New Name' });
      expect(updated!.name).toBe('New Name');
    });

    it('deletes a section', () => {
      const r = createRestaurant({
        name: 'Section Delete',
        slug: 'section-delete',
        ownerId: 'owner-1',
      });
      const s = createMenuSection(r.id, 'Delete Me');
      deleteMenuSection(s.id);
      expect(listMenuSections(r.id)).toHaveLength(0);
    });
  });

  describe('Menu Items', () => {
    it('creates and lists items', () => {
      const r = createRestaurant({ name: 'Item Test', slug: 'item-test', ownerId: 'owner-1' });
      const s = createMenuSection(r.id, 'Beverages');
      createMenuItem({ restaurantId: r.id, sectionId: s.id, name: 'Cola', price: 2.5 });
      createMenuItem({ restaurantId: r.id, sectionId: s.id, name: 'Water', price: 1.0 });
      const items = listMenuItems(r.id);
      expect(items).toHaveLength(2);
    });

    it('filters items by section', () => {
      const r = createRestaurant({ name: 'Item Filter', slug: 'item-filter', ownerId: 'owner-1' });
      const s1 = createMenuSection(r.id, 'Food');
      const s2 = createMenuSection(r.id, 'Drinks');
      createMenuItem({ restaurantId: r.id, sectionId: s1.id, name: 'Burger', price: 8 });
      createMenuItem({ restaurantId: r.id, sectionId: s2.id, name: 'Juice', price: 3 });
      const drinks = listMenuItems(r.id, s2.id);
      expect(drinks).toHaveLength(1);
      expect(drinks[0]!.name).toBe('Juice');
    });
  });

  describe('Tables', () => {
    it('creates and lists tables', () => {
      const r = createRestaurant({ name: 'Table Test', slug: 'table-test', ownerId: 'owner-1' });
      createTable(r.id, 1, 4);
      createTable(r.id, 2, 6);
      const all = listTables(r.id);
      expect(all).toHaveLength(2);
    });
  });

  describe('Employees', () => {
    it('adds and lists employees', () => {
      const r = createRestaurant({ name: 'Employee Test', slug: 'emp-test', ownerId: 'owner-1' });
      const user = {
        id: 'emp-1',
        email: 'emp@test.com',
        name: 'Employee',
        role: 'waiter' as const,
        restaurantId: r.id,
        language: 'en' as const,
        emailVerified: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      addEmployee(r.id, user);
      const all = listEmployees(r.id);
      expect(all).toHaveLength(1);
      expect(all[0]!.email).toBe('emp@test.com');
    });

    it('removes employee', () => {
      removeEmployee('emp-1');
      const r = createRestaurant({ name: 'Emp Remove', slug: 'emp-remove', ownerId: 'owner-1' });
      expect(listEmployees(r.id)).toHaveLength(0);
    });
  });
});
