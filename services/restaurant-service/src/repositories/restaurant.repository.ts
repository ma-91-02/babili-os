import { prisma } from '@babili/database';

export async function createRestaurant(data: {
  name: string;
  slug: string;
  ownerId: string;
  language?: string;
  country?: string;
  timezone?: string;
  currencies?: string[];
}) {
  const existing = await prisma.restaurant.findUnique({ where: { slug: data.slug } });
  if (existing) {
    throw new Error('Restaurant slug already exists');
  }

  return prisma.restaurant.create({
    data: {
      name: data.name,
      slug: data.slug,
      ownerId: data.ownerId,
      language: data.language || 'en',
      country: data.country || 'US',
      timezone: data.timezone || 'UTC',
      currencies: data.currencies || ['USD'],
    },
  });
}

export async function findRestaurantById(id: string) {
  return prisma.restaurant.findUnique({ where: { id } });
}

export async function findRestaurantBySlug(slug: string) {
  return prisma.restaurant.findUnique({ where: { slug } });
}

export async function listRestaurants(ownerId?: string) {
  const where = ownerId ? { ownerId } : {};
  return prisma.restaurant.findMany({ where, orderBy: { createdAt: 'desc' } });
}

export async function updateRestaurant(
  id: string,
  data: Partial<{
    name: string;
    language: string;
    country: string;
    timezone: string;
    currencies: string[];
    isActive: boolean;
  }>,
) {
  return prisma.restaurant.update({ where: { id }, data });
}

export async function deleteRestaurant(id: string) {
  await prisma.restaurant.delete({ where: { id } });
}

export async function addStaff(restaurantId: string, userId: string, role: string) {
  return prisma.restaurantStaff.create({
    data: { restaurantId, userId, role: role as any },
  });
}

export async function listStaff(restaurantId: string) {
  return prisma.restaurantStaff.findMany({
    where: { restaurantId },
    include: { user: { select: { id: true, email: true, name: true, role: true } } },
  });
}

export async function removeStaff(userId: string) {
  await prisma.restaurantStaff.deleteMany({ where: { userId } });
}

export async function createTable(restaurantId: string, tableNumber: number, capacity?: number) {
  const qrCode = `${restaurantId}-${tableNumber}`;
  return prisma.restaurantTable.create({
    data: { restaurantId, tableNumber, capacity: capacity || 4, qrCode },
  });
}

export async function listTables(restaurantId: string) {
  return prisma.restaurantTable.findMany({
    where: { restaurantId },
    orderBy: { tableNumber: 'asc' },
  });
}

export async function updateTable(
  id: string,
  data: Partial<{ tableNumber: number; capacity: number; isActive: boolean }>,
) {
  return prisma.restaurantTable.update({ where: { id }, data });
}

export async function deleteTable(id: string) {
  await prisma.restaurantTable.delete({ where: { id } });
}

export async function createMenuSection(restaurantId: string, name: string, sortOrder?: number) {
  return prisma.menuSection.create({
    data: { restaurantId, name, sortOrder: sortOrder ?? 0 },
  });
}

export async function listMenuSections(restaurantId: string) {
  return prisma.menuSection.findMany({
    where: { restaurantId },
    orderBy: { sortOrder: 'asc' },
  });
}

export async function updateMenuSection(
  id: string,
  data: Partial<{ name: string; sortOrder: number; isActive: boolean }>,
) {
  return prisma.menuSection.update({ where: { id }, data });
}

export async function deleteMenuSection(id: string) {
  await prisma.menuSection.delete({ where: { id } });
}

export async function createMenuItem(data: {
  restaurantId: string;
  sectionId: string;
  name: string;
  description?: string;
  price: number;
  currency?: string;
}) {
  return prisma.menuItem.create({
    data: {
      restaurantId: data.restaurantId,
      sectionId: data.sectionId,
      name: data.name,
      description: data.description || '',
      price: data.price,
      currency: data.currency || 'USD',
    },
  });
}

export async function listMenuItems(restaurantId: string, sectionId?: string) {
  const where: any = { restaurantId };
  if (sectionId) where.sectionId = sectionId;
  return prisma.menuItem.findMany({
    where,
    orderBy: { sortOrder: 'asc' },
    include: { ingredients: { include: { ingredient: true } } },
  });
}

export async function updateMenuItem(
  id: string,
  data: Partial<{
    name: string;
    description: string;
    price: number;
    currency: string;
    isAvailable: boolean;
    sortOrder: number;
  }>,
) {
  return prisma.menuItem.update({ where: { id }, data });
}

export async function deleteMenuItem(id: string) {
  await prisma.menuItem.delete({ where: { id } });
}

export async function createIngredient(restaurantId: string, name: string) {
  return prisma.ingredient.create({
    data: { restaurantId, name },
  });
}

export async function listIngredients(restaurantId: string) {
  return prisma.ingredient.findMany({
    where: { restaurantId },
    orderBy: { name: 'asc' },
  });
}
