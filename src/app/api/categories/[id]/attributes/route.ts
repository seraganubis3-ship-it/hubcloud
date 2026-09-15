import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { requireAdmin } from '@/lib/auth-guard';

// GET /api/categories/[id]/attributes
export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;

    const category = await prisma.category.findFirst({
      where: { OR: [{ id }, { slug: id }] },
      include: {
        assignedAttributes: {
          include: {
            attribute: {
              include: {
                group: true,
              },
            },
          },
          orderBy: { displayOrder: 'asc' },
        },
      },
    });

    if (!category) {
      return NextResponse.json({ success: false, error: 'Category not found' }, { status: 404 });
    }

    // Also get all available attributes in system
    const allAttributes = await prisma.attribute.findMany({
      include: { group: true },
      orderBy: [{ group: { displayOrder: 'asc' } }, { name: 'asc' }],
    });

    return NextResponse.json({
      success: true,
      category,
      assignedAttributes: category.assignedAttributes,
      availableAttributes: allAttributes,
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

// POST /api/categories/[id]/attributes (Assign or update attributes)
export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  const auth = await requireAdmin(request);
  if (!auth.authorized) return auth.response;

  try {
    const { id } = params;
    const body = await request.json();
    // body can be single assignment or array of assignments: { attributeId, isRequired, isFilterable, isVariantOption, displayOrder }
    const assignments = Array.isArray(body.assignments) ? body.assignments : [body];

    const category = await prisma.category.findFirst({
      where: { OR: [{ id }, { slug: id }] },
    });

    if (!category) {
      return NextResponse.json({ success: false, error: 'Category not found' }, { status: 404 });
    }

    const results = [];
    for (const item of assignments) {
      if (!item.attributeId) continue;

      const record = await prisma.categoryAttribute.upsert({
        where: {
          categoryId_attributeId: {
            categoryId: category.id,
            attributeId: item.attributeId,
          },
        },
        update: {
          isRequired: item.isRequired !== undefined ? Boolean(item.isRequired) : undefined,
          isFilterable: item.isFilterable !== undefined ? Boolean(item.isFilterable) : undefined,
          isSearchable: item.isSearchable !== undefined ? Boolean(item.isSearchable) : undefined,
          isComparable: item.isComparable !== undefined ? Boolean(item.isComparable) : undefined,
          isVisibleOnProductPage: item.isVisibleOnProductPage !== undefined ? Boolean(item.isVisibleOnProductPage) : undefined,
          isVariantOption: item.isVariantOption !== undefined ? Boolean(item.isVariantOption) : undefined,
          displayOrder: item.displayOrder !== undefined ? Number(item.displayOrder) : undefined,
        },
        create: {
          categoryId: category.id,
          attributeId: item.attributeId,
          isRequired: Boolean(item.isRequired),
          isFilterable: item.isFilterable !== undefined ? Boolean(item.isFilterable) : true,
          isSearchable: item.isSearchable !== undefined ? Boolean(item.isSearchable) : true,
          isComparable: item.isComparable !== undefined ? Boolean(item.isComparable) : true,
          isVisibleOnProductPage: item.isVisibleOnProductPage !== undefined ? Boolean(item.isVisibleOnProductPage) : true,
          isVariantOption: Boolean(item.isVariantOption),
          displayOrder: Number(item.displayOrder) || 0,
        },
      });
      results.push(record);
    }

    return NextResponse.json({ success: true, count: results.length, assignments: results });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

// DELETE /api/categories/[id]/attributes?attributeId=xxx
export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  const auth = await requireAdmin(request);
  if (!auth.authorized) return auth.response;

  try {
    const { id } = params;
    const { searchParams } = new URL(request.url);
    const attributeId = searchParams.get('attributeId');

    if (!attributeId) {
      return NextResponse.json({ success: false, error: 'attributeId is required' }, { status: 400 });
    }

    const category = await prisma.category.findFirst({
      where: { OR: [{ id }, { slug: id }] },
    });

    if (!category) {
      return NextResponse.json({ success: false, error: 'Category not found' }, { status: 404 });
    }

    await prisma.categoryAttribute.deleteMany({
      where: {
        categoryId: category.id,
        attributeId,
      },
    });

    return NextResponse.json({ success: true, message: 'Attribute unassigned from category' });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
