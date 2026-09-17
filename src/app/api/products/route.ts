import { prisma } from '@/lib/db';
import { requireAdmin } from '@/lib/auth-guard';
import { apiSuccess, apiError, handleApiError } from '@/lib/api-response';
import { serializeProduct } from '@/lib/product-helpers';
import { Prisma } from '@prisma/client';

let cachedCatalog: { products: any[]; categories: any[]; timestamp: number } | null = null;
const CATALOG_CACHE_TTL = 60 * 1000; // 60 seconds

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');
    const brand = searchParams.get('brand');
    const search = searchParams.get('q');
    const minPrice = searchParams.get('minPrice') ? Number(searchParams.get('minPrice')) : undefined;
    const maxPrice = searchParams.get('maxPrice') ? Number(searchParams.get('maxPrice')) : undefined;
    const inStockOnly = searchParams.get('inStock') === 'true';
    const sort = searchParams.get('sort') || 'default';

    // Pagination parameters (optional, defaults to returning full set if not specified for backwards compatibility)
    const pageParam = searchParams.get('page');
    const limitParam = searchParams.get('limit');
    const page = pageParam ? Math.max(1, Number(pageParam)) : undefined;
    const limit = limitParam ? Math.max(1, Math.min(100, Number(limitParam))) : undefined;

    // Collect dynamic attribute filters: params starting with "attr_"
    const attributeFilters: Record<string, string[]> = {};
    searchParams.forEach((value, key) => {
      if (key.startsWith('attr_') && value) {
        const attrSlug = key.replace('attr_', '').toLowerCase();
        attributeFilters[attrSlug] = value.split(',').map((v) => v.trim());
      }
    });

    const isDefaultQuery =
      (!category || category === 'all') &&
      !brand &&
      !search &&
      minPrice === undefined &&
      maxPrice === undefined &&
      !inStockOnly &&
      Object.keys(attributeFilters).length === 0 &&
      sort === 'default';

    const now = Date.now();
    if (isDefaultQuery && cachedCatalog && now - cachedCatalog.timestamp < CATALOG_CACHE_TTL) {
      return apiSuccess({
        count: cachedCatalog.products.length,
        categories: cachedCatalog.categories,
        products: cachedCatalog.products,
        cached: true,
      });
    }

    const where: any = {
      isArchived: false,
      status: 'active',
    };

    if (category && category !== 'all') {
      where.categoryId = category;
    }

    if (brand && brand !== 'all') {
      const brandsList = brand.split(',').map((b) => b.trim());
      if (brandsList.length === 1) {
        where.brand = { equals: brandsList[0], mode: 'insensitive' };
      } else {
        where.brand = { in: brandsList, mode: 'insensitive' };
      }
    }

    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { nameAr: { contains: search, mode: 'insensitive' } },
        { brand: { contains: search, mode: 'insensitive' } },
        { sku: { contains: search, mode: 'insensitive' } },
        { searchKeywords: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
      ];
    }

    if (minPrice !== undefined || maxPrice !== undefined) {
      where.price = {};
      if (minPrice !== undefined) where.price.gte = new Prisma.Decimal(minPrice);
      if (maxPrice !== undefined) where.price.lte = new Prisma.Decimal(maxPrice);
    }

    if (inStockOnly) {
      where.inStock = true;
      where.stockCount = { gt: 0 };
    }

    // Dynamic Attribute Filtering
    const filterEntries = Object.entries(attributeFilters);
    if (filterEntries.length > 0) {
      where.AND = filterEntries.map(([slug, values]) => {
        return {
          attributeValues: {
            some: {
              attribute: { slug: { equals: slug, mode: 'insensitive' } },
              textValue: { in: values, mode: 'insensitive' },
            },
          },
        };
      });
    }

    let orderBy: any = { createdAt: 'desc' };
    if (sort === 'price-asc') orderBy = { price: 'asc' };
    else if (sort === 'price-desc') orderBy = { price: 'desc' };
    else if (sort === 'newest') orderBy = { createdAt: 'desc' };
    else if (sort === 'oldest') orderBy = { createdAt: 'asc' };
    else if (sort === 'bestseller') orderBy = { isBestSeller: 'desc' };

    const [products, totalCount, categories] = await Promise.all([
      prisma.product.findMany({
        where,
        orderBy,
        skip: page && limit ? (page - 1) * limit : undefined,
        take: limit,
        include: {
          category: true,
          variants: true,
          attributeValues: {
            include: {
              attribute: true,
            },
          },
        },
      }),
      prisma.product.count({ where }),
      prisma.category.findMany({
        where: { isActive: true, isArchived: false },
        orderBy: [{ displayOrder: 'asc' }, { name: 'asc' }],
      }),
    ]);

    const parsedProducts = products.map(serializeProduct);

    if (isDefaultQuery && !page && !limit) {
      cachedCatalog = {
        products: parsedProducts,
        categories,
        timestamp: now,
      };
    }

    return apiSuccess(
      {
        count: parsedProducts.length,
        total: totalCount,
        page: page || 1,
        limit: limit || totalCount,
        totalPages: limit ? Math.ceil(totalCount / limit) : 1,
        categories,
        products: parsedProducts,
      },
      200,
      {
        headers: {
          'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=300',
        },
      }
    );
  } catch (error: any) {
    if (cachedCatalog) {
      return apiSuccess({
        count: cachedCatalog.products.length,
        categories: cachedCatalog.categories,
        products: cachedCatalog.products,
        cached: true,
      });
    }
    return handleApiError(error);
  }
}

export async function POST(request: Request) {
  const auth = await requireAdmin(request);
  if (!auth.authorized) return auth.response;

  try {
    const body = await request.json();

    if (!body.name || !body.price || !body.categoryId) {
      return apiError('Product name, price, and category are required.', 400);
    }

    // Verify category exists
    const category = await prisma.category.findFirst({
      where: {
        OR: [{ id: body.categoryId }, { slug: body.categoryId }],
      },
    });

    if (!category) {
      return apiError('Selected category does not exist.', 400);
    }

    const priceNum = Number(body.price);
    const oldPriceNum = body.oldPrice ? Number(body.oldPrice) : null;
    const discount = oldPriceNum && oldPriceNum > priceNum
      ? Math.round(((oldPriceNum - priceNum) / oldPriceNum) * 100)
      : null;

    const created = await prisma.product.create({
      data: {
        id: body.id || 'prod-' + Date.now(),
        name: body.name.trim(),
        nameAr: body.nameAr?.trim() || body.name.trim(),
        brand: body.brand?.trim() || 'General',
        categoryId: category.id,
        sku: body.sku?.trim().toUpperCase() || 'SKU-' + Date.now(),
        price: new Prisma.Decimal(priceNum),
        oldPrice: oldPriceNum ? new Prisma.Decimal(oldPriceNum) : null,
        discountPercentage: discount,
        inStock: body.inStock ?? true,
        stockCount: Number(body.stockCount) || 10,
        thumbnail: body.thumbnail || '/images/products/placeholder.jpg',
        images: Array.isArray(body.images) ? body.images : [body.thumbnail || '/images/products/placeholder.jpg'],
        description: body.description || '',
        descriptionAr: body.descriptionAr || '',
        specs: typeof body.specs === 'object' && body.specs !== null ? body.specs : {},
        specsAr: typeof body.specsAr === 'object' && body.specsAr !== null ? body.specsAr : null,
        features: Array.isArray(body.features) ? body.features : null,
        featuresAr: Array.isArray(body.featuresAr) ? body.featuresAr : null,
      },
      include: {
        category: true,
        variants: true,
      },
    });

    cachedCatalog = null;

    return apiSuccess({ product: serializeProduct(created) }, 201);
  } catch (error: any) {
    return handleApiError(error);
  }
}

