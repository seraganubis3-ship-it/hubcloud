import { prisma } from '@/lib/db';
import { requireAdmin } from '@/lib/auth-guard';
import { apiSuccess, apiError, handleApiError } from '@/lib/api-response';
import { InventoryReason } from '@prisma/client';

const VALID_REASONS: InventoryReason[] = [
  'order_created',
  'order_cancelled',
  'restock',
  'damage',
  'adjustment',
  'return_restock',
];

export async function POST(request: Request) {
  const auth = await requireAdmin(request);
  if (!auth.authorized) return auth.response;

  try {
    const body = await request.json();
    const { productId, variantId, quantityDelta, reason } = body;

    if (!productId || quantityDelta === undefined || !reason) {
      return apiError('productId, quantityDelta, and reason are required.', 400);
    }

    const delta = Number(quantityDelta);
    if (isNaN(delta) || delta === 0) {
      return apiError('quantityDelta must be a non-zero number.', 400);
    }

    let normalizedReason = reason.trim() as InventoryReason;
    if ((normalizedReason as any) === 'manual_adjustment') normalizedReason = 'adjustment';
    if ((normalizedReason as any) === 'return') normalizedReason = 'return_restock';

    if (!VALID_REASONS.includes(normalizedReason)) {
      return apiError(`Invalid reason. Must be one of: ${VALID_REASONS.join(', ')}`, 400);
    }

    // Execute atomically in a transaction
    const result = await prisma.$transaction(async (tx) => {
      const product = await tx.product.findUnique({
        where: { id: productId },
      });

      if (!product) {
        throw new Error('Product not found');
      }

      let variant = null;
      let previousStock = product.stockCount;
      let newStock = Math.max(0, previousStock + delta);

      if (variantId) {
        variant = await tx.productVariant.findUnique({ where: { id: variantId } });
        if (!variant) {
          throw new Error('Product variant not found');
        }
        previousStock = variant.stockCount;

        const updatedVariant = await tx.productVariant.update({
          where: { id: variantId },
          data: { stockCount: { increment: delta } },
        });

        if (updatedVariant.stockCount < 0) {
          throw new Error('Resulting stock cannot be negative');
        }

        newStock = updatedVariant.stockCount;

        // Recalculate parent product total stock from all variants
        const allVariants = await tx.productVariant.findMany({
          where: { productId },
          select: { stockCount: true },
        });
        const totalVariantStock = allVariants.reduce((sum, v) => sum + v.stockCount, 0);

        await tx.product.update({
          where: { id: productId },
          data: {
            stockCount: totalVariantStock,
            inStock: totalVariantStock > 0,
          },
        });
      } else {
        const updatedProduct = await tx.product.update({
          where: { id: productId },
          data: {
            stockCount: { increment: delta },
          },
        });

        if (updatedProduct.stockCount < 0) {
          throw new Error('Resulting stock cannot be negative');
        }

        newStock = updatedProduct.stockCount;

        await tx.product.update({
          where: { id: productId },
          data: {
            inStock: newStock > 0,
          },
        });
      }

      const transaction = await tx.inventoryTransaction.create({
        data: {
          productId,
          variantId: variantId || null,
          quantityDelta: delta,
          previousStock,
          newStock,
          reason: normalizedReason,
          createdById: auth.user.id,
          createdByName: auth.user.name,
        },
      });

      await tx.auditLog.create({
        data: {
          userId: auth.user.id,
          userName: auth.user.name,
          userEmail: auth.user.email,
          action: 'STOCK_ADJUST',
          entityType: 'Inventory',
          entityId: productId,
          details: {
            sku: product.sku,
            name: product.name,
            delta,
            previousStock,
            newStock,
            reason: normalizedReason,
            variantId: variantId || null,
          },
        },
      });

      return { transaction, newStock };
    });

    return apiSuccess({
      message: `Stock adjusted by ${delta > 0 ? '+' + delta : delta}. New stock: ${result.newStock}`,
      transaction: result.transaction,
    });
  } catch (error: any) {
    if (error.message === 'Product not found' || error.message === 'Product variant not found') {
      return apiError(error.message, 404);
    }
    if (error.message === 'Resulting stock cannot be negative') {
      return apiError(error.message, 400);
    }
    return handleApiError(error);
  }
}
