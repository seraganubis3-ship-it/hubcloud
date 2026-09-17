import { prisma } from '@/lib/db';
import { requireAdmin } from '@/lib/auth-guard';
import { adminProductsCache, categoryFiltersCache } from '@/lib/server-cache';
import { apiSuccess, apiError, handleApiError } from '@/lib/api-response';
import { serializeAdminProduct } from '@/lib/product-helpers';
import { Prisma } from '@prisma/client';

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  const auth = await requireAdmin(request);
  if (!auth.authorized) return auth.response;

  try {
    const { id } = params;

    const product = await prisma.product.findUnique({
      where: { id },
      include: {
        category: true,
        attributeValues: {
          include: {
            attribute: {
              include: { group: true },
            },
          },
        },
        variants: true,
        inventoryTransactions: {
          orderBy: { createdAt: 'desc' },
          take: 10,
        },
      },
    });

    if (!product) {
      return apiError('Product not found', 404);
    }

    return apiSuccess({ product: serializeAdminProduct(product) });
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

    const existing = await prisma.product.findUnique({
      where: { id },
    });

    if (!existing) {
      return apiError('Product not found', 404);
    }

    let targetCategoryId = existing.categoryId;
    if (body.categoryId !== undefined) {
      const cat = await prisma.category.findFirst({
        where: {
          OR: [{ id: body.categoryId }, { slug: body.categoryId }],
        },
      });
      if (cat) {
        targetCategoryId = cat.id;
      }
    }

    const previousStock = existing.stockCount;
    const newStock = body.stockCount !== undefined ? Number(body.stockCount) : previousStock;

    // Price and discount calculation
    const priceNum = body.price !== undefined ? Number(body.price) : Number(existing.price);
    const oldPriceNum = body.oldPrice !== undefined
      ? (body.oldPrice ? Number(body.oldPrice) : null)
      : (existing.oldPrice ? Number(existing.oldPrice) : null);
    const discountPercentage =
      oldPriceNum && oldPriceNum > priceNum ? Math.round(((oldPriceNum - priceNum) / oldPriceNum) * 100) : null;

    const updated = await prisma.product.update({
      where: { id },
      data: {
        name: body.name !== undefined ? body.name.trim() : undefined,
        nameAr: body.nameAr !== undefined ? body.nameAr.trim() : undefined,
        brand: body.brand !== undefined ? body.brand.trim() : undefined,
        categoryId: targetCategoryId,
        sku: body.sku !== undefined ? body.sku.trim().toUpperCase() : undefined,
        barcode: body.barcode !== undefined ? body.barcode : undefined,
        price: body.price !== undefined ? new Prisma.Decimal(priceNum) : undefined,
        oldPrice: body.oldPrice !== undefined ? (oldPriceNum ? new Prisma.Decimal(oldPriceNum) : null) : undefined,
        costPrice: body.costPrice !== undefined ? (body.costPrice ? new Prisma.Decimal(Number(body.costPrice)) : null) : undefined,
        compareAtPrice: body.compareAtPrice !== undefined ? (body.compareAtPrice ? new Prisma.Decimal(Number(body.compareAtPrice)) : null) : undefined,
        discountPercentage,
        inStock: newStock > 0,
        stockCount: newStock,
        lowStockThreshold: body.lowStockThreshold !== undefined ? Number(body.lowStockThreshold) : undefined,
        trackInventory: body.trackInventory !== undefined ? Boolean(body.trackInventory) : undefined,
        allowBackorders: body.allowBackorders !== undefined ? Boolean(body.allowBackorders) : undefined,
        shipsWithin: body.shipsWithin !== undefined ? body.shipsWithin : undefined,
        shipsWithinAr: body.shipsWithinAr !== undefined ? body.shipsWithinAr : undefined,
        isNew: body.isNew !== undefined ? Boolean(body.isNew) : undefined,
        isBestSeller: body.isBestSeller !== undefined ? Boolean(body.isBestSeller) : undefined,
        isDeal: body.isDeal !== undefined ? Boolean(body.isDeal) : undefined,
        status: body.status !== undefined ? body.status : undefined,
        weight: body.weight !== undefined ? Number(body.weight) : undefined,
        thumbnail: body.thumbnail !== undefined ? body.thumbnail : undefined,
        images:
          body.images !== undefined
            ? Array.isArray(body.images) ? body.images : [body.thumbnail || '/images/products/placeholder.jpg']
            : undefined,
        description: body.description !== undefined ? body.description : undefined,
        descriptionAr: body.descriptionAr !== undefined ? body.descriptionAr : undefined,
        specs:
          body.specs !== undefined
            ? typeof body.specs === 'object' && body.specs !== null ? body.specs : {}
            : undefined,
        specsAr:
          body.specsAr !== undefined
            ? typeof body.specsAr === 'object' && body.specsAr !== null ? body.specsAr : null
            : undefined,
        features:
          body.features !== undefined
            ? Array.isArray(body.features) ? body.features : null
            : undefined,
        featuresAr:
          body.featuresAr !== undefined
            ? Array.isArray(body.featuresAr) ? body.featuresAr : null
            : undefined,
        seoTitle: body.seoTitle !== undefined ? body.seoTitle : undefined,
        metaDescription: body.metaDescription !== undefined ? body.metaDescription : undefined,
        searchKeywords: body.searchKeywords !== undefined ? body.searchKeywords : undefined,
      },
      include: {
        category: true,
        variants: true,
      },
    });

    // 1. If stock changed, log transaction
    if (newStock !== previousStock) {
      await prisma.inventoryTransaction.create({
        data: {
          productId: updated.id,
          quantityDelta: newStock - previousStock,
          previousStock,
          newStock,
          reason: 'adjustment',
          createdById: auth.user.id,
          createdByName: auth.user.name,
        },
      });
    }

    // 2. Sync Dynamic Attribute Values
    if (body.attributeValues && typeof body.attributeValues === 'object') {
      const entries: [string, any][] = Array.isArray(body.attributeValues)
        ? body.attributeValues.map((item: any) => [item?.attributeId, item?.textValue ?? item?.value])
        : Object.entries(body.attributeValues);

      for (const [attrId, val] of entries) {
        if (!attrId) continue;
        if (val === null || val === undefined || val === '') {
          await prisma.productAttributeValue
            .deleteMany({
              where: { productId: id, attributeId: attrId },
            })
            .catch(() => {});
        } else {
          await prisma.productAttributeValue.upsert({
            where: { productId_attributeId: { productId: id, attributeId: attrId } },
            update: { textValue: String(val) },
            create: { productId: id, attributeId: attrId, textValue: String(val) },
          });
        }
      }
    }

    // 3. Sync Variants if passed
    if (Array.isArray(body.variants)) {
      for (const v of body.variants) {
        if (!v.sku || !v.price) continue;
        const vPrice = new Prisma.Decimal(Number(v.price));
        const vOldPrice = v.oldPrice ? new Prisma.Decimal(Number(v.oldPrice)) : null;
        const vCostPrice = v.costPrice ? new Prisma.Decimal(Number(v.costPrice)) : null;
        const vOpts = typeof v.options === 'object' && v.options !== null ? v.options : {};

        if (v.id) {
          await prisma.productVariant.update({
            where: { id: v.id },
            data: {
              sku: v.sku.trim().toUpperCase(),
              price: vPrice,
              oldPrice: vOldPrice,
              costPrice: vCostPrice,
              stockCount: Number(v.stockCount) || 0,
              image: v.image || null,
              options: vOpts,
              status: v.status || 'active',
            },
          }).catch(() => {});
        } else {
          await prisma.productVariant.create({
            data: {
              productId: id,
              sku: v.sku.trim().toUpperCase(),
              price: vPrice,
              oldPrice: vOldPrice,
              costPrice: vCostPrice,
              stockCount: Number(v.stockCount) || 0,
              image: v.image || null,
              options: vOpts,
              status: v.status || 'active',
            },
          }).catch(() => {});
        }
      }
    }

    // 4. Audit Log
    await prisma.auditLog.create({
      data: {
        userId: auth.user.id,
        userName: auth.user.name,
        userEmail: auth.user.email,
        action: 'PRODUCT_UPDATE',
        entityType: 'Product',
        entityId: updated.id,
        details: {
          updatedFields: Object.keys(body),
          priceChange: previousStock !== newStock ? { oldStock: previousStock, newStock } : null,
        },
      },
    });

    adminProductsCache.clear();
    categoryFiltersCache.delete(updated.categoryId.toLowerCase());

    return apiSuccess({ product: serializeAdminProduct(updated) });
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
    const { searchParams } = new URL(request.url);
    const hardDelete = searchParams.get('hard') === 'true';

    const existing = await prisma.product.findUnique({
      where: { id },
    });

    if (!existing) {
      return apiError('Product not found', 404);
    }

    // If soft delete (default)
    if (!hardDelete) {
      await prisma.product.update({
        where: { id },
        data: {
          isArchived: true,
          status: 'archived',
        },
      });

      await prisma.auditLog.create({
        data: {
          userId: auth.user.id,
          userName: auth.user.name,
          userEmail: auth.user.email,
          action: 'PRODUCT_ARCHIVE',
          entityType: 'Product',
          entityId: id,
          details: { name: existing.name, sku: existing.sku },
        },
      });

      adminProductsCache.clear();
      categoryFiltersCache.delete(existing.categoryId.toLowerCase());

      return apiSuccess({ message: `Product ${existing.name} has been safely archived.` });
    }

    // Hard delete
    await prisma.product.delete({
      where: { id },
    });

    await prisma.auditLog.create({
      data: {
        userId: auth.user.id,
        userName: auth.user.name,
        userEmail: auth.user.email,
        action: 'PRODUCT_DELETE',
        entityType: 'Product',
        entityId: id,
        details: { name: existing.name, sku: existing.sku },
      },
    });

    adminProductsCache.clear();
    categoryFiltersCache.delete(existing.categoryId.toLowerCase());

    return apiSuccess({ message: `Product ${existing.name} deleted completely.` });
  } catch (error: any) {
    return handleApiError(error);
  }
}
