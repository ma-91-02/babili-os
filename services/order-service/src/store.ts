import { v4 as uuidv4 } from 'uuid';
import type {
  Order,
  OrderItem,
  OrderStatus,
  KitchenStatus,
  CashierStatus,
  SupportedLanguage,
} from '@babili/shared';

export interface CreateOrderInput {
  restaurantId: string;
  tableId: string;
  customerId?: string;
  waiterId?: string;
  items: OrderItem[];
  currency?: string;
  language?: SupportedLanguage;
}

const orders: Map<string, Order> = new Map();
const kitchenQueue: string[] = [];
const eventLog: { orderId: string; event: string; timestamp: string }[] = [];

export function createOrder(input: CreateOrderInput): Order {
  const id = uuidv4();
  const now = new Date().toISOString();

  const total = input.items.reduce((sum, item) => sum + item.price * item.quantity, 0);

  const order: Order = {
    id,
    restaurantId: input.restaurantId,
    tableId: input.tableId,
    customerId: input.customerId,
    waiterId: input.waiterId,
    items: input.items,
    total,
    currency: input.currency || 'USD',
    orderStatus: 'pending',
    cashierStatus: 'unpaid',
    language: input.language || 'en',
    createdAt: now,
    updatedAt: now,
  };

  orders.set(id, order);
  kitchenQueue.push(id);
  eventLog.push({ orderId: id, event: 'order.created', timestamp: now });

  return order;
}

export function getOrder(id: string): Order | undefined {
  return orders.get(id);
}

export function listOrders(restaurantId: string, status?: OrderStatus): Order[] {
  let result = Array.from(orders.values()).filter((o) => o.restaurantId === restaurantId);
  if (status) {
    result = result.filter((o) => o.orderStatus === status);
  }
  return result.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
}

export function updateOrderStatus(id: string, status: OrderStatus): Order | undefined {
  const order = orders.get(id);
  if (!order) return undefined;

  order.orderStatus = status;
  order.updatedAt = new Date().toISOString();
  eventLog.push({ orderId: id, event: `order.status.${status}`, timestamp: order.updatedAt });

  if (status === 'preparing') {
    const idx = kitchenQueue.indexOf(id);
    if (idx !== -1) kitchenQueue.splice(idx, 1);
  }

  return order;
}

export function updateKitchenStatus(id: string, status: KitchenStatus): Order | undefined {
  const order = orders.get(id);
  if (!order) return undefined;

  order.kitchenStatus = status;
  order.updatedAt = new Date().toISOString();
  eventLog.push({ orderId: id, event: `kitchen.status.${status}`, timestamp: order.updatedAt });

  return order;
}

export function updateCashierStatus(id: string, status: CashierStatus): Order | undefined {
  const order = orders.get(id);
  if (!order) return undefined;

  order.cashierStatus = status;
  order.updatedAt = new Date().toISOString();
  eventLog.push({ orderId: id, event: `cashier.status.${status}`, timestamp: order.updatedAt });

  return order;
}

export function getKitchenQueue(): Order[] {
  return kitchenQueue.map((id) => orders.get(id)).filter((o): o is Order => o !== undefined);
}

export function getOrderHistory(
  restaurantId: string,
): { orderId: string; event: string; timestamp: string }[] {
  return eventLog.filter((e) => {
    const order = orders.get(e.orderId);
    return order && order.restaurantId === restaurantId;
  });
}

export function getOrdersByTable(restaurantId: string, tableId: string): Order[] {
  return Array.from(orders.values()).filter(
    (o) => o.restaurantId === restaurantId && o.tableId === tableId,
  );
}

export function listActiveOrders(restaurantId: string): Order[] {
  return Array.from(orders.values()).filter(
    (o) =>
      o.restaurantId === restaurantId &&
      o.orderStatus !== 'delivered' &&
      o.orderStatus !== 'cancelled',
  );
}
