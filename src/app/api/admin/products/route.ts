import { prisma } from '@/lib/db';
import { requireAdmin } from '@/lib/auth-guard';
import { adminProductsCache } from '@/lib/server-cache';
import { apiSuccess, apiError, handleApiError } from '@/lib/api-response';
import { serializeAdminProduct } from '@/lib/product-helpers';
import { Prisma } from '@prisma/client';

export async function GET(request: Request) {
  const auth = await requireAdmin(request);
  if (!auth.authorized) return auth.response;

  // Check in-memory cache
  const cacheKey = request.url;
  const cached = adminProductsCache.get(cacheKey);
  if (cached) {
    return apiSuccess(cached, 200, {
      headers: { 'Cache-Control': 'private, s-maxage=30' },
    });
  }

  try {
    const { searchParams } = new URL(request.url);
    const page = Math.max(1, Number(searchParams.get('page')) || 1);
    const limit = Math.max(1, Math.min(100, Number(searchParams.get('limit')) || 20));
    const search = searchParams.get('q')?.trim() || '';
    const categorySlug = searchParams.get('category');
    const brand = searchParams.get('brand');
    const stockStatus = searchParams.get('stock'); // 'inStock', 'lowStock', 'outOfStock'
    const status = searchParams.get('status'); // 'active', 'draft', 'archived'
    const sortField = searchParams.get('sortBy') || 'createdAt';
    const sortOrder = searchParams.get('order') === 'asc' ? 'asc' : 'desc';

    const where: any = {};

    // Search by name, SKU, brand, or barcode
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { nameAr: { contains: search, mode: 'insensitive' } },
        { sku: { contains: search, mode: 'insensitive' } },
        { brand: { contains: search, mode: 'insensitive' } },
        { barcode: { contains: search, mode: 'insensitive' } },
      ];
    }

    if (categorySlug && categorySlug !== 'all') {
      where.categoryId = categorySlug;
    }

    if (brand && brand !== 'all') {
      where.brand = { equals: brand, mode: 'insensitive' };
    }

    if (status && status !== 'all') {
      where.status = status;
    }

    if (stockStatus) {
      if (stockStatus === 'inStock') {
        where.stockCount = { gt: 5 };
      } else if (stockStatus === 'lowStock') {
        where.stockCount = { gt: 0, lte: 5 };
      } else if (stockStatus === 'outOfStock') {
        where.stockCount = { lte: 0 };
      }
    }

    const [total, products] = await Promise.all([
      prisma.product.count({ where }),
      prisma.product.findMany({
        where,
        include: {
          category: {
            select: { id: true, name: true, nameAr: true, slug: true },
          },
          variants: {
            select: { id: true, sku: true, price: true, stockCount: true, status: true, options: true },
          },
          _count: {
            select: { attributeValues: true },
          },
        },
        orderBy: { [sortField]: sortOrder },
        skip: (page - 1) * limit,
        take: limit,
      }),
    ]);

    const formattedProducts = products.map((p) => {
      const serialized = serializeAdminProduct(p);
      return {
        ...serialized,
        variantCount: p.variants.length,
        categoryName: p.category.name,
      };
    });

    const result = {
      products: formattedProducts,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };

    adminProductsCache.set(cacheKey, result);

    return apiSuccess(result, 200, {
      headers: { 'Cache-Control': 'private, s-maxage=30' },
    });
  } catch (error: any) {
    return handleApiError(error);
  }
}

export async function POST(request: Request) {
  const auth = await requireAdmin(request);
  if (!auth.authorized) return auth.response;

  try {
    const body = await request.json();

    // Validation
    if (!body.name || !body.sku || !body.categoryId || body.price === undefined) {
      return apiError('Product name, SKU, category, and price are required.', 400);
    }

    // Check SKU uniqueness
    const cleanSku = body.sku.trim().toUpperCase();
    const existing = await prisma.product.findUnique({
      where: { sku: cleanSku },
    });

    if (existing) {
      return apiError(`SKU '${cleanSku}' already exists. Please choose a unique SKU.`, 409);
    }

    // Ensure Category exists (lookup by id or slug)
    const category = await prisma.category.findFirst({
      where: {
        OR: [{ slug: body.categoryId }, { id: body.categoryId }],
      },
    });

    if (!category) {
      return apiError('Selected category does not exist.', 400);
    }

    const productId = body.id || 'prod-' + Date.now();
    const stockCount = Math.max(0, Number(body.stockCount) || 0);
    const priceNum = Number(body.price);
    const oldPriceNum = body.oldPrice ? Number(body.oldPrice) : null;
    const costPriceNum = body.costPrice ? Number(body.costPrice) : null;
    const comparePriceNum = body.compareAtPrice ? Number(body.compareAtPrice) : null;

    const discountPercentage =
      oldPriceNum && oldPriceNum > priceNum
        ? Math.round(((oldPriceNum - priceNum) / oldPriceNum) * 100)
        : null;

    const created = await prisma.product.create({
      data: {
        id: productId,
        name: body.name.trim(),
        nameAr: body.nameAr?.trim() || body.name.trim(),
        brand: body.brand?.trim() || 'General',
        categoryId: category.id,
        sku: cleanSku,
        barcode: body.barcode?.trim() || null,
        price: new Prisma.Decimal(priceNum),
        oldPrice: oldPriceNum ? new Prisma.Decimal(oldPriceNum) : null,
        costPrice: costPriceNum ? new Prisma.Decimal(costPriceNum) : null,
        compareAtPrice: comparePriceNum ? new Prisma.Decimal(comparePriceNum) : null,
        discountPercentage,
        inStock: stockCount > 0,
        stockCount,
        lowStockThreshold: Number(body.lowStockThreshold) || 5,
        trackInventory: body.trackInventory ?? true,
        allowBackorders: body.allowBackorders ?? false,
        shipsWithin: body.shipsWithin || 'Ships within 24 hours',
        shipsWithinAr: body.shipsWithinAr || 'يتم الشحن خلال 24 ساعة',
        isNew: body.isNew ?? true,
        isBestSeller: body.isBestSeller ?? false,
        isDeal: body.isDeal ?? false,
        status: body.status || 'active',
        weight: body.weight ? Number(body.weight) : null,
        thumbnail: body.thumbnail || '/images/products/placeholder.jpg',
        images: Array.isArray(body.images) ? body.images : [body.thumbnail || '/images/products/placeholder.jpg'],
        description: body.description || 'Enterprise grade IT hardware.',
        descriptionAr: body.descriptionAr || 'عتاد تقني معتمد للمؤسسات والأفراد.',
        specs: typeof body.specs === 'object' && body.specs !== null ? body.specs : {},
        specsAr: typeof body.specsAr === 'object' && body.specsAr !== null ? body.specsAr : null,
        features: Array.isArray(body.features) ? body.features : null,
        featuresAr: Array.isArray(body.featuresAr) ? body.featuresAr : null,
        seoTitle: body.seoTitle || null,
        metaDescription: body.metaDescription || null,
        searchKeywords: body.searchKeywords || null,
      },
      include: {
        category: true,
        variants: true,
      },
    });

    // 1. Save Dynamic Attribute Values (if provided in body.attributeValues)
    if (body.attributeValues && typeof body.attributeValues === 'object') {
      const entries: [string, any][] = Array.isArray(body.attributeValues)
        ? body.attributeValues.map((item: any) => [item?.attributeId, item?.textValue ?? item?.value])
        : Object.entries(body.attributeValues);

      for (const [attrId, val] of entries) {
        if (!attrId || val === null || val === undefined || val === '') continue;
        await prisma.productAttributeValue.create({
          data: {
            productId: created.id,
            attributeId: attrId,
            textValue: String(val),
          },
        }).catch(() => {});
      }
    }

    // 2. Save Variants (if provided in body.variants)
    if (Array.isArray(body.variants) && body.variants.length > 0) {
      for (const v of body.variants) {
        if (!v.sku || !v.price) continue;
        await prisma.productVariant.create({
          data: {
            productId: created.id,
            sku: v.sku.trim().toUpperCase(),
            price: new Prisma.Decimal(Number(v.price)),
            oldPrice: v.oldPrice ? new Prisma.Decimal(Number(v.oldPrice)) : null,
            costPrice: v.costPrice ? new Prisma.Decimal(Number(v.costPrice)) : null,
            stockCount: Number(v.stockCount) || 0,
            image: v.image || null,
            options: typeof v.options === 'object' && v.options !== null ? v.options : {},
            status: v.status || 'active',
          },
        }).catch(() => {});
      }
    }

    // 3. Record Initial Stock Movement
    if (stockCount > 0) {
      await prisma.inventoryTransaction.create({
        data: {
          productId: created.id,
          quantityDelta: stockCount,
          previousStock: 0,
          newStock: stockCount,
          reason: 'restock',
          createdById: auth.user.id,
          createdByName: auth.user.name,
        },
      });
    }

    // 4. Record Audit Log
    await prisma.auditLog.create({
      data: {
        userId: auth.user.id,
        userName: auth.user.name,
        userEmail: auth.user.email,
        action: 'PRODUCT_CREATE',
        entityType: 'Product',
        entityId: created.id,
        details: { name: created.name, sku: created.sku, price: priceNum, stock: stockCount },
      },
    });

    adminProductsCache.clear();

    return apiSuccess({ product: serializeAdminProduct(created) }, 201);
  } catch (error: any) {
    return handleApiError(error);
  }
}
