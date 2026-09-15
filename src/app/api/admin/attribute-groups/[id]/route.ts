import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { requireAdmin } from '@/lib/auth-guard';
import { attributeGroupsCache, attributesCache, categoryFiltersCache } from '@/lib/server-cache';

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  const auth = await requireAdmin(request);
  if (!auth.authorized) return auth.response;

  try {
    const { id } = params;
    const body = await request.json();

    const existing = await prisma.attributeGroup.findUnique({
      where: { id },
    });

    if (!existing) {
      return NextResponse.json({ success: false, error: 'Attribute group not found' }, { status: 404 });
    }

    const updated = await prisma.attributeGroup.update({
      where: { id },
      data: {
        name: body.name !== undefined ? body.name.trim() : undefined,
        nameAr: body.nameAr !== undefined ? body.nameAr.trim() : undefined,
        displayOrder: body.displayOrder !== undefined ? Number(body.displayOrder) : undefined,
      },
    });

    attributeGroupsCache.clear();
    attributesCache.clear();
    categoryFiltersCache.clear();

    await prisma.auditLog.create({
      data: {
        userId: auth.user.id,
        userName: auth.user.name,
        userEmail: auth.user.email,
        action: 'ATTRIBUTE_GROUP_UPDATE',
        entityType: 'AttributeGroup',
        entityId: id,
        details: JSON.stringify({ name: updated.name, changes: body }),
      },
    });

    return NextResponse.json({ success: true, group: updated });
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

    const existing = await prisma.attributeGroup.findUnique({
      where: { id },
      include: {
        attributes: {
          select: { id: true, name: true },
        },
      },
    });

    if (!existing) {
      return NextResponse.json({ success: false, error: 'Attribute group not found' }, { status: 404 });
    }

    // Delete the group (schema has onDelete: Cascade for attributes)
    await prisma.attributeGroup.delete({
      where: { id },
    });

    // Invalidate all related caches
    attributeGroupsCache.clear();
    attributesCache.clear();
    categoryFiltersCache.clear();

    await prisma.auditLog.create({
      data: {
        userId: auth.user.id,
        userName: auth.user.name,
        userEmail: auth.user.email,
        action: 'ATTRIBUTE_GROUP_DELETE',
        entityType: 'AttributeGroup',
        entityId: id,
        details: JSON.stringify({
          deletedGroupName: existing.name,
          deletedAttributesCount: existing.attributes.length,
        }),
      },
    });

    return NextResponse.json({
      success: true,
      message: `Group "${existing.name}" and its specifications were successfully deleted.`,
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
