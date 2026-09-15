import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { requireAdmin } from '@/lib/auth-guard';

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
      return NextResponse.json({
        success: true,
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
      // Support comma-separated brands e.g. "dell,hp"
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
        { specs: { contains: search, mode: 'insensitive' } },
      ];
    }

    if (minPrice !== undefined || maxPrice !== undefined) {
      where.price = {};
      if (minPrice !== undefined) where.price.gte = minPrice;
      if (maxPrice !== undefined) where.price.lte = maxPrice;
    }

    if (inStockOnly) {
      where.inStock = true;
      where.stockCount = { gt: 0 };
    }

    // Dynamic Attribute Filtering (AND logic between attributes, OR logic between values of same attribute)
    const filterEntries = Object.entries(attributeFilters);
    if (filterEntries.length > 0) {
      where.AND = filterEntries.map(([slug, values]) => {
        return {
          OR: [
            // Match via EAV ProductAttributeValue relation
            {
              attributeValues: {
                some: {
                  attribute: { slug: { equals: slug, mode: 'insensitive' } },
                  textValue: { in: values, mode: 'insensitive' },
                },
              },
            },
            // Fallback: match via specs text
            ...values.map((v) => ({
              specs: { contains: v, mode: 'insensitive' },
            })),
          ],
        };
      });
    }

    let orderBy: any = { createdAt: 'desc' };
    if (sort === 'price-asc') orderBy = { price: 'asc' };
    else if (sort === 'price-desc') orderBy = { price: 'desc' };
    else if (sort === 'newest') orderBy = { createdAt: 'desc' };
    else if (sort === 'oldest') orderBy = { createdAt: 'asc' };
    else if (sort === 'bestseller') orderBy = { isBestSeller: 'desc' };

    const [products, categories] = await Promise.all([
      prisma.product.findMany({
        where,
        orderBy,
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
      prisma.category.findMany({
        where: { isActive: true, isArchived: false },
        orderBy: [{ displayOrder: 'asc' }, { name: 'asc' }],
      }),
    ]);

    // Parse JSON fields
    const parsedProducts = products.map((p) => {
      const cat = p.category as any;
      let parsedImages = [];
      let parsedSpecs = {};
      let parsedSpecsAr = undefined;
      let parsedFeatures = undefined;
      let parsedFeaturesAr = undefined;
      let parsedRamOptions = undefined;
      let parsedStorageOptions = undefined;
      let parsedWarrantyOptions = undefined;

      try {
        parsedImages = JSON.parse(p.images || '[]');
        parsedSpecs = JSON.parse(p.specs || '{}');
        if (p.specsAr) parsedSpecsAr = JSON.parse(p.specsAr);
        if (p.features) parsedFeatures = JSON.parse(p.features);
        if (p.featuresAr) parsedFeaturesAr = JSON.parse(p.featuresAr);
        if (p.ramOptions) parsedRamOptions = JSON.parse(p.ramOptions);
        if (p.storageOptions) parsedStorageOptions = JSON.parse(p.storageOptions);
        if (p.warrantyOptions) parsedWarrantyOptions = JSON.parse(p.warrantyOptions);
      } catch {}

      const formattedVariants = p.variants.map((v) => {
        let opt = {};
        try {
          opt = JSON.parse(v.options || '{}');
        } catch {}
        return { ...v, options: opt };
      });

      return {
        ...p,
        category: cat?.name || p.categoryId,
        categorySlug: cat?.slug || p.categoryId,
        categoryNameAr: cat?.nameAr,
        images: parsedImages,
        specs: parsedSpecs,
        specsAr: parsedSpecsAr,
        features: parsedFeatures,
        featuresAr: parsedFeaturesAr,
        ramOptions: parsedRamOptions,
        storageOptions: parsedStorageOptions,
        warrantyOptions: parsedWarrantyOptions,
        variants: formattedVariants,
        monthlyInstallment: p.monthlyValu
          ? {
              valuPrice: p.monthlyValu,
              amanPrice: p.monthlyAman || p.monthlyValu,
              months: 24,
            }
          : undefined,
      };
    });

    if (isDefaultQuery) {
      cachedCatalog = {
        products: parsedProducts,
        categories,
        timestamp: now,
      };
    }

    return NextResponse.json(
      {
        success: true,
        count: parsedProducts.length,
        categories,
        products: parsedProducts,
      },
      {
        headers: {
          'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=300',
        },
      }
    );
  } catch (error: any) {
    if (cachedCatalog) {
      return NextResponse.json({
        success: true,
        count: cachedCatalog.products.length,
        categories: cachedCatalog.categories,
        products: cachedCatalog.products,
        cached: true,
      });
    }
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const auth = await requireAdmin(request);
  if (!auth.authorized) return auth.response;

  try {
    const body = await request.json();
    const created = await prisma.product.create({
      data: {
        id: body.id || 'prod-' + Date.now(),
        name: body.name,
        nameAr: body.nameAr || body.name,
        brand: body.brand,
        categoryId: body.categorySlug || body.categoryId,
        subCategory: body.subCategory || null,
        sku: body.sku || 'SKU-' + Date.now(),
        price: Number(body.price),
        oldPrice: body.oldPrice ? Number(body.oldPrice) : null,
        discountPercentage: body.discountPercentage ? Number(body.discountPercentage) : null,
        inStock: body.inStock ?? true,
        stockCount: body.stockCount || 10,
        thumbnail: body.thumbnail,
        images: JSON.stringify(body.images || [body.thumbnail]),
        description: body.description || '',
        descriptionAr: body.descriptionAr || '',
        specs: JSON.stringify(body.specs || {}),
        specsAr: body.specsAr ? JSON.stringify(body.specsAr) : null,
      },
    });

    // Invalidate catalog memory cache
    cachedCatalog = null;

    return NextResponse.json({ success: true, product: created }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
