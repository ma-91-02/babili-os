export type OrderEventType =
  | 'order.created'
  | 'order.updated'
  | 'order.status'
  | 'order.kitchen'
  | 'order.cashier';

export const ORDER_CHANNEL = 'order:events';

export interface OrderEvent {
  type: OrderEventType;
  orderId: string;
  restaurantId: string;
  data: Record<string, unknown>;
  timestamp: string;
}
