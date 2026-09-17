import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { requireAdmin } from '@/lib/auth-guard';
import { Prisma } from '@prisma/client';

export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  const auth = await requireAdmin(request);
  if (!auth.authorized) return auth.response;

  try {
    const { id } = params;

    const original = await prisma.product.findUnique({
      where: { id },
      include: {
        attributeValues: true,
        variants: true,
      },
    });

    if (!original) {
      return NextResponse.json({ success: false, error: 'Product not found' }, { status: 404 });
    }

    const newId = 'prod-' + Date.now();
    const newSku = original.sku + '-COPY-' + Math.floor(1000 + Math.random() * 9000);

    const duplicated = await prisma.product.create({
      data: {
        id: newId,
        name: original.name + ' (Copy)',
        nameAr: original.nameAr + ' (نسخة)',
        brand: original.brand,
        categoryId: original.categoryId,
        sku: newSku,
        barcode: null,
        price: original.price,
        oldPrice: original.oldPrice,
        costPrice: original.costPrice,
        compareAtPrice: original.compareAtPrice,
        discountPercentage: original.discountPercentage,
        inStock: false,
        stockCount: 0, // Reset stock safely on duplication
        lowStockThreshold: original.lowStockThreshold,
        trackInventory: original.trackInventory,
        allowBackorders: original.allowBackorders,
        shipsWithin: original.shipsWithin,
        shipsWithinAr: original.shipsWithinAr,
        isNew: true,
        isBestSeller: false,
        isDeal: false,
        status: 'draft', // Saved as draft initially
        weight: original.weight,
        thumbnail: original.thumbnail,
        images: (original.images as Prisma.InputJsonValue) ?? [],
        description: original.description,
        descriptionAr: original.descriptionAr,
        specs: (original.specs as Prisma.InputJsonValue) ?? {},
        specsAr: original.specsAr ? (original.specsAr as Prisma.InputJsonValue) : Prisma.JsonNull,
        features: original.features ? (original.features as Prisma.InputJsonValue) : Prisma.JsonNull,
        featuresAr: original.featuresAr ? (original.featuresAr as Prisma.InputJsonValue) : Prisma.JsonNull,
        seoTitle: original.seoTitle ? original.seoTitle + ' - Copy' : null,
        metaDescription: original.metaDescription,
        searchKeywords: original.searchKeywords,
      },
    });

    // Copy Attribute Values
    for (const pav of original.attributeValues) {
      await prisma.productAttributeValue.create({
        data: {
          productId: duplicated.id,
          attributeId: pav.attributeId,
          textValue: pav.textValue,
          numberValue: pav.numberValue,
          booleanValue: pav.booleanValue,
          jsonValue: pav.jsonValue,
        },
      }).catch(() => {});
    }

    // Copy Variant structures (with new unique SKUs)
    for (const v of original.variants) {
      await prisma.productVariant.create({
        data: {
          productId: duplicated.id,
          sku: v.sku + '-C' + Math.floor(100 + Math.random() * 900),
          price: v.price,
          oldPrice: v.oldPrice,
          costPrice: v.costPrice,
          stockCount: 0,
          image: v.image,
          options: (v.options as Prisma.InputJsonValue) ?? {},
          status: 'inactive',
        },
      }).catch(() => {});
    }

    // Audit Log
    await prisma.auditLog.create({
      data: {
        userId: auth.user.id,
        userName: auth.user.name,
        userEmail: auth.user.email,
        action: 'PRODUCT_DUPLICATE',
        entityType: 'Product',
        entityId: duplicated.id,
        details: { originalId: id, originalSku: original.sku, newSku },
      },
    });

    return NextResponse.json({ success: true, product: duplicated }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
