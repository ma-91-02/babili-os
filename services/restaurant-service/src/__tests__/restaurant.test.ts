import { describe, it, expect, afterAll } from 'vitest';
import { prisma } from '@babili/database';
import * as repo from '../repositories/restaurant.repository';

const testPrefix = `test-rest-${Date.now()}`;
let restaurantId: string;
let sectionId: string;

afterAll(async () => {
  await prisma.restaurant.deleteMany({ where: { slug: { contains: testPrefix } } });
  await prisma.$disconnect();
});

describe('Restaurant Repository (DB)', () => {
  it('creates a restaurant', async () => {
    const r = await repo.createRestaurant({
      name: 'Test Restaurant',
      slug: `${testPrefix}-main`,
      ownerId: 'test-owner',
    });

    expect(r.name).toBe('Test Restaurant');
    expect(r.slug).toBe(`${testPrefix}-main`);
    expect(r.isActive).toBe(true);
    restaurantId = r.id;
  });

  it('throws on duplicate slug', async () => {
    await expect(
      repo.createRestaurant({
        name: 'Duplicate',
        slug: `${testPrefix}-main`,
        ownerId: 'test-owner',
      }),
    ).rejects.toThrow('already exists');
  });

  it('finds restaurant by id', async () => {
    const r = await repo.findRestaurantById(restaurantId);
    expect(r).toBeDefined();
    expect(r!.name).toBe('Test Restaurant');
  });

  it('finds restaurant by slug', async () => {
    const r = await repo.findRestaurantBySlug(`${testPrefix}-main`);
    expect(r).toBeDefined();
    expect(r!.id).toBe(restaurantId);
  });

  it('lists restaurants', async () => {
    const all = await repo.listRestaurants();
    expect(all.length).toBeGreaterThan(0);
  });

  it('updates restaurant', async () => {
    const r = await repo.updateRestaurant(restaurantId, { name: 'Updated Name' });
    expect(r.name).toBe('Updated Name');
  });

  it('creates menu sections', async () => {
    await repo.createMenuSection(restaurantId, 'Appetizers', 1);
    await repo.createMenuSection(restaurantId, 'Main Course', 2);

    const sections = await repo.listMenuSections(restaurantId);
    sectionId = sections[0]!.id;
    expect(sections.length).toBeGreaterThanOrEqual(2);
  });

  it('creates menu items', async () => {
    const item = await repo.createMenuItem({
      restaurantId,
      sectionId,
      name: 'Test Burger',
      price: 12.99,
    });

    expect(item.name).toBe('Test Burger');
    expect(item.price).toBe(12.99);
  });

  it('lists menu items by section', async () => {
    const items = await repo.listMenuItems(restaurantId, sectionId);
    expect(items.length).toBeGreaterThan(0);
    expect(items[0]!.name).toBe('Test Burger');
  });

  it('creates tables', async () => {
    await repo.createTable(restaurantId, 1, 4);
    await repo.createTable(restaurantId, 2, 6);

    const tables = await repo.listTables(restaurantId);
    expect(tables.length).toBeGreaterThanOrEqual(2);
  });

  it('creates ingredients', async () => {
    const ing = await repo.createIngredient(restaurantId, 'Test Ingredient');
    expect(ing.name).toBe('Test Ingredient');
  });

  it('deletes restaurant with cascade', async () => {
    const r2 = await repo.createRestaurant({
      name: 'To Delete',
      slug: `${testPrefix}-delete`,
      ownerId: 'test-owner',
    });
    await repo.deleteRestaurant(r2.id);
    const found = await repo.findRestaurantById(r2.id);
    expect(found).toBeNull();
  });
});
