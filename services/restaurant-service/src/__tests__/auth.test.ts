import { describe, it, expect, afterAll } from 'vitest';
import request from 'supertest';
import app from '../index';
import { prisma } from '@babili/database';

const testPrefix = `test-rest-auth-${Date.now()}`;

afterAll(async () => {
  await prisma.restaurant.deleteMany({ where: { slug: { contains: testPrefix } } });
  await prisma.$disconnect();
});

const authHeaders = {
  'X-Internal-Service-Token': 'dev-internal-token',
  'X-Auth-User-Id': 'test-auth-user',
  'X-Auth-Email': 'owner@test.com',
  'X-Auth-Role': 'restaurant_owner',
};

const waiterHeaders = {
  'X-Internal-Service-Token': 'dev-internal-token',
  'X-Auth-User-Id': 'waiter-user',
  'X-Auth-Email': 'waiter@test.com',
  'X-Auth-Role': 'waiter',
};

const wrongRestaurantHeaders = {
  'X-Internal-Service-Token': 'dev-internal-token',
  'X-Auth-User-Id': 'other-user',
  'X-Auth-Email': 'other@test.com',
  'X-Auth-Role': 'restaurant_owner',
  'X-Auth-Restaurant-Id': 'other-restaurant',
};

// Create a restaurant first for auth tests
let createdRestaurantId: string;

describe('Restaurant Service Auth Middleware', () => {
  it('rejects request without internal token', async () => {
    const res = await request(app)
      .post('/api/v1/restaurants')
      .set('X-Auth-User-Id', 'test-user')
      .set('X-Auth-Role', 'restaurant_owner')
      .send({ name: 'Test', slug: `${testPrefix}-noauth`, ownerId: 'test-user' });

    expect(res.status).toBe(401);
    expect(res.body.error).toBe('Authentication required');
  });

  it('rejects request with wrong internal token', async () => {
    const res = await request(app)
      .post('/api/v1/restaurants')
      .set('X-Internal-Service-Token', 'wrong-token')
      .set('X-Auth-User-Id', 'test-user')
      .set('X-Auth-Role', 'restaurant_owner')
      .send({ name: 'Test', slug: `${testPrefix}-wrongtoken`, ownerId: 'test-user' });

    expect(res.status).toBe(401);
  });

  it('rejects request without auth headers', async () => {
    const res = await request(app)
      .post('/api/v1/restaurants')
      .set('X-Internal-Service-Token', 'dev-internal-token')
      .send({ name: 'Test', slug: `${testPrefix}-noauth`, ownerId: 'test-user' });

    expect(res.status).toBe(401);
  });

  it('allows restaurant_owner to create restaurant', async () => {
    const res = await request(app)
      .post('/api/v1/restaurants')
      .set(authHeaders)
      .send({
        name: 'Auth Test Restaurant',
        slug: `${testPrefix}-owner`,
        ownerId: 'test-auth-user',
      });

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    createdRestaurantId = res.body.data.id;
  });

  it('rejects waiter from creating restaurant', async () => {
    const res = await request(app)
      .post('/api/v1/restaurants')
      .set(waiterHeaders)
      .send({ name: 'Waiter Attempt', slug: `${testPrefix}-waiter`, ownerId: 'waiter-user' });

    expect(res.status).toBe(403);
    expect(res.body.error).toBe('Insufficient permissions');
  });

  it('allows any authenticated user to read restaurant', async () => {
    const res = await request(app)
      .get(`/api/v1/restaurants/${createdRestaurantId}`)
      .set({
        ...authHeaders,
        'X-Auth-Restaurant-Id': createdRestaurantId,
      });

    expect(res.status).toBe(200);
  });

  it('rejects access to restaurant from different tenant', async () => {
    const res = await request(app)
      .get(`/api/v1/restaurants/${createdRestaurantId}`)
      .set(wrongRestaurantHeaders);

    expect(res.status).toBe(403);
    expect(res.body.error).toBe('Access denied to this restaurant');
  });

  it('allows manager to create menu section', async () => {
    const managerHeaders = {
      'X-Internal-Service-Token': 'dev-internal-token',
      'X-Auth-User-Id': 'manager-user',
      'X-Auth-Email': 'manager@test.com',
      'X-Auth-Role': 'manager',
      'X-Auth-Restaurant-Id': createdRestaurantId,
    };

    const res = await request(app)
      .post(`/api/v1/restaurants/${createdRestaurantId}/sections`)
      .set(managerHeaders)
      .send({ name: 'Appetizers', sortOrder: 1 });

    expect(res.status).toBe(201);
  });

  it('rejects waiter from creating menu section', async () => {
    const res = await request(app)
      .post(`/api/v1/restaurants/${createdRestaurantId}/sections`)
      .set({
        ...waiterHeaders,
        'X-Auth-Restaurant-Id': createdRestaurantId,
      })
      .send({ name: 'Waiter Section', sortOrder: 2 });

    expect(res.status).toBe(403);
  });

  it('allows waiter to read menu items', async () => {
    const res = await request(app)
      .get(`/api/v1/restaurants/${createdRestaurantId}/items`)
      .set({
        ...waiterHeaders,
        'X-Auth-Restaurant-Id': createdRestaurantId,
      });

    expect(res.status).toBe(200);
  });

  it('health endpoint is public', async () => {
    const res = await request(app).get('/health');
    expect(res.status).toBe(200);
  });

  it('slug lookup endpoint is public', async () => {
    const res = await request(app).get(`/api/v1/restaurants/slug/${testPrefix}-owner`);
    expect(res.status).toBe(200);
  });
});
