import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { requireAdmin } from '@/lib/auth-guard';
import { attributesCache } from '@/lib/server-cache';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const groupId = searchParams.get('groupId') || 'all';

    const cached = attributesCache.get(groupId);
    if (cached) {
      return NextResponse.json(cached, {
        headers: { 'Cache-Control': 'private, s-maxage=60' },
      });
    }

    const where: any = {};
    if (groupId) {
      where.groupId = groupId;
    }

    const attributes = await prisma.attribute.findMany({
      where,
      include: {
        group: true,
        _count: {
          select: {
            categoryAssignments: true,
            productValues: true,
          },
        },
      },
      orderBy: [{ group: { displayOrder: 'asc' } }, { name: 'asc' }],
    });

    const formatted = attributes.map((a) => {
      let parsedOptions: string[] = [];
      try {
        parsedOptions = a.options ? JSON.parse(a.options) : [];
      } catch {}

      return {
        ...a,
        options: parsedOptions,
        assignedCategoriesCount: a._count.categoryAssignments,
        productsUsingCount: a._count.productValues,
      };
    });

    const result = { success: true, attributes: formatted };
    attributesCache.set(groupId, result);

    return NextResponse.json(result, {
      headers: { 'Cache-Control': 'private, s-maxage=60' },
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const auth = await requireAdmin(request);
  if (!auth.authorized) return auth.response;

  try {
    const body = await request.json();

    if (!body.name || !body.slug || !body.groupId) {
      return NextResponse.json(
        { success: false, error: 'Attribute name, slug, and attribute group are required.' },
        { status: 400 }
      );
    }

    const cleanSlug = body.slug.toLowerCase().trim().replace(/[^a-z0-9_]+/g, '_');

    // Check slug uniqueness
    const existing = await prisma.attribute.findUnique({
      where: { slug: cleanSlug },
    });

    if (existing) {
      return NextResponse.json(
        { success: false, error: 'An attribute with this slug already exists.' },
        { status: 409 }
      );
    }

    const created = await prisma.attribute.create({
      data: {
        name: body.name.trim(),
        nameAr: body.nameAr?.trim() || body.name.trim(),
        slug: cleanSlug,
        type: body.type || 'select',
        unit: body.unit || null,
        groupId: body.groupId,
        options: Array.isArray(body.options) ? JSON.stringify(body.options) : body.options || null,
      },
      include: { group: true },
    });

    // Audit Log
    await prisma.auditLog.create({
      data: {
        userId: auth.user.id,
        userName: auth.user.name,
        userEmail: auth.user.email,
        action: 'ATTRIBUTE_CREATE',
        entityType: 'Attribute',
        entityId: created.id,
        details: JSON.stringify({ slug: created.slug, name: created.name }),
      },
    });

    attributesCache.clear();

    return NextResponse.json({ success: true, attribute: created }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
