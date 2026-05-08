import { prisma } from './index';
import bcrypt from 'bcryptjs';

const DEV_PASSWORD = 'demo1234';

async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 10);
}

interface SeedUsers {
  admin: { id: string; email: string };
  owner: { id: string; email: string };
  manager: { id: string; email: string };
  waiter: { id: string; email: string };
  kitchen: { id: string; email: string };
  cashier: { id: string; email: string };
}

async function seedUsers(): Promise<SeedUsers> {
  const passwordHash = await hashPassword(DEV_PASSWORD);

  const admin = await prisma.user.upsert({
    where: { email: 'admin@babili.dev' },
    update: {},
    create: {
      email: 'admin@babili.dev',
      passwordHash,
      name: 'Platform Admin',
      role: 'platform_admin',
      emailVerified: true,
    },
  });

  const owner = await prisma.user.upsert({
    where: { email: 'owner@babili.dev' },
    update: {},
    create: {
      email: 'owner@babili.dev',
      passwordHash,
      name: 'Restaurant Owner',
      role: 'restaurant_owner',
      emailVerified: true,
    },
  });

  const manager = await prisma.user.upsert({
    where: { email: 'manager@babili.dev' },
    update: {},
    create: {
      email: 'manager@babili.dev',
      passwordHash,
      name: 'Sarah Manager',
      role: 'manager',
      emailVerified: true,
    },
  });

  const waiter = await prisma.user.upsert({
    where: { email: 'waiter@babili.dev' },
    update: {},
    create: {
      email: 'waiter@babili.dev',
      passwordHash,
      name: 'Ahmed Waiter',
      role: 'waiter',
      emailVerified: true,
    },
  });

  const kitchen = await prisma.user.upsert({
    where: { email: 'kitchen@babili.dev' },
    update: {},
    create: {
      email: 'kitchen@babili.dev',
      passwordHash,
      name: 'Chef Karim',
      role: 'kitchen',
      emailVerified: true,
    },
  });

  const cashier = await prisma.user.upsert({
    where: { email: 'cashier@babili.dev' },
    update: {},
    create: {
      email: 'cashier@babili.dev',
      passwordHash,
      name: 'Layla Cashier',
      role: 'cashier',
      emailVerified: true,
    },
  });

  console.log(`  \u2713 ${admin.email} (platform_admin)`);
  console.log(`  \u2713 ${owner.email} (restaurant_owner)`);
  console.log(`  \u2713 ${manager.email} (manager)`);
  console.log(`  \u2713 ${waiter.email} (waiter)`);
  console.log(`  \u2713 ${kitchen.email} (kitchen)`);
  console.log(`  \u2713 ${cashier.email} (cashier)`);

  return { admin, owner, manager, waiter, kitchen, cashier };
}

async function seedRestaurant(ownerId: string) {
  const restaurant = await prisma.restaurant.upsert({
    where: { slug: 'babylon-bistro' },
    update: {},
    create: {
      name: 'Babylon Bistro',
      slug: 'babylon-bistro',
      ownerId,
      language: 'en',
      country: 'US',
      timezone: 'America/New_York',
      currencies: ['USD'],
    },
  });

  console.log(`  \u2713 ${restaurant.name} (${restaurant.slug})`);
  return restaurant;
}

async function seedTables(restaurantId: string) {
  await prisma.restaurantTable.deleteMany({ where: { restaurantId } });

  const tables: { id: string }[] = [];
  const tableData = [
    { tableNumber: 1, capacity: 2 },
    { tableNumber: 2, capacity: 4 },
    { tableNumber: 3, capacity: 4 },
    { tableNumber: 4, capacity: 6 },
    { tableNumber: 5, capacity: 8 },
  ];

  for (const t of tableData) {
    const table = await prisma.restaurantTable.create({
      data: {
        restaurantId,
        tableNumber: t.tableNumber,
        capacity: t.capacity,
        qrCode: `babylon-bistro-${t.tableNumber}`,
      },
    });
    tables.push(table);
  }

  console.log(`  \u2713 ${tables.length} tables created`);
  return tables;
}

async function seedStaff(restaurantId: string, users: SeedUsers) {
  await prisma.restaurantStaff.deleteMany({ where: { restaurantId } });

  const staffRoles = [
    { userId: users.manager.id, role: 'manager' as const },
    { userId: users.waiter.id, role: 'waiter' as const },
    { userId: users.kitchen.id, role: 'kitchen' as const },
    { userId: users.cashier.id, role: 'cashier' as const },
  ];

  for (const s of staffRoles) {
    await prisma.restaurantStaff.create({
      data: {
        restaurantId,
        userId: s.userId,
        role: s.role,
      },
    });
  }

  console.log(`  \u2713 ${staffRoles.length} staff assignments created`);
}

async function seedMenuSections(restaurantId: string) {
  await prisma.menuSection.deleteMany({ where: { restaurantId } });
  await prisma.menuItem.deleteMany({ where: { restaurantId } });

  const sections: { id: string; name: string }[] = [];
  const sectionData = [
    { name: 'Appetizers', sortOrder: 1 },
    { name: 'Main Course', sortOrder: 2 },
    { name: 'Desserts', sortOrder: 3 },
    { name: 'Beverages', sortOrder: 4 },
  ];

  for (const s of sectionData) {
    const section = await prisma.menuSection.create({
      data: { restaurantId, name: s.name, sortOrder: s.sortOrder },
    });
    sections.push(section);
  }

  console.log(`  \u2713 ${sections.length} menu sections created`);
  return sections;
}

async function seedMenuItems(restaurantId: string, sections: { id: string; name: string }[]) {
  const sectionMap: Record<string, string> = {};
  for (const s of sections) {
    sectionMap[s.name] = s.id;
  }

  const itemsData = [
    {
      section: 'Appetizers',
      name: 'Hummus',
      description: 'Creamy chickpea dip with tahini',
      price: 6.99,
    },
    {
      section: 'Appetizers',
      name: 'Falafel',
      description: 'Crispy chickpea fritters (6 pcs)',
      price: 8.99,
    },
    {
      section: 'Appetizers',
      name: 'Stuffed Grape Leaves',
      description: 'Rice and herb stuffed vine leaves',
      price: 7.99,
    },
    {
      section: 'Main Course',
      name: 'Grilled Chicken',
      description: 'Marinated chicken breast with rice',
      price: 15.99,
    },
    {
      section: 'Main Course',
      name: 'Lamb Kebab',
      description: 'Spiced ground lamb skewers',
      price: 18.99,
    },
    {
      section: 'Main Course',
      name: 'Vegetable Curry',
      description: 'Seasonal vegetables in aromatic sauce',
      price: 13.99,
    },
    {
      section: 'Main Course',
      name: 'Mixed Grill',
      description: 'Assortment of grilled meats',
      price: 22.99,
    },
    {
      section: 'Desserts',
      name: 'Baklava',
      description: 'Layered pastry with honey and nuts',
      price: 5.99,
    },
    { section: 'Desserts', name: 'Kunafa', description: 'Cheese pastry with syrup', price: 6.99 },
    {
      section: 'Desserts',
      name: 'Ice Cream',
      description: 'Vanilla, chocolate, or pistachio',
      price: 3.99,
    },
    {
      section: 'Beverages',
      name: 'Mint Lemonade',
      description: 'Fresh mint and lemon juice',
      price: 3.99,
    },
    {
      section: 'Beverages',
      name: 'Arabic Coffee',
      description: 'Traditional cardamom coffee',
      price: 4.99,
    },
    {
      section: 'Beverages',
      name: 'Fresh Juice',
      description: 'Orange, pomegranate, or mango',
      price: 5.99,
    },
    { section: 'Beverages', name: 'Bottled Water', description: 'Spring water 500ml', price: 1.99 },
  ];

  const items: { id: string }[] = [];
  for (const item of itemsData) {
    const sectionId = sectionMap[item.section];
    if (!sectionId) throw new Error(`Unknown section: ${item.section}`);
    const menuItem = await prisma.menuItem.create({
      data: {
        restaurantId,
        sectionId,
        name: item.name,
        description: item.description,
        price: item.price,
      },
    });
    items.push(menuItem);
  }

  console.log(`  \u2713 ${items.length} menu items created`);
  return items;
}

async function seedIngredients(restaurantId: string) {
  const ingredientNames = [
    'Chickpeas',
    'Tahini',
    'Lemon',
    'Olive Oil',
    'Garlic',
    'Chicken Breast',
    'Lamb',
    'Rice',
    'Tomato',
    'Onion',
    'Bell Pepper',
    'Flour',
    'Sugar',
    'Honey',
    'Pistachio',
    'Mint',
    'Coffee Beans',
    'Milk',
    'Salt',
    'Black Pepper',
  ];

  let count = 0;
  for (const name of ingredientNames) {
    await prisma.ingredient.upsert({
      where: { restaurantId_name: { restaurantId, name } },
      update: {},
      create: { restaurantId, name },
    });
    count++;
  }

  console.log(`  \u2713 ${count} ingredients created`);
  return count;
}

async function main() {
  console.log('\n🌱 Babili Development Seed\n');
  console.log('Seeding users...');
  const users = await seedUsers();

  console.log('\nSeeding restaurant...');
  const restaurant = await seedRestaurant(users.owner.id);

  console.log('\nSeeding staff...');
  await seedStaff(restaurant.id, users);

  console.log('\nSeeding tables...');
  await seedTables(restaurant.id);

  console.log('\nSeeding menu sections...');
  const sections = await seedMenuSections(restaurant.id);

  console.log('\nSeeding menu items...');
  await seedMenuItems(restaurant.id, sections);

  console.log('\nSeeding ingredients...');
  await seedIngredients(restaurant.id);

  console.log('\n✅ Seed complete');
  console.log('   Password for all accounts: demo1234');
  console.log('   Admin:     admin@babili.dev');
  console.log('   Owner:     owner@babili.dev');
  console.log('   Manager:   manager@babili.dev');
  console.log('   Waiter:    waiter@babili.dev');
  console.log('   Kitchen:   kitchen@babili.dev');
  console.log('   Cashier:   cashier@babili.dev');
}

main()
  .catch((e) => {
    console.error('\n❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
