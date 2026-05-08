import { prisma, publishEvent } from '@babili/database';
import { ORDER_CHANNEL } from '@babili/shared';

function buildOrderEvent(type: string, order: any, extra: Record<string, unknown> = {}) {
  return {
    type,
    orderId: order.id,
    restaurantId: order.restaurantId,
    data: {
      orderStatus: order.orderStatus,
      kitchenStatus: order.kitchenStatus,
      cashierStatus: order.cashierStatus,
      total: order.total,
      tableId: order.tableId,
      itemCount: order.items?.length ?? 0,
      ...extra,
    },
    timestamp: new Date().toISOString(),
  };
}

export async function createOrder(data: {
  restaurantId: string;
  tableId: string;
  customerId?: string;
  waiterId?: string;
  items: { menuItemId: string; name: string; quantity: number; price: number; notes?: string }[];
  currency?: string;
  language?: string;
}) {
  const total = data.items.reduce((sum, item) => sum + item.price * item.quantity, 0);

  const order = await prisma.order.create({
    data: {
      restaurantId: data.restaurantId,
      tableId: data.tableId,
      customerId: data.customerId || null,
      waiterId: data.waiterId || null,
      total,
      currency: data.currency || 'USD',
      language: data.language || 'en',
      items: {
        create: data.items.map((item) => ({
          menuItem: { connect: { id: item.menuItemId } },
          name: item.name,
          quantity: item.quantity,
          price: item.price,
          notes: item.notes || null,
        })),
      },
      statusEvents: {
        create: { event: 'order.created' },
      },
    },
    include: { items: true, statusEvents: true },
  });

  publishEvent(ORDER_CHANNEL, buildOrderEvent('order.created', order));
  return order;
}

export async function findOrderById(id: string) {
  return prisma.order.findUnique({
    where: { id },
    include: { items: true, statusEvents: { orderBy: { timestamp: 'asc' } } },
  });
}

export async function listOrders(restaurantId: string, status?: string) {
  const where: any = { restaurantId };
  if (status) where.orderStatus = status;
  return prisma.order.findMany({
    where,
    orderBy: { createdAt: 'desc' },
    include: { items: true },
  });
}

export async function updateOrderStatus(id: string, orderStatus: string) {
  const order = await prisma.order.update({
    where: { id },
    data: {
      orderStatus: orderStatus as any,
      statusEvents: { create: { event: `order.status.${orderStatus}` } },
    },
    include: { items: true, statusEvents: { orderBy: { timestamp: 'asc' } } },
  });

  publishEvent(ORDER_CHANNEL, buildOrderEvent('order.status', order, { newStatus: orderStatus }));
  return order;
}

export async function updateKitchenStatus(id: string, kitchenStatus: string) {
  const order = await prisma.order.update({
    where: { id },
    data: {
      kitchenStatus: kitchenStatus as any,
      statusEvents: { create: { event: `kitchen.status.${kitchenStatus}` } },
    },
    include: { items: true, statusEvents: { orderBy: { timestamp: 'asc' } } },
  });

  publishEvent(
    ORDER_CHANNEL,
    buildOrderEvent('order.kitchen', order, { newKitchenStatus: kitchenStatus }),
  );
  return order;
}

export async function updateCashierStatus(id: string, cashierStatus: string) {
  const order = await prisma.order.update({
    where: { id },
    data: {
      cashierStatus: cashierStatus as any,
      statusEvents: { create: { event: `cashier.status.${cashierStatus}` } },
    },
    include: { items: true, statusEvents: { orderBy: { timestamp: 'asc' } } },
  });

  publishEvent(
    ORDER_CHANNEL,
    buildOrderEvent('order.cashier', order, { newCashierStatus: cashierStatus }),
  );
  return order;
}

export async function listActiveOrders(restaurantId: string) {
  return prisma.order.findMany({
    where: {
      restaurantId,
      orderStatus: { notIn: ['delivered', 'cancelled'] },
    },
    orderBy: { createdAt: 'desc' },
    include: { items: true },
  });
}

export async function getOrdersByTable(restaurantId: string, tableId: string) {
  return prisma.order.findMany({
    where: { restaurantId, tableId },
    orderBy: { createdAt: 'desc' },
    include: { items: true },
  });
}

export async function getKitchenQueue() {
  return prisma.order.findMany({
    where: { orderStatus: 'pending' },
    orderBy: { createdAt: 'asc' },
    include: { items: true },
  });
}

export async function getOrderHistory(restaurantId: string) {
  return prisma.orderStatusEvent.findMany({
    where: { order: { restaurantId } },
    orderBy: { timestamp: 'desc' },
    take: 100,
  });
}
