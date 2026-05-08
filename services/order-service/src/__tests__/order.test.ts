import { describe, it, expect, afterAll, beforeAll } from 'vitest';
import { prisma } from '@babili/database';
import * as repo from '../repositories/order.repository';

const testPrefix = `test-order-${Date.now()}`;
let restaurantId: string;
let tableId: string;
let menuItemId: string;
let orderId: string;

beforeAll(async () => {
  const { PrismaClient } = await import('@prisma/client');
  const adminClient = new PrismaClient();

  const rest = await adminClient.restaurant.create({
    data: {
      name: 'Order Test Restaurant',
      slug: `${testPrefix}-rest`,
      ownerId: 'test-owner',
      tables: { create: { tableNumber: 99, capacity: 4, qrCode: `${testPrefix}-qr-99` } },
      menuSections: { create: { name: 'Main', sortOrder: 1 } },
    },
    include: { tables: true, menuSections: true },
  });

  restaurantId = rest.id;
  tableId = rest.tables[0]!.id;

  const item = await adminClient.menuItem.create({
    data: {
      restaurantId: rest.id,
      sectionId: rest.menuSections[0]!.id,
      name: 'Test Burger',
      price: 8.5,
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

function sampleItem() {
  return { menuItemId, name: 'Test Burger', quantity: 2, price: 8.5 };
}

describe('Order Repository (DB)', () => {
  it('creates an order', async () => {
    const order = await repo.createOrder({
      restaurantId,
      tableId,
      items: [sampleItem()],
    });
    expect(order.orderStatus).toBe('pending');
    expect(order.total).toBe(17);
    expect(order.items.length).toBe(1);
    expect(order.statusEvents.length).toBeGreaterThan(0);
    orderId = order.id;
  });

  it('finds order by id', async () => {
    const order = await repo.findOrderById(orderId);
    expect(order).toBeDefined();
    expect(order!.id).toBe(orderId);
  });

  it('lists orders by restaurant', async () => {
    const orders = await repo.listOrders(restaurantId);
    expect(orders.length).toBeGreaterThan(0);
  });

  it('updates order status', async () => {
    const order = await repo.updateOrderStatus(orderId, 'confirmed');
    expect(order.orderStatus).toBe('confirmed');
  });

  it('updates kitchen status', async () => {
    const order = await repo.updateKitchenStatus(orderId, 'preparing');
    expect(order.kitchenStatus).toBe('preparing');
  });

  it('updates cashier status', async () => {
    const order = await repo.updateCashierStatus(orderId, 'paid');
    expect(order.cashierStatus).toBe('paid');
  });

  it('completes full order flow', async () => {
    await repo.updateOrderStatus(orderId, 'preparing');
    await repo.updateKitchenStatus(orderId, 'ready');
    await repo.updateOrderStatus(orderId, 'ready');
    await repo.updateOrderStatus(orderId, 'delivered');

    const order = await repo.findOrderById(orderId);
    expect(order!.orderStatus).toBe('delivered');
    expect(order!.statusEvents.length).toBeGreaterThanOrEqual(4);
  });

  it('finds orders by table', async () => {
    const tableOrders = await repo.getOrdersByTable(restaurantId, tableId);
    expect(tableOrders.length).toBeGreaterThan(0);
  });

  it('lists active orders', async () => {
    const active = await repo.listActiveOrders(restaurantId);
    const hasDelivered = active.some((o) => o.orderStatus === 'delivered');
    expect(hasDelivered).toBe(false);
  });
});
