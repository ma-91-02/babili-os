import express from 'express';
import type { Request, Response, NextFunction } from 'express';
import * as repo from './repositories/restaurant.repository';
import {
  extractAuthContextFromHeaders,
  isInternalRequest,
  roleHasAtLeast,
  isPlatformRole,
} from '@babili/shared';
import type { Role, AuthContext } from '@babili/shared';

const app = express();
const PORT = process.env.PORT || 4002;

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
  const targetRestaurantId = param(req, 'restaurantId') || param(req, 'id');

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
    service: 'restaurant-service',
    database: dbOk ? 'connected' : 'disconnected',
    timestamp: new Date().toISOString(),
  });
});

// ─── Restaurant CRUD ─────────────────────────────────────────────────────────

app.post('/api/v1/restaurants', requireAuth, requireRole('restaurant_owner'), async (req, res) => {
  try {
    const { name, slug, ownerId, language, country, timezone, currencies } = req.body;
    if (!name || !slug || !ownerId) {
      res.status(400).json({ success: false, error: 'Name, slug, and ownerId are required' });
      return;
    }
    const restaurant = await repo.createRestaurant({
      name,
      slug,
      ownerId,
      language,
      country,
      timezone,
      currencies,
    });
    res.status(201).json({ success: true, data: restaurant });
  } catch (error) {
    res.status(409).json({ success: false, error: (error as Error).message });
  }
});

app.get('/api/v1/restaurants', requireAuth, async (req, res) => {
  const ownerId = req.query.ownerId as string | undefined;
  const all = await repo.listRestaurants(ownerId);
  res.json({ success: true, data: all });
});

app.get('/api/v1/restaurants/:id', requireAuth, requireTenantAccess, async (req, res) => {
  const restaurant = await repo.findRestaurantById(param(req, 'id'));
  if (!restaurant) {
    res.status(404).json({ success: false, error: 'Restaurant not found' });
    return;
  }
  res.json({ success: true, data: restaurant });
});

app.put(
  '/api/v1/restaurants/:id',
  requireAuth,
  requireTenantAccess,
  requireRole('restaurant_owner'),
  async (req, res) => {
    try {
      const restaurant = await repo.updateRestaurant(param(req, 'id'), req.body);
      res.json({ success: true, data: restaurant });
    } catch {
      res.status(404).json({ success: false, error: 'Restaurant not found' });
    }
  },
);

app.delete(
  '/api/v1/restaurants/:id',
  requireAuth,
  requireTenantAccess,
  requireRole('restaurant_owner'),
  async (req, res) => {
    try {
      await repo.deleteRestaurant(param(req, 'id'));
      res.json({ success: true, data: { message: 'Restaurant deleted' } });
    } catch {
      res.status(404).json({ success: false, error: 'Restaurant not found' });
    }
  },
);

app.get('/api/v1/restaurants/slug/:slug', async (req, res) => {
  const restaurant = await repo.findRestaurantBySlug(param(req, 'slug'));
  if (!restaurant) {
    res.status(404).json({ success: false, error: 'Restaurant not found' });
    return;
  }
  res.json({ success: true, data: restaurant });
});

// ─── Menu Sections ───────────────────────────────────────────────────────────

app.post(
  '/api/v1/restaurants/:restaurantId/sections',
  requireAuth,
  requireTenantAccess,
  requireRole('manager'),
  async (req, res) => {
    const { name, sortOrder } = req.body;
    if (!name) {
      res.status(400).json({ success: false, error: 'Section name is required' });
      return;
    }
    const section = await repo.createMenuSection(param(req, 'restaurantId'), name, sortOrder);
    res.status(201).json({ success: true, data: section });
  },
);

app.get(
  '/api/v1/restaurants/:restaurantId/sections',
  requireAuth,
  requireTenantAccess,
  async (req, res) => {
    const sections = await repo.listMenuSections(param(req, 'restaurantId'));
    res.json({ success: true, data: sections });
  },
);

app.put('/api/v1/sections/:id', requireAuth, requireRole('manager'), async (req, res) => {
  try {
    const section = await repo.updateMenuSection(param(req, 'id'), req.body);
    res.json({ success: true, data: section });
  } catch {
    res.status(404).json({ success: false, error: 'Section not found' });
  }
});

app.delete('/api/v1/sections/:id', requireAuth, requireRole('manager'), async (req, res) => {
  try {
    await repo.deleteMenuSection(param(req, 'id'));
    res.json({ success: true, data: { message: 'Section deleted' } });
  } catch {
    res.status(404).json({ success: false, error: 'Section not found' });
  }
});

// ─── Menu Items ──────────────────────────────────────────────────────────────

app.post(
  '/api/v1/restaurants/:restaurantId/items',
  requireAuth,
  requireTenantAccess,
  requireRole('manager'),
  async (req, res) => {
    const { sectionId, name, description, price, currency } = req.body;
    if (!sectionId || !name || price === undefined) {
      res.status(400).json({ success: false, error: 'SectionId, name, and price are required' });
      return;
    }
    const item = await repo.createMenuItem({
      restaurantId: param(req, 'restaurantId'),
      sectionId,
      name,
      description,
      price,
      currency,
    });
    res.status(201).json({ success: true, data: item });
  },
);

app.get(
  '/api/v1/restaurants/:restaurantId/items',
  requireAuth,
  requireTenantAccess,
  async (req, res) => {
    const sectionId = req.query.sectionId as string | undefined;
    const items = await repo.listMenuItems(param(req, 'restaurantId'), sectionId);
    res.json({ success: true, data: items });
  },
);

app.put('/api/v1/items/:id', requireAuth, requireRole('manager'), async (req, res) => {
  try {
    const item = await repo.updateMenuItem(param(req, 'id'), req.body);
    res.json({ success: true, data: item });
  } catch {
    res.status(404).json({ success: false, error: 'Item not found' });
  }
});

app.delete('/api/v1/items/:id', requireAuth, requireRole('manager'), async (req, res) => {
  try {
    await repo.deleteMenuItem(param(req, 'id'));
    res.json({ success: true, data: { message: 'Item deleted' } });
  } catch {
    res.status(404).json({ success: false, error: 'Item not found' });
  }
});

// ─── Tables ──────────────────────────────────────────────────────────────────

app.post(
  '/api/v1/restaurants/:restaurantId/tables',
  requireAuth,
  requireTenantAccess,
  requireRole('manager'),
  async (req, res) => {
    const { tableNumber, capacity } = req.body;
    if (!tableNumber) {
      res.status(400).json({ success: false, error: 'Table number is required' });
      return;
    }
    const table = await repo.createTable(param(req, 'restaurantId'), tableNumber, capacity);
    res.status(201).json({ success: true, data: table });
  },
);

app.get(
  '/api/v1/restaurants/:restaurantId/tables',
  requireAuth,
  requireTenantAccess,
  async (req, res) => {
    const all = await repo.listTables(param(req, 'restaurantId'));
    res.json({ success: true, data: all });
  },
);

app.put('/api/v1/tables/:id', requireAuth, requireRole('manager'), async (req, res) => {
  try {
    const table = await repo.updateTable(param(req, 'id'), req.body);
    res.json({ success: true, data: table });
  } catch {
    res.status(404).json({ success: false, error: 'Table not found' });
  }
});

app.delete('/api/v1/tables/:id', requireAuth, requireRole('manager'), async (req, res) => {
  try {
    await repo.deleteTable(param(req, 'id'));
    res.json({ success: true, data: { message: 'Table deleted' } });
  } catch {
    res.status(404).json({ success: false, error: 'Table not found' });
  }
});

// ─── Staff ───────────────────────────────────────────────────────────────────

app.post(
  '/api/v1/restaurants/:restaurantId/staff',
  requireAuth,
  requireTenantAccess,
  requireRole('manager'),
  async (req, res) => {
    const { userId, role } = req.body;
    if (!userId || !role) {
      res.status(400).json({ success: false, error: 'UserId and role are required' });
      return;
    }
    const staff = await repo.addStaff(param(req, 'restaurantId'), userId, role);
    res.status(201).json({ success: true, data: staff });
  },
);

app.get(
  '/api/v1/restaurants/:restaurantId/staff',
  requireAuth,
  requireTenantAccess,
  async (req, res) => {
    const staff = await repo.listStaff(param(req, 'restaurantId'));
    res.json({ success: true, data: staff });
  },
);

app.delete('/api/v1/staff/:userId', requireAuth, requireRole('manager'), async (req, res) => {
  await repo.removeStaff(param(req, 'userId'));
  res.json({ success: true, data: { message: 'Staff removed' } });
});

if (process.env.NODE_ENV !== 'test') {
  app.listen(PORT, () => {
    console.log(`Restaurant Service running on port ${PORT}`);
  });
}

export default app;
