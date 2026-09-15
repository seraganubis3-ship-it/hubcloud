import { PrismaClient } from '@prisma/client';
import { SEED_CATEGORIES, SEED_PRODUCTS } from '../src/app/api/seed/route';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting Neon PostgreSQL database seeding...');

  // 1. Categories
  console.log('📁 Seeding Categories...');
  for (const cat of SEED_CATEGORIES) {
    await prisma.category.upsert({
      where: { slug: cat.slug },
      update: {
        name: cat.name,
        nameAr: cat.nameAr,
        itemCount: cat.itemCount,
        image: cat.image,
      },
      create: {
        id: cat.id,
        name: cat.name,
        nameAr: cat.nameAr,
        slug: cat.slug,
        itemCount: cat.itemCount,
        image: cat.image,
      },
    });
  }

  // 2. Products
  console.log('💻 Seeding Products with pure-white studio renders...');
  for (const p of SEED_PRODUCTS) {
    await prisma.product.upsert({
      where: { id: p.id },
      update: {
        name: p.name,
        nameAr: p.nameAr,
        brand: p.brand,
        categoryId: p.categoryId,
        subCategory: p.subCategory,
        sku: p.sku,
        price: p.price,
        oldPrice: p.oldPrice,
        discountPercentage: p.discountPercentage,
        inStock: p.inStock,
        stockCount: p.stockCount,
        shipsWithin: p.shipsWithin,
        shipsWithinAr: p.shipsWithinAr,
        isNew: p.isNew,
        isBestSeller: p.isBestSeller,
        isDeal: p.isDeal,
        dealEndsIn: p.dealEndsIn,
        thumbnail: p.thumbnail,
        images: p.images,
        description: p.description,
        descriptionAr: p.descriptionAr,
        specs: p.specs,
        specsAr: p.specsAr,
      },
      create: {
        id: p.id,
        name: p.name,
        nameAr: p.nameAr,
        brand: p.brand,
        categoryId: p.categoryId,
        subCategory: p.subCategory,
        sku: p.sku,
        price: p.price,
        oldPrice: p.oldPrice,
        discountPercentage: p.discountPercentage,
        inStock: p.inStock,
        stockCount: p.stockCount,
        shipsWithin: p.shipsWithin,
        shipsWithinAr: p.shipsWithinAr,
        isNew: p.isNew,
        isBestSeller: p.isBestSeller,
        isDeal: p.isDeal,
        dealEndsIn: p.dealEndsIn,
        thumbnail: p.thumbnail,
        images: p.images,
        description: p.description,
        descriptionAr: p.descriptionAr,
        specs: p.specs,
        specsAr: p.specsAr,
      },
    });
  }

  // 3. Coupons
  console.log('🏷️ Seeding Coupons...');
  const coupons = [
    { code: 'HUB2026', discountAmount: 2000, minSpend: 10000 },
    { code: 'SAVE1500', discountAmount: 1500, minSpend: 6000 },
    { code: 'WELCOME10', discountAmount: 1000, minSpend: 4000 },
    { code: 'HUBCLOUD10', discountAmount: 1500, minSpend: 5000 },
    { code: 'SAVE2000', discountAmount: 2000, minSpend: 8000 },
  ];

  for (const c of coupons) {
    await prisma.coupon.upsert({
      where: { code: c.code },
      update: { discountAmount: c.discountAmount, minSpend: c.minSpend, isActive: true },
      create: { code: c.code, discountAmount: c.discountAmount, minSpend: c.minSpend, isActive: true },
    });
  }

  // 4. Default Admin & User
  console.log('👤 Seeding Users...');
  await prisma.user.upsert({
    where: { email: 'admin@hubcloud.eg' },
    update: { role: 'admin' },
    create: {
      name: 'Hub Cloud Admin',
      email: 'admin@hubcloud.eg',
      phone: '01000000000',
      role: 'admin',
    },
  });

  await prisma.user.upsert({
    where: { email: 'ahmed@gmail.com' },
    update: { role: 'customer' },
    create: {
      name: 'Ahmed Mahmoud',
      email: 'ahmed@gmail.com',
      phone: '01012345678',
      role: 'customer',
    },
  });

  const [categories, products, couponsCount] = await Promise.all([
    prisma.category.count(),
    prisma.product.count(),
    prisma.coupon.count(),
  ]);

  console.log(`✅ Seeding Complete!`);
  console.log(`   - Categories: ${categories}`);
  console.log(`   - Products:   ${products}`);
  console.log(`   - Coupons:    ${couponsCount}`);
}

main()
  .catch((e) => {
    console.error('❌ Seeding failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
