import express from 'express';
import * as repo from './repositories/restaurant.repository';

const app = express();
const PORT = process.env.PORT || 4002;

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
    service: 'restaurant-service',
    database: dbOk ? 'connected' : 'disconnected',
    timestamp: new Date().toISOString(),
  });
});

app.post('/api/v1/restaurants', async (req, res) => {
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

app.get('/api/v1/restaurants', async (req, res) => {
  const ownerId = req.query.ownerId as string | undefined;
  const all = await repo.listRestaurants(ownerId);
  res.json({ success: true, data: all });
});

app.get('/api/v1/restaurants/:id', async (req, res) => {
  const restaurant = await repo.findRestaurantById(req.params.id);
  if (!restaurant) {
    res.status(404).json({ success: false, error: 'Restaurant not found' });
    return;
  }
  res.json({ success: true, data: restaurant });
});

app.put('/api/v1/restaurants/:id', async (req, res) => {
  try {
    const restaurant = await repo.updateRestaurant(req.params.id, req.body);
    res.json({ success: true, data: restaurant });
  } catch {
    res.status(404).json({ success: false, error: 'Restaurant not found' });
  }
});

app.delete('/api/v1/restaurants/:id', async (req, res) => {
  try {
    await repo.deleteRestaurant(req.params.id);
    res.json({ success: true, data: { message: 'Restaurant deleted' } });
  } catch {
    res.status(404).json({ success: false, error: 'Restaurant not found' });
  }
});

app.get('/api/v1/restaurants/slug/:slug', async (req, res) => {
  const restaurant = await repo.findRestaurantBySlug(req.params.slug);
  if (!restaurant) {
    res.status(404).json({ success: false, error: 'Restaurant not found' });
    return;
  }
  res.json({ success: true, data: restaurant });
});

app.post('/api/v1/restaurants/:restaurantId/sections', async (req, res) => {
  const { name, sortOrder } = req.body;
  if (!name) {
    res.status(400).json({ success: false, error: 'Section name is required' });
    return;
  }
  const section = await repo.createMenuSection(req.params.restaurantId, name, sortOrder);
  res.status(201).json({ success: true, data: section });
});

app.get('/api/v1/restaurants/:restaurantId/sections', async (req, res) => {
  const sections = await repo.listMenuSections(req.params.restaurantId);
  res.json({ success: true, data: sections });
});

app.put('/api/v1/sections/:id', async (req, res) => {
  try {
    const section = await repo.updateMenuSection(req.params.id, req.body);
    res.json({ success: true, data: section });
  } catch {
    res.status(404).json({ success: false, error: 'Section not found' });
  }
});

app.delete('/api/v1/sections/:id', async (req, res) => {
  try {
    await repo.deleteMenuSection(req.params.id);
    res.json({ success: true, data: { message: 'Section deleted' } });
  } catch {
    res.status(404).json({ success: false, error: 'Section not found' });
  }
});

app.post('/api/v1/restaurants/:restaurantId/items', async (req, res) => {
  const { sectionId, name, description, price, currency } = req.body;
  if (!sectionId || !name || price === undefined) {
    res.status(400).json({ success: false, error: 'SectionId, name, and price are required' });
    return;
  }
  const item = await repo.createMenuItem({
    restaurantId: req.params.restaurantId,
    sectionId,
    name,
    description,
    price,
    currency,
  });
  res.status(201).json({ success: true, data: item });
});

app.get('/api/v1/restaurants/:restaurantId/items', async (req, res) => {
  const sectionId = req.query.sectionId as string | undefined;
  const items = await repo.listMenuItems(req.params.restaurantId, sectionId);
  res.json({ success: true, data: items });
});

app.put('/api/v1/items/:id', async (req, res) => {
  try {
    const item = await repo.updateMenuItem(req.params.id, req.body);
    res.json({ success: true, data: item });
  } catch {
    res.status(404).json({ success: false, error: 'Item not found' });
  }
});

app.delete('/api/v1/items/:id', async (req, res) => {
  try {
    await repo.deleteMenuItem(req.params.id);
    res.json({ success: true, data: { message: 'Item deleted' } });
  } catch {
    res.status(404).json({ success: false, error: 'Item not found' });
  }
});

app.post('/api/v1/restaurants/:restaurantId/tables', async (req, res) => {
  const { tableNumber, capacity } = req.body;
  if (!tableNumber) {
    res.status(400).json({ success: false, error: 'Table number is required' });
    return;
  }
  const table = await repo.createTable(req.params.restaurantId, tableNumber, capacity);
  res.status(201).json({ success: true, data: table });
});

app.get('/api/v1/restaurants/:restaurantId/tables', async (req, res) => {
  const all = await repo.listTables(req.params.restaurantId);
  res.json({ success: true, data: all });
});

app.put('/api/v1/tables/:id', async (req, res) => {
  try {
    const table = await repo.updateTable(req.params.id, req.body);
    res.json({ success: true, data: table });
  } catch {
    res.status(404).json({ success: false, error: 'Table not found' });
  }
});

app.delete('/api/v1/tables/:id', async (req, res) => {
  try {
    await repo.deleteTable(req.params.id);
    res.json({ success: true, data: { message: 'Table deleted' } });
  } catch {
    res.status(404).json({ success: false, error: 'Table not found' });
  }
});

app.post('/api/v1/restaurants/:restaurantId/staff', async (req, res) => {
  const { userId, role } = req.body;
  if (!userId || !role) {
    res.status(400).json({ success: false, error: 'UserId and role are required' });
    return;
  }
  const staff = await repo.addStaff(req.params.restaurantId, userId, role);
  res.status(201).json({ success: true, data: staff });
});

app.get('/api/v1/restaurants/:restaurantId/staff', async (req, res) => {
  const staff = await repo.listStaff(req.params.restaurantId);
  res.json({ success: true, data: staff });
});

app.delete('/api/v1/staff/:userId', async (req, res) => {
  await repo.removeStaff(req.params.userId);
  res.json({ success: true, data: { message: 'Staff removed' } });
});

app.listen(PORT, () => {
  console.log(`Restaurant Service running on port ${PORT}`);
});

export default app;
