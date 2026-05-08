import express from 'express';
import {
  createOrder,
  getOrder,
  listOrders,
  updateOrderStatus,
  updateKitchenStatus,
  updateCashierStatus,
  getKitchenQueue,
  getOrderHistory,
  getOrdersByTable,
  listActiveOrders,
} from './store';

const app = express();
const PORT = process.env.PORT || 4003;

app.use(express.json());

app.get('/health', (_req, res) => {
  res.json({ status: 'ok', service: 'order-service', timestamp: new Date().toISOString() });
});

app.post('/api/v1/orders', (req, res) => {
  try {
    const { restaurantId, tableId, customerId, waiterId, items, currency, language } = req.body;
    if (!restaurantId || !tableId || !items || items.length === 0) {
      res
        .status(400)
        .json({ success: false, error: 'RestaurantId, tableId, and items are required' });
      return;
    }
    const order = createOrder({
      restaurantId,
      tableId,
      customerId,
      waiterId,
      items,
      currency,
      language,
    });
    res.status(201).json({ success: true, data: order });
  } catch (error) {
    res.status(500).json({ success: false, error: (error as Error).message });
  }
});

app.get('/api/v1/orders/:id', (req, res) => {
  const order = getOrder(req.params.id);
  if (!order) {
    res.status(404).json({ success: false, error: 'Order not found' });
    return;
  }
  res.json({ success: true, data: order });
});

app.get('/api/v1/restaurants/:restaurantId/orders', (req, res) => {
  const status = req.query.status as string | undefined;
  const orders = listOrders(req.params.restaurantId, status as any);
  res.json({ success: true, data: orders });
});

app.put('/api/v1/orders/:id/status', (req, res) => {
  const { status } = req.body;
  if (!status) {
    res.status(400).json({ success: false, error: 'Status is required' });
    return;
  }
  const order = updateOrderStatus(req.params.id, status);
  if (!order) {
    res.status(404).json({ success: false, error: 'Order not found' });
    return;
  }
  res.json({ success: true, data: order });
});

app.put('/api/v1/orders/:id/kitchen', (req, res) => {
  const { status } = req.body;
  if (!status) {
    res.status(400).json({ success: false, error: 'Kitchen status is required' });
    return;
  }
  const order = updateKitchenStatus(req.params.id, status);
  if (!order) {
    res.status(404).json({ success: false, error: 'Order not found' });
    return;
  }
  res.json({ success: true, data: order });
});

app.put('/api/v1/orders/:id/cashier', (req, res) => {
  const { status } = req.body;
  if (!status) {
    res.status(400).json({ success: false, error: 'Cashier status is required' });
    return;
  }
  const order = updateCashierStatus(req.params.id, status);
  if (!order) {
    res.status(404).json({ success: false, error: 'Order not found' });
    return;
  }
  res.json({ success: true, data: order });
});

app.get('/api/v1/kitchen/queue', (_req, res) => {
  const queue = getKitchenQueue();
  res.json({ success: true, data: queue });
});

app.get('/api/v1/restaurants/:restaurantId/orders/active', (req, res) => {
  const orders = listActiveOrders(req.params.restaurantId);
  res.json({ success: true, data: orders });
});

app.get('/api/v1/restaurants/:restaurantId/orders/history', (req, res) => {
  const history = getOrderHistory(req.params.restaurantId);
  res.json({ success: true, data: history });
});

app.get('/api/v1/restaurants/:restaurantId/tables/:tableId/orders', (req, res) => {
  const orders = getOrdersByTable(req.params.restaurantId, req.params.tableId);
  res.json({ success: true, data: orders });
});

app.listen(PORT, () => {
  console.log(`Order Service running on port ${PORT}`);
});

export default app;
