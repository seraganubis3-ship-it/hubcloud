import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { SEED_CATEGORIES, SEED_PRODUCTS } from '@/lib/seed-data';
import { hashPassword } from '@/lib/auth';
import crypto from 'crypto';

function verifySeedSecret(provided: string | null, expected: string | undefined): boolean {
  if (!provided || !expected) return false;
  try {
    const provBuf = Buffer.from(provided);
    const expBuf = Buffer.from(expected);
    if (provBuf.length !== expBuf.length) return false;
    return crypto.timingSafeEqual(provBuf, expBuf);
  } catch {
    return false;
  }
}

async function handleSeed(request: Request) {
  // Strictly prevent unauthorized database re-seeding in all environments
  const seedSecret = request.headers.get('x-seed-secret');
  const expectedSecret = process.env.SEED_SECRET;

  if (!verifySeedSecret(seedSecret, expectedSecret)) {
    return NextResponse.json(
      { success: false, error: 'Unauthorized: Valid x-seed-secret header matching SEED_SECRET environment variable is required.' },
      { status: 403 }
    );
  }

  try {
    // 1. Upsert Categories
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

    // 2. Upsert Products
    for (const p of SEED_PRODUCTS) {
      await prisma.product.upsert({
        where: { id: p.id },
        update: {
          name: p.name,
          nameAr: p.nameAr,
          brand: p.brand,
          categoryId: p.categoryId,
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

    // 3. Upsert Active Coupons
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

    // 4. Default Admin & Customer
    const adminPasswordHash = await hashPassword('admin123');
    await prisma.user.upsert({
      where: { email: 'admin@hubcloud.com' },
      update: {
        role: 'admin',
        adminRoleId: 'manager',
        password: adminPasswordHash,
        name: 'Hub Cloud Admin',
        phone: '01060777895',
      },
      create: {
        name: 'Hub Cloud Admin',
        email: 'admin@hubcloud.com',
        phone: '01060777895',
        password: adminPasswordHash,
        role: 'admin',
        adminRoleId: 'manager',
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

    const [categoryCount, productCount, couponCount] = await Promise.all([
      prisma.category.count(),
      prisma.product.count(),
      prisma.coupon.count(),
    ]);

    return NextResponse.json({
      success: true,
      message: 'Database seeded successfully with realistic Egyptian market IT hardware!',
      stats: {
        categories: categoryCount,
        products: productCount,
        coupons: couponCount,
      },
    });
  } catch (error: any) {
    console.error('Seeding error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  return handleSeed(request);
}

export async function GET(request: Request) {
  return handleSeed(request);
}
