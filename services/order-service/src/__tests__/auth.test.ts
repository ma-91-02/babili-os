import { describe, it, expect, afterAll, beforeAll } from 'vitest';
import request from 'supertest';
import app from '../index';
import { prisma } from '@babili/database';

const testPrefix = `test-order-auth-${Date.now()}`;
let restaurantId: string;
let tableId: string;
let menuItemId: string;
let orderId: string;
let authHeaders: Record<string, string>;

const kitchenHeaders = {
  'X-Internal-Service-Token': 'dev-internal-token',
  'X-Auth-User-Id': 'kitchen-user',
  'X-Auth-Email': 'kitchen@test.com',
  'X-Auth-Role': 'kitchen',
  'X-Auth-Restaurant-Id': '',
};

const cashierHeaders = {
  'X-Internal-Service-Token': 'dev-internal-token',
  'X-Auth-User-Id': 'cashier-user',
  'X-Auth-Email': 'cashier@test.com',
  'X-Auth-Role': 'cashier',
  'X-Auth-Restaurant-Id': '',
};

const viewerHeaders = {
  'X-Internal-Service-Token': 'dev-internal-token',
  'X-Auth-User-Id': 'viewer-user',
  'X-Auth-Email': 'viewer@test.com',
  'X-Auth-Role': 'viewer',
  'X-Auth-Restaurant-Id': '',
};

beforeAll(async () => {
  const { PrismaClient } = await import('@prisma/client');
  const adminClient = new PrismaClient();

  const rest = await adminClient.restaurant.create({
    data: {
      name: 'Order Auth Test Restaurant',
      slug: `${testPrefix}-rest`,
      ownerId: 'auth-test-owner',
      tables: { create: { tableNumber: 88, capacity: 4, qrCode: `${testPrefix}-qr-88` } },
      menuSections: { create: { name: 'Main', sortOrder: 1 } },
    },
    include: { tables: true, menuSections: true },
  });

  restaurantId = rest.id;
  tableId = rest.tables[0]!.id;

  authHeaders = {
    'X-Internal-Service-Token': 'dev-internal-token',
    'X-Auth-User-Id': 'waiter-user',
    'X-Auth-Email': 'waiter@test.com',
    'X-Auth-Role': 'waiter',
    'X-Auth-Restaurant-Id': rest.id,
  };

  const item = await adminClient.menuItem.create({
    data: {
      restaurantId: rest.id,
      sectionId: rest.menuSections[0]!.id,
      name: 'Auth Test Burger',
      price: 10,
      sortOrder: 1,
    },
  });

  menuItemId = item.id;
  await adminClient.$disconnect();
});

afterAll(async () => {
  await prisma.order.deleteMany({ where: { restaurant: { slug: { contains: testPrefix } } } });
  await prisma.restaurant.deleteMany({ where: { slug: { contains: testPrefix } } });
  await prisma.$disconnect();
});

describe('Order Service Auth Middleware', () => {
  it('rejects request without internal token', async () => {
    const res = await request(app)
      .get(`/api/v1/restaurants/${restaurantId}/orders`)
      .set('X-Auth-User-Id', 'test-user')
      .set('X-Auth-Role', 'waiter');

    expect(res.status).toBe(401);
  });

  it('allows creating order without auth (public)', async () => {
    const res = await request(app)
      .post('/api/v1/orders')
      .send({
        restaurantId,
        tableId,
        items: [{ menuItemId, name: 'Auth Test Burger', quantity: 1, price: 10 }],
      });

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    orderId = res.body.data.id;
  });

  it('allows waiter to read order', async () => {
    const res = await request(app).get(`/api/v1/orders/${orderId}`).set(authHeaders);

    expect(res.status).toBe(200);
  });

  it('allows waiter to update order status', async () => {
    const res = await request(app)
      .put(`/api/v1/orders/${orderId}/status`)
      .set(authHeaders)
      .send({ status: 'confirmed' });

    expect(res.status).toBe(200);
  });

  it('rejects viewer from updating order status', async () => {
    const res = await request(app)
      .put(`/api/v1/orders/${orderId}/status`)
      .set(viewerHeaders)
      .send({ status: 'preparing' });

    expect(res.status).toBe(403);
  });

  it('allows kitchen to update kitchen status', async () => {
    const res = await request(app)
      .put(`/api/v1/orders/${orderId}/kitchen`)
      .set(kitchenHeaders)
      .send({ status: 'preparing' });

    expect(res.status).toBe(200);
  });

  it('rejects waiter from updating kitchen status', async () => {
    const res = await request(app)
      .put(`/api/v1/orders/${orderId}/kitchen`)
      .set(authHeaders)
      .send({ status: 'ready' });

    expect(res.status).toBe(403);
  });

  it('rejects kitchen from updating cashier status', async () => {
    const res = await request(app)
      .put(`/api/v1/orders/${orderId}/cashier`)
      .set(kitchenHeaders)
      .send({ status: 'paid' });

    expect(res.status).toBe(403);
  });

  it('allows cashier to update cashier status', async () => {
    const res = await request(app)
      .put(`/api/v1/orders/${orderId}/cashier`)
      .set(cashierHeaders)
      .send({ status: 'paid' });

    expect(res.status).toBe(200);
  });

  it('rejects kitchen from accessing kitchen queue without auth', async () => {
    const res = await request(app).get('/api/v1/kitchen/queue');

    expect(res.status).toBe(401);
  });

  it('allows kitchen to access kitchen queue', async () => {
    const res = await request(app).get('/api/v1/kitchen/queue').set(kitchenHeaders);

    expect(res.status).toBe(200);
  });

  it('rejects viewer from accessing kitchen queue', async () => {
    const res = await request(app).get('/api/v1/kitchen/queue').set(viewerHeaders);

    expect(res.status).toBe(403);
  });

  it('allows reading orders by restaurant with tenant access', async () => {
    const res = await request(app)
      .get(`/api/v1/restaurants/${restaurantId}/orders`)
      .set({
        ...authHeaders,
        'X-Auth-Restaurant-Id': restaurantId,
      });

    expect(res.status).toBe(200);
  });

  it('rejects reading orders from different restaurant', async () => {
    const res = await request(app)
      .get(`/api/v1/restaurants/${restaurantId}/orders`)
      .set({
        ...authHeaders,
        'X-Auth-Restaurant-Id': 'other-restaurant',
      });

    expect(res.status).toBe(403);
  });

  it('health endpoint is public', async () => {
    const res = await request(app).get('/health');
    expect(res.status).toBe(200);
  });
});
