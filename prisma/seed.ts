import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  const passwordHash = await bcrypt.hash('Demo1234!', 10);

  const user = await prisma.user.upsert({
    where: { email: 'demo@business.com' },
    update: {},
    create: {
      businessName: 'Demo Business',
      email: 'demo@business.com',
      passwordHash,
      plan: 'FREE',
    },
  });

  const categoryNames = ['Electronics', 'Apparel', 'Home & Kitchen'];
  const categories = await Promise.all(
    categoryNames.map((name) =>
      prisma.category.upsert({
        where: { userId_name: { userId: user.id, name } },
        update: {},
        create: { name, userId: user.id },
      })
    )
  );

  await prisma.category.upsert({
    where: { userId_name: { userId: user.id, name: 'Audio' } },
    update: { parentId: categories[0].id },
    create: { name: 'Audio', userId: user.id, parentId: categories[0].id },
  });

  const products = [
    {
      name: 'Wireless Headphones',
      sku: 'ELEC-001',
      price: 59.99,
      quantity: 24,
      categoryId: categories[0].id,
      warehouseLocation: 'A1-03',
      reorderPoint: 10,
    },
    {
      name: 'USB-C Charger',
      sku: 'ELEC-002',
      price: 19.99,
      quantity: 3,
      categoryId: categories[0].id,
      warehouseLocation: 'A1-07',
      reorderPoint: 15,
    },
    {
      name: 'Cotton T-Shirt',
      sku: 'APP-001',
      price: 14.99,
      quantity: 50,
      categoryId: categories[1].id,
      warehouseLocation: 'B2-01',
      reorderPoint: 20,
    },
    {
      name: 'Denim Jacket',
      sku: 'APP-002',
      price: 45.0,
      quantity: 4,
      categoryId: categories[1].id,
      warehouseLocation: 'B2-05',
      reorderPoint: 8,
    },
    {
      name: 'Ceramic Mug Set',
      sku: 'HK-001',
      price: 22.5,
      quantity: 15,
      categoryId: categories[2].id,
      warehouseLocation: 'C3-02',
      reorderPoint: 12,
    },
  ];

  for (const p of products) {
    await prisma.product.upsert({
      where: { userId_sku: { userId: user.id, sku: p.sku } },
      update: {},
      create: {
        name: p.name,
        sku: p.sku,
        price: p.price,
        quantity: p.quantity,
        categoryId: p.categoryId,
        userId: user.id,
        status: 'ACTIVE',
        description: `${p.name} — sample seeded product.`,
        warehouseLocation: p.warehouseLocation,
        reorderPoint: p.reorderPoint,
      },
    });
  }

  console.log('Seed complete.');
  console.log('Demo login: demo@business.com / Demo1234!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
