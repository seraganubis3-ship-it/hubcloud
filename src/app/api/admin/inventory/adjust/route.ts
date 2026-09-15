import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { requireAdmin } from '@/lib/auth-guard';

export async function POST(request: Request) {
  const auth = await requireAdmin(request);
  if (!auth.authorized) return auth.response;

  try {
    const body = await request.json();
    const { productId, variantId, quantityDelta, reason } = body;

    if (!productId || quantityDelta === undefined || !reason) {
      return NextResponse.json(
        { success: false, error: 'productId, quantityDelta, and reason are required.' },
        { status: 400 }
      );
    }

    const delta = Number(quantityDelta);
    if (isNaN(delta) || delta === 0) {
      return NextResponse.json({ success: false, error: 'quantityDelta must be a non-zero number.' }, { status: 400 });
    }

    const product = await prisma.product.findUnique({
      where: { id: productId },
    });

    if (!product) {
      return NextResponse.json({ success: false, error: 'Product not found' }, { status: 404 });
    }

    const previousStock = product.stockCount;
    const newStock = Math.max(0, previousStock + delta);

    // Update Product stock
    const updatedProduct = await prisma.product.update({
      where: { id: productId },
      data: {
        stockCount: newStock,
        inStock: newStock > 0,
      },
    });

    // If variantId passed, also update variant stock
    if (variantId) {
      const variant = await prisma.productVariant.findUnique({ where: { id: variantId } });
      if (variant) {
        await prisma.productVariant.update({
          where: { id: variantId },
          data: {
            stockCount: Math.max(0, variant.stockCount + delta),
          },
        });
      }
    }

    // Record Inventory Transaction
    const transaction = await prisma.inventoryTransaction.create({
      data: {
        productId,
        variantId: variantId || null,
        quantityDelta: delta,
        previousStock,
        newStock,
        reason: reason.trim(),
        createdById: auth.user.id,
        createdByName: auth.user.name,
      },
    });

    // Record Audit Log
    await prisma.auditLog.create({
      data: {
        userId: auth.user.id,
        userName: auth.user.name,
        userEmail: auth.user.email,
        action: 'STOCK_ADJUST',
        entityType: 'Inventory',
        entityId: productId,
        details: JSON.stringify({
          sku: product.sku,
          name: product.name,
          delta,
          previousStock,
          newStock,
          reason,
        }),
      },
    });

    return NextResponse.json({
      success: true,
      message: `Stock adjusted by ${delta > 0 ? '+' + delta : delta}. New stock: ${newStock}`,
      product: updatedProduct,
      transaction,
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
