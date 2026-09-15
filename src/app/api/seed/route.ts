import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { SEED_CATEGORIES, SEED_PRODUCTS } from '@/lib/seed-data';

export async function GET(request: Request) {
  // Prevent unauthorized database re-seeding in production
  const seedSecret = request.headers.get('x-seed-secret');
  const expectedSecret = process.env.SEED_SECRET || 'hubcloud-seed-protect-2026';

  if (process.env.NODE_ENV === 'production' && seedSecret !== expectedSecret) {
    return NextResponse.json(
      { success: false, error: 'Database seeding is restricted in production. Valid secret key required.' },
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
