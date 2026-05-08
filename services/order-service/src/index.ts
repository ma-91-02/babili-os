import express from 'express';
import * as repo from './repositories/order.repository';

const app = express();
const PORT = process.env.PORT || 4003;

app.use(express.json());

app.get('/health', async (_req, res) => {
  let dbOk = false;
  try {
    const { prisma } = await import('@babili/database');
    await prisma.$queryRaw`SELECT 1`;
    dbOk = true;
  } catch {}
  res.json({
    status: dbOk ? 'ok' : 'degraded',
    service: 'order-service',
    database: dbOk ? 'connected' : 'disconnected',
    timestamp: new Date().toISOString(),
  });
});

app.post('/api/v1/orders', async (req, res) => {
  try {
    const { restaurantId, tableId, customerId, waiterId, items, currency, language } = req.body;
    if (!restaurantId || !tableId || !items || items.length === 0) {
      res
        .status(400)
        .json({ success: false, error: 'RestaurantId, tableId, and items are required' });
      return;
    }
    const order = await repo.createOrder({
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

app.get('/api/v1/orders/:id', async (req, res) => {
  const order = await repo.findOrderById(req.params.id);
  if (!order) {
    res.status(404).json({ success: false, error: 'Order not found' });
    return;
  }
  res.json({ success: true, data: order });
});

app.get('/api/v1/restaurants/:restaurantId/orders', async (req, res) => {
  const status = req.query.status as string | undefined;
  const orders = await repo.listOrders(req.params.restaurantId, status);
  res.json({ success: true, data: orders });
});

app.put('/api/v1/orders/:id/status', async (req, res) => {
  const { status } = req.body;
  if (!status) {
    res.status(400).json({ success: false, error: 'Status is required' });
    return;
  }
  try {
    const order = await repo.updateOrderStatus(req.params.id, status);
    res.json({ success: true, data: order });
  } catch {
    res.status(404).json({ success: false, error: 'Order not found' });
  }
});

app.put('/api/v1/orders/:id/kitchen', async (req, res) => {
  const { status } = req.body;
  if (!status) {
    res.status(400).json({ success: false, error: 'Kitchen status is required' });
    return;
  }
  try {
    const order = await repo.updateKitchenStatus(req.params.id, status);
    res.json({ success: true, data: order });
  } catch {
    res.status(404).json({ success: false, error: 'Order not found' });
  }
});

app.put('/api/v1/orders/:id/cashier', async (req, res) => {
  const { status } = req.body;
  if (!status) {
    res.status(400).json({ success: false, error: 'Cashier status is required' });
    return;
  }
  try {
    const order = await repo.updateCashierStatus(req.params.id, status);
    res.json({ success: true, data: order });
  } catch {
    res.status(404).json({ success: false, error: 'Order not found' });
  }
});

app.get('/api/v1/kitchen/queue', async (_req, res) => {
  const queue = await repo.getKitchenQueue();
  res.json({ success: true, data: queue });
});

app.get('/api/v1/restaurants/:restaurantId/orders/active', async (req, res) => {
  const orders = await repo.listActiveOrders(req.params.restaurantId);
  res.json({ success: true, data: orders });
});

app.get('/api/v1/restaurants/:restaurantId/orders/history', async (req, res) => {
  const history = await repo.getOrderHistory(req.params.restaurantId);
  res.json({ success: true, data: history });
});

app.get('/api/v1/restaurants/:restaurantId/tables/:tableId/orders', async (req, res) => {
  const orders = await repo.getOrdersByTable(req.params.restaurantId, req.params.tableId);
  res.json({ success: true, data: orders });
});

app.listen(PORT, () => {
  console.log(`Order Service running on port ${PORT}`);
});

export default app;
