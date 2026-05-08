import { describe, it, expect } from 'vitest';
import {
  createOrder,
  getOrder,
  listOrders,
  updateOrderStatus,
  updateKitchenStatus,
  updateCashierStatus,
  getKitchenQueue,
  getOrdersByTable,
  listActiveOrders,
} from '../store';

describe('Order Store', () => {
  const sampleItem = { menuItemId: 'item-1', name: 'Burger', quantity: 2, price: 8.5 };

  describe('createOrder', () => {
    it('creates an order with pending status', () => {
      const order = createOrder({
        restaurantId: 'rest-1',
        tableId: 'table-1',
        items: [sampleItem],
      });

      expect(order.orderStatus).toBe('pending');
      expect(order.total).toBe(17);
      expect(order.cashierStatus).toBe('unpaid');
      expect(order.id).toBeDefined();
    });

    it('calculates total correctly', () => {
      const order = createOrder({
        restaurantId: 'rest-1',
        tableId: 'table-1',
        items: [
          { menuItemId: 'item-1', name: 'Burger', quantity: 2, price: 8.5 },
          { menuItemId: 'item-2', name: 'Fries', quantity: 1, price: 3.0 },
        ],
      });

      expect(order.total).toBe(20);
    });

    it('adds order to kitchen queue', () => {
      createOrder({ restaurantId: 'rest-1', tableId: 'table-1', items: [sampleItem] });
      const queue = getKitchenQueue();
      expect(queue.length).toBeGreaterThan(0);
    });
  });

  describe('getOrder', () => {
    it('retrieves order by id', () => {
      const order = createOrder({
        restaurantId: 'rest-1',
        tableId: 'table-1',
        items: [sampleItem],
      });
      const found = getOrder(order.id);
      expect(found).toBeDefined();
      expect(found!.id).toBe(order.id);
    });
  });

  describe('listOrders', () => {
    it('lists orders for a restaurant', () => {
      const orders = listOrders('rest-1');
      expect(orders.length).toBeGreaterThan(0);
    });

    it('filters by status', () => {
      const pending = listOrders('rest-1', 'pending');
      expect(pending.every((o) => o.orderStatus === 'pending')).toBe(true);
    });
  });

  describe('updateOrderStatus', () => {
    it('updates order status', () => {
      const order = createOrder({
        restaurantId: 'rest-1',
        tableId: 'table-1',
        items: [sampleItem],
      });
      const updated = updateOrderStatus(order.id, 'confirmed');
      expect(updated!.orderStatus).toBe('confirmed');
    });

    it('completes full order flow', () => {
      const order = createOrder({
        restaurantId: 'rest-1',
        tableId: 'table-1',
        items: [sampleItem],
      });

      updateOrderStatus(order.id, 'confirmed');
      expect(getOrder(order.id)!.orderStatus).toBe('confirmed');

      updateOrderStatus(order.id, 'preparing');
      updateKitchenStatus(order.id, 'preparing');
      expect(getOrder(order.id)!.kitchenStatus).toBe('preparing');

      updateKitchenStatus(order.id, 'ready');
      updateOrderStatus(order.id, 'ready');
      expect(getOrder(order.id)!.orderStatus).toBe('ready');

      updateOrderStatus(order.id, 'delivered');
      updateCashierStatus(order.id, 'paid');
      expect(getOrder(order.id)!.cashierStatus).toBe('paid');
    });
  });

  describe('updateCashierStatus', () => {
    it('updates cashier status', () => {
      const order = createOrder({
        restaurantId: 'rest-1',
        tableId: 'table-1',
        items: [sampleItem],
      });
      updateCashierStatus(order.id, 'paid');
      expect(getOrder(order.id)!.cashierStatus).toBe('paid');
    });
  });

  describe('getOrdersByTable', () => {
    it('finds orders for a specific table', () => {
      const order = createOrder({
        restaurantId: 'rest-1',
        tableId: 'table-2',
        items: [sampleItem],
      });
      const tableOrders = getOrdersByTable('rest-1', 'table-2');
      expect(tableOrders).toHaveLength(1);
      expect(tableOrders[0]!.id).toBe(order.id);
    });
  });

  describe('listActiveOrders', () => {
    it('excludes delivered and cancelled orders', () => {
      const activeOrders = listActiveOrders('rest-1');

      const hasDelivered = activeOrders.some((o) => o.orderStatus === 'delivered');
      const hasCancelled = activeOrders.some((o) => o.orderStatus === 'cancelled');

      expect(hasDelivered).toBe(false);
      expect(hasCancelled).toBe(false);
    });
  });
});
