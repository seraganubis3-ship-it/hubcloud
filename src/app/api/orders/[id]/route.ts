import { prisma } from '@/lib/db';
import { requireAdmin, requireSession } from '@/lib/auth-guard';
import { ordersCache, adminStatsCache } from '@/lib/server-cache';
import { sendOrderStatusUpdateEmail } from '@/lib/email-service';
import { apiSuccess, apiError, handleApiError } from '@/lib/api-response';
import { OrderStatus, PaymentStatus } from '@prisma/client';

function serializeOrder(order: any) {
  if (!order) return null;
  return {
    ...order,
    subtotal: Number(order.subtotal ?? 0),
    shipping: Number(order.shipping ?? 0),
    vat: Number(order.vat ?? 0),
    discount: Number(order.discount ?? 0),
    total: Number(order.total ?? 0),
    items: (order.items || []).map((item: any) => {
      const opts = (typeof item.selectedOptions === 'object' && item.selectedOptions !== null)
        ? item.selectedOptions
        : {};

      return {
        ...item,
        unitPrice: Number(item.unitPrice ?? 0),
        totalPrice: Number(item.totalPrice ?? 0),
        selectedRam: opts.ram || opts.selectedRam || undefined,
        selectedStorage: opts.storage || opts.selectedStorage || undefined,
        selectedWarranty: opts.warranty || opts.selectedWarranty || undefined,
      };
    }),
  };
}

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  // Require a valid session — no anonymous access to order details
  const auth = await requireSession(request);
  if (!auth.authorized) return auth.response;

  try {
    const { id } = params;
    const order = await prisma.order.findUnique({
      where: { id },
      include: {
        items: true,
      },
    });

    if (!order) {
      return apiError('Order not found', 404);
    }

    // Admin can view any order; customers can only view their own
    const isAdmin = auth.user.role === 'admin';
    const isOwner = order.customerEmail.toLowerCase() === auth.user.email.toLowerCase();

    if (!isAdmin && !isOwner) {
      return apiError('You do not have permission to view this order', 403);
    }

    return apiSuccess({ order: serializeOrder(order) });
  } catch (error: any) {
    return handleApiError(error);
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  // Guard order status updates with admin privileges
  const auth = await requireAdmin(request);
  if (!auth.authorized) return auth.response;

  try {
    const { id } = params;
    const body = await request.json();
    const { orderStatus, paymentStatus } = body;

    const VALID_ORDER_STATUSES: OrderStatus[] = ['pending', 'processing', 'shipped', 'delivered', 'cancelled'];
    const VALID_PAYMENT_STATUSES: PaymentStatus[] = ['pending', 'paid', 'failed', 'refunded'];

    if (orderStatus && !VALID_ORDER_STATUSES.includes(orderStatus)) {
      return apiError(`Invalid orderStatus. Allowed: ${VALID_ORDER_STATUSES.join(', ')}`, 400);
    }

    if (paymentStatus && !VALID_PAYMENT_STATUSES.includes(paymentStatus)) {
      return apiError(`Invalid paymentStatus. Allowed: ${VALID_PAYMENT_STATUSES.join(', ')}`, 400);
    }

    // Execute in transaction to handle cancellation restock if applicable
    const updated = await prisma.$transaction(async (tx) => {
      const currentOrder = await tx.order.findUnique({
        where: { id },
        include: { items: true },
      });

      if (!currentOrder) {
        throw new Error('Order not found');
      }

      // If transitioning to 'cancelled' and was not already cancelled, restock items
      if (orderStatus === 'cancelled' && currentOrder.orderStatus !== 'cancelled') {
        for (const item of currentOrder.items) {
          if (item.variantId) {
            const variant = await tx.productVariant.findUnique({ where: { id: item.variantId } });
            if (variant) {
              const newVariantStock = variant.stockCount + item.quantity;
              await tx.productVariant.update({
                where: { id: item.variantId },
                data: { stockCount: newVariantStock },
              });

              await tx.inventoryTransaction.create({
                data: {
                  productId: item.productId,
                  variantId: item.variantId,
                  quantityDelta: item.quantity,
                  previousStock: variant.stockCount,
                  newStock: newVariantStock,
                  reason: 'order_cancelled',
                  createdById: auth.user.id,
                  createdByName: auth.user.name,
                },
              });
            }
          }

          // Restock product
          const prod = await tx.product.findUnique({ where: { id: item.productId } });
          if (prod) {
            const newStock = prod.stockCount + item.quantity;
            await tx.product.update({
              where: { id: item.productId },
              data: {
                stockCount: newStock,
                inStock: true,
              },
            });

            if (!item.variantId) {
              await tx.inventoryTransaction.create({
                data: {
                  productId: item.productId,
                  quantityDelta: item.quantity,
                  previousStock: prod.stockCount,
                  newStock,
                  reason: 'order_cancelled',
                  createdById: auth.user.id,
                  createdByName: auth.user.name,
                },
              });
            }
          }
        }
      }

      const updatedOrder = await tx.order.update({
        where: { id },
        data: {
          ...(orderStatus && { orderStatus }),
          ...(paymentStatus && { paymentStatus }),
        },
        include: {
          items: true,
        },
      });

      await tx.auditLog.create({
        data: {
          userId: auth.user.id,
          userName: auth.user.name,
          userEmail: auth.user.email,
          action: 'ORDER_UPDATE',
          entityType: 'Order',
          entityId: id,
          details: {
            previousOrderStatus: currentOrder.orderStatus,
            newOrderStatus: orderStatus || currentOrder.orderStatus,
            previousPaymentStatus: currentOrder.paymentStatus,
            newPaymentStatus: paymentStatus || currentOrder.paymentStatus,
          },
        },
      });

      return updatedOrder;
    });

    ordersCache.clear();
    adminStatsCache.clear();

    const serialized = serializeOrder(updated);

    if (orderStatus) {
      sendOrderStatusUpdateEmail(serialized, orderStatus).catch((err) => {
        console.error('[OrdersAPI] Failed to dispatch order status update email:', err);
      });
    }

    return apiSuccess({ order: serialized });
  } catch (error: any) {
    if (error.message === 'Order not found') {
      return apiError('Order not found', 404);
    }
    return handleApiError(error);
  }
}

