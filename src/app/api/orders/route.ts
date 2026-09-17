import { prisma } from '@/lib/db';
import { requireSession } from '@/lib/auth-guard';
import { checkRateLimit, getClientIp } from '@/lib/rate-limit';
import { sanitizeString, sanitizeEmail, sanitizePhone } from '@/lib/sanitize';
import { ordersCache, adminStatsCache } from '@/lib/server-cache';
import { sendOrderConfirmationEmails } from '@/lib/email-service';
import { apiSuccess, apiError, handleApiError } from '@/lib/api-response';
import { validateOrderInput } from '@/lib/validation';
import { Prisma } from '@prisma/client';

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

export async function GET(request: Request) {
  const auth = await requireSession(request);
  if (!auth.authorized) return auth.response;

  // Strict role check without email backdoor
  const isAdmin = auth.user.role === 'admin';
  const cacheKey = isAdmin ? '__admin_all__' : auth.user.email.toLowerCase();
  const cached = ordersCache.get(cacheKey);
  if (cached) {
    return apiSuccess(cached, 200, {
      headers: { 'Cache-Control': 'private, s-maxage=20' },
    });
  }

  try {
    const whereClause = isAdmin
      ? {}
      : { customerEmail: { equals: auth.user.email, mode: 'insensitive' as const } };

    const orders = await prisma.order.findMany({
      where: whereClause,
      include: {
        items: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    const serializedOrders = orders.map(serializeOrder);
    const result = { count: serializedOrders.length, orders: serializedOrders };
    ordersCache.set(cacheKey, result);

    return apiSuccess(result);
  } catch (error: any) {
    return handleApiError(error);
  }
}

export async function POST(request: Request) {
  try {
    // 1. Rate Limiting: Max 15 order placements per hour per IP
    const ip = getClientIp(request);
    const rateCheck = checkRateLimit(ip, 'orders:create', 15, 3600);
    if (!rateCheck.success) {
      return apiError(
        `Too many order requests. Please wait ${rateCheck.resetSeconds} seconds before trying again.`,
        429
      );
    }

    const rawBody = await request.json();
    const validation = validateOrderInput(rawBody);
    if (!validation.isValid || !validation.data) {
      return apiError(validation.errors.join(' '), 400);
    }

    const data = validation.data;
    const orderId = 'HC-' + Math.floor(100000 + Math.random() * 900000);

    const cleanName = sanitizeString(data.customerName, 80);
    const cleanEmail = sanitizeEmail(data.customerEmail);
    const cleanPhone = sanitizePhone(data.customerPhone);
    const cleanCity = sanitizeString(data.city, 50);
    const cleanAddress = sanitizeString(data.address, 300);
    const cleanNotes = data.notes ? sanitizeString(data.notes, 500) : null;

    // Execute order creation, stock decrements, inventory transactions & audit logs in an atomic transaction
    const order = await prisma.$transaction(async (tx) => {
      let calculatedSubtotal = 0;
      const orderItemsToCreate: any[] = [];

      for (const item of data.items) {
        let verifiedPrice = item.unitPrice;
        let verifiedName = item.productName;
        let verifiedNameAr = item.productNameAr;

        if (item.variantId) {
          const variant = await tx.productVariant.findUnique({
            where: { id: item.variantId },
            include: { product: true },
          });

          if (!variant) {
            throw new Error(`Variant not found for item: ${item.productName}`);
          }

          if (variant.stockCount < item.quantity) {
            throw new Error(`Insufficient stock for "${variant.product.name}". Only ${variant.stockCount} left.`);
          }

          // Decrement variant stock
          const newVariantStock = variant.stockCount - item.quantity;
          await tx.productVariant.update({
            where: { id: item.variantId },
            data: { stockCount: newVariantStock },
          });

          // Decrement parent product stock
          const newProductStock = Math.max(0, variant.product.stockCount - item.quantity);
          await tx.product.update({
            where: { id: variant.productId },
            data: {
              stockCount: newProductStock,
              inStock: newProductStock > 0,
            },
          });

          // Record Inventory Transaction
          await tx.inventoryTransaction.create({
            data: {
              productId: variant.productId,
              variantId: variant.id,
              quantityDelta: -item.quantity,
              previousStock: variant.stockCount,
              newStock: newVariantStock,
              reason: 'order_created',
              createdByName: cleanName,
            },
          });

          verifiedPrice = Number(variant.price);
          verifiedName = variant.product.name;
          verifiedNameAr = variant.product.nameAr;
        } else {
          // Base product without variants
          const product = await tx.product.findUnique({
            where: { id: item.productId },
          });

          if (!product) {
            throw new Error(`Product not found: ${item.productName}`);
          }

          if (product.stockCount < item.quantity) {
            throw new Error(`Insufficient stock for "${product.name}". Only ${product.stockCount} left.`);
          }

          const newStock = product.stockCount - item.quantity;
          await tx.product.update({
            where: { id: item.productId },
            data: {
              stockCount: newStock,
              inStock: newStock > 0,
            },
          });

          await tx.inventoryTransaction.create({
            data: {
              productId: product.id,
              quantityDelta: -item.quantity,
              previousStock: product.stockCount,
              newStock,
              reason: 'order_created',
              createdByName: cleanName,
            },
          });

          verifiedPrice = Number(product.price);
          verifiedName = product.name;
          verifiedNameAr = product.nameAr;
        }

        const itemTotal = Number((verifiedPrice * item.quantity).toFixed(2));
        calculatedSubtotal += itemTotal;

        orderItemsToCreate.push({
          productId: item.productId,
          variantId: item.variantId || null,
          productName: verifiedName,
          productNameAr: verifiedNameAr || null,
          quantity: item.quantity,
          unitPrice: new Prisma.Decimal(verifiedPrice),
          totalPrice: new Prisma.Decimal(itemTotal),
          selectedOptions: item.selectedOptions || {},
        });
      }

      // 2. Validate coupon server-side — never trust client-supplied discount amounts
      let discount = 0;
      const couponCode = rawBody.couponCode ? String(rawBody.couponCode).trim().toUpperCase() : null;
      if (couponCode) {
        const coupon = await tx.coupon.findUnique({ where: { code: couponCode } });
        if (coupon && coupon.isActive && calculatedSubtotal >= Number(coupon.minSpend)) {
          discount = Number(coupon.discountAmount);
        }
        // If coupon not found or invalid, discount stays 0 — not an error, just ignored
      }

      // Shipping: 0 for now (extend with real shipping calculator by city if needed)
      const shipping = 0;
      const vat = Number((calculatedSubtotal * 0.14).toFixed(2)); // Standard 14% VAT in Egypt
      const total = Math.max(0, Number((calculatedSubtotal + shipping + vat - discount).toFixed(2)));


      const createdOrder = await tx.order.create({
        data: {
          id: orderId,
          customerName: cleanName,
          customerEmail: cleanEmail,
          customerPhone: cleanPhone,
          city: cleanCity,
          address: cleanAddress,
          postalCode: data.postalCode || null,
          isCorporate: data.isCorporate ?? false,
          companyName: data.companyName || null,
          taxNumber: data.taxNumber || null,
          paymentMethod: data.paymentMethod || 'cod',
          paymentStatus: 'pending',
          orderStatus: 'processing',
          subtotal: new Prisma.Decimal(calculatedSubtotal),
          shipping: new Prisma.Decimal(shipping),
          vat: new Prisma.Decimal(vat),
          discount: new Prisma.Decimal(discount),
          total: new Prisma.Decimal(total),
          notes: cleanNotes,
          items: {
            create: orderItemsToCreate,
          },
        },
        include: {
          items: true,
        },
      });

      await tx.auditLog.create({
        data: {
          action: 'ORDER_CREATE',
          entityType: 'Order',
          entityId: orderId,
          userEmail: cleanEmail,
          userName: cleanName,
          details: {
            orderId,
            itemsCount: orderItemsToCreate.length,
            subtotal: calculatedSubtotal,
            total,
            paymentMethod: data.paymentMethod,
          },
        },
      });

      return createdOrder;
    });

    ordersCache.clear();
    adminStatsCache.clear();

    const serialized = serializeOrder(order);

    // Asynchronously dispatch confirmation emails
    sendOrderConfirmationEmails(serialized).catch((err) => {
      console.error('[OrdersAPI] Error sending order confirmation emails:', err);
    });

    return apiSuccess({ order: serialized }, 201);
  } catch (error: any) {
    if (error.message && (error.message.startsWith('Insufficient stock') || error.message.includes('not found'))) {
      return apiError(error.message, 400);
    }
    return handleApiError(error);
  }
}

