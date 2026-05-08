import express from 'express';
import {
  createRestaurant,
  getRestaurant,
  getRestaurantBySlug,
  listRestaurants,
  updateRestaurant,
  deleteRestaurant,
  createMenuSection,
  listMenuSections,
  updateMenuSection,
  deleteMenuSection,
  createMenuItem,
  listMenuItems,
  updateMenuItem,
  deleteMenuItem,
  createTable,
  listTables,
  updateTable,
  deleteTable,
  addEmployee,
  listEmployees,
  removeEmployee,
} from './store';

const app = express();
const PORT = process.env.PORT || 4002;

app.use(express.json());

app.get('/health', (_req, res) => {
  res.json({ status: 'ok', service: 'restaurant-service', timestamp: new Date().toISOString() });
});

app.post('/api/v1/restaurants', (req, res) => {
  try {
    const { name, slug, ownerId, language, country, timezone, currencies } = req.body;
    if (!name || !slug || !ownerId) {
      res.status(400).json({ success: false, error: 'Name, slug, and ownerId are required' });
      return;
    }
    const restaurant = createRestaurant({
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

app.get('/api/v1/restaurants', (req, res) => {
  const ownerId = req.query.ownerId as string | undefined;
  const all = listRestaurants(ownerId);
  res.json({ success: true, data: all });
});

app.get('/api/v1/restaurants/:id', (req, res) => {
  const restaurant = getRestaurant(req.params.id);
  if (!restaurant) {
    res.status(404).json({ success: false, error: 'Restaurant not found' });
    return;
  }
  res.json({ success: true, data: restaurant });
});

app.put('/api/v1/restaurants/:id', (req, res) => {
  const restaurant = updateRestaurant(req.params.id, req.body);
  if (!restaurant) {
    res.status(404).json({ success: false, error: 'Restaurant not found' });
    return;
  }
  res.json({ success: true, data: restaurant });
});

app.delete('/api/v1/restaurants/:id', (req, res) => {
  const deleted = deleteRestaurant(req.params.id);
  if (!deleted) {
    res.status(404).json({ success: false, error: 'Restaurant not found' });
    return;
  }
  res.json({ success: true, data: { message: 'Restaurant deleted' } });
});

app.get('/api/v1/restaurants/slug/:slug', (req, res) => {
  const restaurant = getRestaurantBySlug(req.params.slug);
  if (!restaurant) {
    res.status(404).json({ success: false, error: 'Restaurant not found' });
    return;
  }
  res.json({ success: true, data: restaurant });
});

app.post('/api/v1/restaurants/:restaurantId/sections', (req, res) => {
  const { name, sortOrder } = req.body;
  if (!name) {
    res.status(400).json({ success: false, error: 'Section name is required' });
    return;
  }
  const section = createMenuSection(req.params.restaurantId, name, sortOrder);
  res.status(201).json({ success: true, data: section });
});

app.get('/api/v1/restaurants/:restaurantId/sections', (req, res) => {
  const sections = listMenuSections(req.params.restaurantId);
  res.json({ success: true, data: sections });
});

app.put('/api/v1/sections/:id', (req, res) => {
  const section = updateMenuSection(req.params.id, req.body);
  if (!section) {
    res.status(404).json({ success: false, error: 'Section not found' });
    return;
  }
  res.json({ success: true, data: section });
});

app.delete('/api/v1/sections/:id', (req, res) => {
  const deleted = deleteMenuSection(req.params.id);
  if (!deleted) {
    res.status(404).json({ success: false, error: 'Section not found' });
    return;
  }
  res.json({ success: true, data: { message: 'Section deleted' } });
});

app.post('/api/v1/restaurants/:restaurantId/items', (req, res) => {
  const { sectionId, name, description, price, currency, ingredients } = req.body;
  if (!sectionId || !name || price === undefined) {
    res.status(400).json({ success: false, error: 'SectionId, name, and price are required' });
    return;
  }
  const item = createMenuItem({
    restaurantId: req.params.restaurantId,
    sectionId,
    name,
    description,
    price,
    currency,
    ingredients,
  });
  res.status(201).json({ success: true, data: item });
});

app.get('/api/v1/restaurants/:restaurantId/items', (req, res) => {
  const sectionId = req.query.sectionId as string | undefined;
  const items = listMenuItems(req.params.restaurantId, sectionId);
  res.json({ success: true, data: items });
});

app.put('/api/v1/items/:id', (req, res) => {
  const item = updateMenuItem(req.params.id, req.body);
  if (!item) {
    res.status(404).json({ success: false, error: 'Item not found' });
    return;
  }
  res.json({ success: true, data: item });
});

app.delete('/api/v1/items/:id', (req, res) => {
  const deleted = deleteMenuItem(req.params.id);
  if (!deleted) {
    res.status(404).json({ success: false, error: 'Item not found' });
    return;
  }
  res.json({ success: true, data: { message: 'Item deleted' } });
});

app.post('/api/v1/restaurants/:restaurantId/tables', (req, res) => {
  const { tableNumber, capacity } = req.body;
  if (!tableNumber) {
    res.status(400).json({ success: false, error: 'Table number is required' });
    return;
  }
  const table = createTable(req.params.restaurantId, tableNumber, capacity);
  res.status(201).json({ success: true, data: table });
});

app.get('/api/v1/restaurants/:restaurantId/tables', (req, res) => {
  const all = listTables(req.params.restaurantId);
  res.json({ success: true, data: all });
});

app.put('/api/v1/tables/:id', (req, res) => {
  const table = updateTable(req.params.id, req.body);
  if (!table) {
    res.status(404).json({ success: false, error: 'Table not found' });
    return;
  }
  res.json({ success: true, data: table });
});

app.delete('/api/v1/tables/:id', (req, res) => {
  const deleted = deleteTable(req.params.id);
  if (!deleted) {
    res.status(404).json({ success: false, error: 'Table not found' });
    return;
  }
  res.json({ success: true, data: { message: 'Table deleted' } });
});

app.post('/api/v1/restaurants/:restaurantId/employees', (req, res) => {
  const { user } = req.body;
  if (!user) {
    res.status(400).json({ success: false, error: 'User data is required' });
    return;
  }
  addEmployee(req.params.restaurantId, user);
  res.status(201).json({ success: true, data: { message: 'Employee added' } });
});

app.get('/api/v1/restaurants/:restaurantId/employees', (req, res) => {
  const all = listEmployees(req.params.restaurantId);
  res.json({ success: true, data: all });
});

app.delete('/api/v1/employees/:userId', (req, res) => {
  const removed = removeEmployee(req.params.userId);
  if (!removed) {
    res.status(404).json({ success: false, error: 'Employee not found' });
    return;
  }
  res.json({ success: true, data: { message: 'Employee removed' } });
});

app.listen(PORT, () => {
  console.log(`Restaurant Service running on port ${PORT}`);
});

export default app;
