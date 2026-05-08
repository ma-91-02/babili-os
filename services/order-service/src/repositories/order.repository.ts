import { prisma } from '@babili/database';

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

  return prisma.order.create({
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
          menuItemId: item.menuItemId,
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
  return prisma.order.update({
    where: { id },
    data: {
      orderStatus: orderStatus as any,
      statusEvents: { create: { event: `order.status.${orderStatus}` } },
    },
    include: { items: true, statusEvents: { orderBy: { timestamp: 'asc' } } },
  });
}

export async function updateKitchenStatus(id: string, kitchenStatus: string) {
  return prisma.order.update({
    where: { id },
    data: {
      kitchenStatus: kitchenStatus as any,
      statusEvents: { create: { event: `kitchen.status.${kitchenStatus}` } },
    },
  });
}

export async function updateCashierStatus(id: string, cashierStatus: string) {
  return prisma.order.update({
    where: { id },
    data: {
      cashierStatus: cashierStatus as any,
      statusEvents: { create: { event: `cashier.status.${cashierStatus}` } },
    },
  });
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
