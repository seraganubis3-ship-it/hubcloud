import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { requireAdmin } from '@/lib/auth-guard';
import { categoriesListCache } from '@/lib/server-cache';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const includeAll = searchParams.get('all') === 'true'; // For admin, show inactive too
  const cacheKey = includeAll ? '__all__' : '__active__';

  const cached = categoriesListCache.get(cacheKey);
  if (cached) {
    return NextResponse.json(
      { success: true, categories: cached, cached: true },
      { headers: { 'Cache-Control': includeAll ? 'private, s-maxage=30' : 'public, s-maxage=60, stale-while-revalidate=300' } }
    );
  }

  try {
    const whereClause: any = includeAll ? {} : { isActive: true, isArchived: false };

    const categories = await prisma.category.findMany({
      where: whereClause,
      include: {
        _count: {
          select: { products: true, assignedAttributes: true },
        },
      },
      orderBy: [{ displayOrder: 'asc' }, { name: 'asc' }],
    });

    const formatted = categories.map((cat) => ({
      ...cat,
      itemCount: cat._count.products || cat.itemCount || 0,
      assignedAttributesCount: cat._count.assignedAttributes || 0,
    }));

    categoriesListCache.set(cacheKey, formatted);

    return NextResponse.json(
      {
        success: true,
        categories: formatted,
      },
      {
        headers: {
          'Cache-Control': includeAll ? 'private, s-maxage=30' : 'public, s-maxage=60, stale-while-revalidate=300',
        },
      }
    );
  } catch (error: any) {
    const fallback = categoriesListCache.get(cacheKey);
    if (fallback) {
      return NextResponse.json({ success: true, categories: fallback, cached: true });
    }
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const auth = await requireAdmin(request);
  if (!auth.authorized) return auth.response;

  try {
    const body = await request.json();

    if (!body.name || !body.slug) {
      return NextResponse.json(
        { success: false, error: 'Category name and slug are required' },
        { status: 400 }
      );
    }

    const cleanSlug = body.slug.toLowerCase().trim().replace(/[^a-z0-9-]+/g, '-');

    // Check slug uniqueness
    const existing = await prisma.category.findUnique({
      where: { slug: cleanSlug },
    });

    if (existing) {
      return NextResponse.json(
        { success: false, error: 'A category with this slug already exists.' },
        { status: 409 }
      );
    }

    const created = await prisma.category.create({
      data: {
        id: body.id || cleanSlug,
        name: body.name.trim(),
        nameAr: body.nameAr?.trim() || body.name.trim(),
        slug: cleanSlug,
        image: body.image || '/images/category_laptops.jpg',
        banner: body.banner || null,
        iconName: body.iconName || null,
        description: body.description || null,
        descriptionAr: body.descriptionAr || null,
        isActive: body.isActive ?? true,
        isFeatured: body.isFeatured ?? false,
        displayOrder: Number(body.displayOrder) || 0,
        seoTitle: body.seoTitle || null,
        seoDescription: body.seoDescription || null,
        seoKeywords: body.seoKeywords || null,
        itemCount: 0,
      },
    });

    // Invalidate memory cache
    categoriesListCache.clear();

    // Log Audit
    await prisma.auditLog.create({
      data: {
        userId: auth.user.id,
        userName: auth.user.name,
        userEmail: auth.user.email,
        action: 'CATEGORY_CREATE',
        entityType: 'Category',
        entityId: created.id,
        details: JSON.stringify({ slug: created.slug, name: created.name }),
      },
    });

    categoriesListCache.clear();

    return NextResponse.json({ success: true, category: created }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
