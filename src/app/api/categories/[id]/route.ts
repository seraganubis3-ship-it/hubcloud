import { prisma } from '@/lib/db';
import { requireAdmin } from '@/lib/auth-guard';
import { categoriesListCache, categoryFiltersCache } from '@/lib/server-cache';
import { apiSuccess, apiError, handleApiError } from '@/lib/api-response';

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;

    const category = await prisma.category.findFirst({
      where: {
        OR: [{ id }, { slug: id }],
      },
      include: {
        _count: {
          select: { products: true, assignedAttributes: true },
        },
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
      return apiError('Category not found', 404);
    }

    return apiSuccess({ category });
  } catch (error: any) {
    return handleApiError(error);
  }
}

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  const auth = await requireAdmin(request);
  if (!auth.authorized) return auth.response;

  try {
    const { id } = params;
    const body = await request.json();

    const existing = await prisma.category.findFirst({
      where: { OR: [{ id }, { slug: id }] },
    });

    if (!existing) {
      return apiError('Category not found', 404);
    }

    const updated = await prisma.category.update({
      where: { id: existing.id },
      data: {
        name: body.name !== undefined ? body.name.trim() : undefined,
        nameAr: body.nameAr !== undefined ? body.nameAr.trim() : undefined,
        image: body.image !== undefined ? body.image : undefined,
        banner: body.banner !== undefined ? body.banner : undefined,
        iconName: body.iconName !== undefined ? body.iconName : undefined,
        description: body.description !== undefined ? body.description : undefined,
        descriptionAr: body.descriptionAr !== undefined ? body.descriptionAr : undefined,
        isActive: body.isActive !== undefined ? Boolean(body.isActive) : undefined,
        isFeatured: body.isFeatured !== undefined ? Boolean(body.isFeatured) : undefined,
        displayOrder: body.displayOrder !== undefined ? Number(body.displayOrder) : undefined,
        seoTitle: body.seoTitle !== undefined ? body.seoTitle : undefined,
        seoDescription: body.seoDescription !== undefined ? body.seoDescription : undefined,
        seoKeywords: body.seoKeywords !== undefined ? body.seoKeywords : undefined,
      },
    });

    // Audit Log
    await prisma.auditLog.create({
      data: {
        userId: auth.user.id,
        userName: auth.user.name,
        userEmail: auth.user.email,
        action: 'CATEGORY_UPDATE',
        entityType: 'Category',
        entityId: updated.id,
        details: { changes: body, updatedBy: auth.user.email },
      },
    });

    categoriesListCache.clear();
    categoryFiltersCache.delete(updated.slug.toLowerCase());

    return apiSuccess({ category: updated });
  } catch (error: any) {
    return handleApiError(error);
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

    const cat = await prisma.category.findFirst({
      where: { OR: [{ id }, { slug: id }] },
      include: {
        _count: {
          select: { products: true },
        },
      },
    });

    if (!cat) {
      return apiError('Category not found', 404);
    }

    if (cat._count.products > 0) {
      return apiError(
        `Cannot delete category: it currently contains ${cat._count.products} products. Please reassign or delete the products first.`,
        400
      );
    }

    await prisma.category.delete({
      where: { id: cat.id },
    });

    // Audit Log
    await prisma.auditLog.create({
      data: {
        userId: auth.user.id,
        userName: auth.user.name,
        userEmail: auth.user.email,
        action: 'CATEGORY_DELETE',
        entityType: 'Category',
        entityId: cat.id,
        details: { deletedCategory: cat.name, slug: cat.slug },
      },
    });

    categoriesListCache.clear();
    categoryFiltersCache.delete(cat.slug.toLowerCase());

    return apiSuccess({ message: `Category ${cat.name} deleted successfully` });
  } catch (error: any) {
    return handleApiError(error);
  }
}
