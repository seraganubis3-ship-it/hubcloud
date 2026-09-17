import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { requireAdmin } from '@/lib/auth-guard';

export async function GET(request: Request) {
  const auth = await requireAdmin(request);
  if (!auth.authorized) return auth.response;

  try {
    const { searchParams } = new URL(request.url);
    const page = Math.max(1, Number(searchParams.get('page')) || 1);
    const limit = Math.max(1, Math.min(500, Number(searchParams.get('limit')) || 200));
    const search = searchParams.get('q')?.trim() || '';
    const stockStatus = searchParams.get('status'); // 'all', 'inStock', 'lowStock', 'outOfStock'

    const where: any = { isArchived: false };

    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { nameAr: { contains: search, mode: 'insensitive' } },
        { sku: { contains: search, mode: 'insensitive' } },
        { brand: { contains: search, mode: 'insensitive' } },
      ];
    }

    if (stockStatus === 'inStock') {
      where.stockCount = { gt: 5 };
    } else if (stockStatus === 'lowStock') {
      where.stockCount = { gt: 0, lte: 5 };
    } else if (stockStatus === 'outOfStock') {
      where.stockCount = { lte: 0 };
    }

    const [total, products, inStockCount, lowStockCount, outOfStockCount] = await Promise.all([
      prisma.product.count({ where }),
      prisma.product.findMany({
        where,
        select: {
          id: true,
          sku: true,
          name: true,
          nameAr: true,
          brand: true,
          thumbnail: true,
          price: true,
          stockCount: true,
          lowStockThreshold: true,
          inStock: true,
          trackInventory: true,
          allowBackorders: true,
          category: {
            select: { name: true, nameAr: true },
          },
          variants: {
            select: {
              id: true,
              sku: true,
              price: true,
              stockCount: true,
              options: true,
            },
          },
          inventoryTransactions: {
            orderBy: { createdAt: 'desc' },
            take: 3,
          },
        },
        orderBy: [{ stockCount: 'asc' }, { updatedAt: 'desc' }],
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.product.count({ where: { isArchived: false, stockCount: { gt: 5 } } }),
      prisma.product.count({ where: { isArchived: false, stockCount: { gt: 0, lte: 5 } } }),
      prisma.product.count({ where: { isArchived: false, stockCount: { lte: 0 } } }),
    ]);

    const formatted = products.map((p) => {
      let status: 'inStock' | 'lowStock' | 'outOfStock' = 'inStock';
      if (p.stockCount <= 0) status = 'outOfStock';
      else if (p.stockCount <= p.lowStockThreshold) status = 'lowStock';

      return {
        ...p,
        price: Number(p.price || 0),
        category: p.category?.name || 'Hardware',
        categorySlug: (p as any).categoryId || 'hardware',
        costPrice: Number((p as any).costPrice || 0),
        isLowStock: status === 'lowStock',
        isOutOfStock: status === 'outOfStock',
        transactions: p.inventoryTransactions || [],
        stockStatus: status,
      };
    });

    const totalValuation = formatted.reduce((sum, p) => sum + (Number(p.price) || 0) * (p.stockCount || 0), 0);
    const totalUnits = formatted.reduce((sum, p) => sum + (p.stockCount || 0), 0);

    return NextResponse.json({
      success: true,
      products: formatted,
      inventory: formatted,
      kpi: {
        totalProducts: inStockCount + lowStockCount + outOfStockCount,
        totalUnits,
        totalValuation,
        outOfStockCount,
        lowStockCount,
      },
      kpis: {
        totalProducts: inStockCount + lowStockCount + outOfStockCount,
        inStockCount,
        lowStockCount,
        outOfStockCount,
      },
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
