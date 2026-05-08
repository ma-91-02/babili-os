import express from 'express';
import type { Request, Response, NextFunction } from 'express';
import * as repo from './repositories/order.repository';
import {
  extractAuthContextFromHeaders,
  isInternalRequest,
  roleHasAtLeast,
  isPlatformRole,
} from '@babili/shared';
import type { Role, AuthContext } from '@babili/shared';

const app = express();
const PORT = process.env.PORT || 4003;

app.use(express.json());

function param(req: Request, name: string): string {
  return req.params[name] as string;
}

// ─── Auth middleware ─────────────────────────────────────────────────────────

function getAuthContext(req: Request): AuthContext | null {
  const headers = req.headers as Record<string, string | string[] | undefined>;
  if (!isInternalRequest(headers)) {
    return null;
  }
  return extractAuthContextFromHeaders(headers);
}

function requireAuth(req: Request, res: Response, next: NextFunction): void {
  const auth = getAuthContext(req);
  if (!auth || !auth.authenticated) {
    res.status(401).json({ success: false, error: 'Authentication required' });
    return;
  }
  (req as any).authContext = auth;
  next();
}

function requireRole(minimumRole: Role) {
  return (req: Request, res: Response, next: NextFunction): void => {
    const auth = (req as any).authContext as AuthContext | undefined;
    if (!auth?.user) {
      res.status(401).json({ success: false, error: 'Authentication required' });
      return;
    }
    if (!roleHasAtLeast(auth.user.role, minimumRole)) {
      res.status(403).json({ success: false, error: 'Insufficient permissions' });
      return;
    }
    next();
  };
}

function requireTenantAccess(req: Request, res: Response, next: NextFunction): void {
  const auth = (req as any).authContext as AuthContext | undefined;
  const targetRestaurantId = param(req, 'restaurantId');

  if (!targetRestaurantId) {
    next();
    return;
  }

  if (!auth?.user) {
    res.status(401).json({ success: false, error: 'Authentication required' });
    return;
  }

  if (isPlatformRole(auth.user.role)) {
    next();
    return;
  }

  if (auth.user.restaurantId !== targetRestaurantId) {
    res.status(403).json({ success: false, error: 'Access denied to this restaurant' });
    return;
  }

  next();
}

// ─── Health (public) ─────────────────────────────────────────────────────────

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

// ─── Order endpoints ─────────────────────────────────────────────────────────

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

app.get('/api/v1/orders/:id', requireAuth, async (req, res) => {
  const order = await repo.findOrderById(param(req, 'id'));
  if (!order) {
    res.status(404).json({ success: false, error: 'Order not found' });
    return;
  }

  const auth = (req as any).authContext as AuthContext;
  if (auth.user && !isPlatformRole(auth.user.role)) {
    if (auth.user.restaurantId !== order.restaurantId) {
      res.status(404).json({ success: false, error: 'Order not found' });
      return;
    }
  }

  res.json({ success: true, data: order });
});

app.get(
  '/api/v1/restaurants/:restaurantId/orders',
  requireAuth,
  requireTenantAccess,
  async (req, res) => {
    const status = req.query.status as string | undefined;
    const orders = await repo.listOrders(param(req, 'restaurantId'), status);
    res.json({ success: true, data: orders });
  },
);

app.put('/api/v1/orders/:id/status', requireAuth, requireRole('waiter'), async (req, res) => {
  const { status } = req.body;
  if (!status) {
    res.status(400).json({ success: false, error: 'Status is required' });
    return;
  }
  try {
    const order = await repo.updateOrderStatus(param(req, 'id'), status);
    res.json({ success: true, data: order });
  } catch {
    res.status(404).json({ success: false, error: 'Order not found' });
  }
});

app.put('/api/v1/orders/:id/kitchen', requireAuth, requireRole('kitchen'), async (req, res) => {
  const { status } = req.body;
  if (!status) {
    res.status(400).json({ success: false, error: 'Kitchen status is required' });
    return;
  }
  try {
    const order = await repo.updateKitchenStatus(param(req, 'id'), status);
    res.json({ success: true, data: order });
  } catch {
    res.status(404).json({ success: false, error: 'Order not found' });
  }
});

app.put('/api/v1/orders/:id/cashier', requireAuth, requireRole('cashier'), async (req, res) => {
  const { status } = req.body;
  if (!status) {
    res.status(400).json({ success: false, error: 'Cashier status is required' });
    return;
  }
  try {
    const order = await repo.updateCashierStatus(param(req, 'id'), status);
    res.json({ success: true, data: order });
  } catch {
    res.status(404).json({ success: false, error: 'Order not found' });
  }
});

app.get('/api/v1/kitchen/queue', requireAuth, requireRole('kitchen'), async (_req, res) => {
  const queue = await repo.getKitchenQueue();
  res.json({ success: true, data: queue });
});

app.get(
  '/api/v1/restaurants/:restaurantId/orders/active',
  requireAuth,
  requireTenantAccess,
  async (req, res) => {
    const orders = await repo.listActiveOrders(param(req, 'restaurantId'));
    res.json({ success: true, data: orders });
  },
);

app.get(
  '/api/v1/restaurants/:restaurantId/orders/history',
  requireAuth,
  requireTenantAccess,
  async (req, res) => {
    const history = await repo.getOrderHistory(param(req, 'restaurantId'));
    res.json({ success: true, data: history });
  },
);

app.get(
  '/api/v1/restaurants/:restaurantId/tables/:tableId/orders',
  requireAuth,
  requireTenantAccess,
  async (req, res) => {
    const orders = await repo.getOrdersByTable(param(req, 'restaurantId'), param(req, 'tableId'));
    res.json({ success: true, data: orders });
  },
);

if (process.env.NODE_ENV !== 'test') {
  app.listen(PORT, () => {
    console.log(`Order Service running on port ${PORT}`);
  });
}

export default app;
