import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { requireAdmin } from '@/lib/auth-guard';
import { attributesCache } from '@/lib/server-cache';

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  const auth = await requireAdmin(request);
  if (!auth.authorized) return auth.response;

  try {
    const { id } = params;
    const body = await request.json();

    const existing = await prisma.attribute.findUnique({
      where: { id },
    });

    if (!existing) {
      return NextResponse.json({ success: false, error: 'Attribute not found' }, { status: 404 });
    }

    const updated = await prisma.attribute.update({
      where: { id },
      data: {
        name: body.name !== undefined ? body.name.trim() : undefined,
        nameAr: body.nameAr !== undefined ? body.nameAr.trim() : undefined,
        type: body.type !== undefined ? body.type : undefined,
        unit: body.unit !== undefined ? body.unit : undefined,
        groupId: body.groupId !== undefined ? body.groupId : undefined,
        options:
          body.options !== undefined
            ? Array.isArray(body.options)
              ? JSON.stringify(body.options)
              : body.options
            : undefined,
      },
      include: { group: true },
    });

    // Audit Log
    await prisma.auditLog.create({
      data: {
        userId: auth.user.id,
        userName: auth.user.name,
        userEmail: auth.user.email,
        action: 'ATTRIBUTE_UPDATE',
        entityType: 'Attribute',
        entityId: updated.id,
        details: JSON.stringify({ slug: updated.slug, changes: body }),
      },
    });

    attributesCache.clear();

    return NextResponse.json({ success: true, attribute: updated });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  const auth = await requireAdmin(request);
  if (!auth.authorized) return auth.response;

  try {
    const { id } = params;

    const existing = await prisma.attribute.findUnique({
      where: { id },
      include: {
        _count: {
          select: { productValues: true, categoryAssignments: true },
        },
      },
    });

    if (!existing) {
      return NextResponse.json({ success: false, error: 'Attribute not found' }, { status: 404 });
    }

    if (existing._count.productValues > 0) {
      return NextResponse.json(
        {
          success: false,
          error: `Cannot delete attribute: it is currently used in specifications by ${existing._count.productValues} products.`,
        },
        { status: 400 }
      );
    }

    await prisma.attribute.delete({
      where: { id },
    });

    // Audit Log
    await prisma.auditLog.create({
      data: {
        userId: auth.user.id,
        userName: auth.user.name,
        userEmail: auth.user.email,
        action: 'ATTRIBUTE_DELETE',
        entityType: 'Attribute',
        entityId: id,
        details: JSON.stringify({ slug: existing.slug, name: existing.name }),
      },
    });

    attributesCache.clear();

    return NextResponse.json({ success: true, message: `Attribute ${existing.name} deleted successfully.` });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
