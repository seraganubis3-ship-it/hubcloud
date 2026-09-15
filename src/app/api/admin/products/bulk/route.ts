import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { requireAdmin } from '@/lib/auth-guard';

export async function POST(request: Request) {
  const auth = await requireAdmin(request);
  if (!auth.authorized) return auth.response;

  try {
    const body = await request.json();
    const { action, productIds, targetCategorySlug } = body;

    if (!action || !Array.isArray(productIds) || productIds.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Action and an array of productIds are required.' },
        { status: 400 }
      );
    }

    let resultMessage = '';

    switch (action) {
      case 'activate': {
        await prisma.product.updateMany({
          where: { id: { in: productIds } },
          data: { status: 'active', isArchived: false },
        });
        resultMessage = `Activated ${productIds.length} products.`;
        break;
      }

      case 'deactivate': {
        await prisma.product.updateMany({
          where: { id: { in: productIds } },
          data: { status: 'draft' },
        });
        resultMessage = `Deactivated ${productIds.length} products to draft.`;
        break;
      }

      case 'archive': {
        await prisma.product.updateMany({
          where: { id: { in: productIds } },
          data: { status: 'archived', isArchived: true },
        });
        resultMessage = `Archived ${productIds.length} products.`;
        break;
      }

      case 'delete': {
        // Safe check or delete
        await prisma.product.deleteMany({
          where: { id: { in: productIds } },
        });
        resultMessage = `Deleted ${productIds.length} products.`;
        break;
      }

      case 'changeCategory': {
        if (!targetCategorySlug) {
          return NextResponse.json({ success: false, error: 'targetCategorySlug is required for reassigning category.' }, { status: 400 });
        }
        await prisma.product.updateMany({
          where: { id: { in: productIds } },
          data: { categoryId: targetCategorySlug },
        });
        resultMessage = `Reassigned ${productIds.length} products to category ${targetCategorySlug}.`;
        break;
      }

      default:
        return NextResponse.json({ success: false, error: `Unsupported action: ${action}` }, { status: 400 });
    }

    // Log Audit
    await prisma.auditLog.create({
      data: {
        userId: auth.user.id,
        userName: auth.user.name,
        userEmail: auth.user.email,
        action: `BULK_${action.toUpperCase()}`,
        entityType: 'Product',
        entityId: `bulk-${productIds.length}`,
        details: JSON.stringify({ action, count: productIds.length, productIds }),
      },
    });

    return NextResponse.json({ success: true, message: resultMessage, affectedCount: productIds.length });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
