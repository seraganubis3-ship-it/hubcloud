import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { requireSession } from '@/lib/auth-guard';
import { checkRateLimit, getClientIp } from '@/lib/rate-limit';
import { sanitizeString, sanitizeEmail, sanitizePhone } from '@/lib/sanitize';
import { ordersCache, adminStatsCache } from '@/lib/server-cache';
import { sendOrderConfirmationEmails } from '@/lib/email-service';

export async function GET(request: Request) {
  // Requires authenticated session
  const auth = await requireSession(request);
  if (!auth.authorized) return auth.response;

  const isAdmin = auth.user.role === 'admin' || auth.user.email?.includes('admin');
  const cacheKey = isAdmin ? '__admin_all__' : auth.user.email.toLowerCase();
  const cached = ordersCache.get(cacheKey);
  if (cached) {
    return NextResponse.json(cached, {
      headers: { 'Cache-Control': 'private, s-maxage=20' },
    });
  }

  try {
    // Admins see all orders; regular authenticated customers see ONLY their own orders
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

    const result = { success: true, count: orders.length, orders };
    ordersCache.set(cacheKey, result);

    return NextResponse.json(result, {
      headers: { 'Cache-Control': 'private, s-maxage=20' },
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    // 1. Rate Limiting: Max 15 order placements per hour per IP
    const ip = getClientIp(request);
    const rateCheck = checkRateLimit(ip, 'orders:create', 15, 3600);
    if (!rateCheck.success) {
      return NextResponse.json(
        {
          success: false,
          error: `Too many order requests. Please wait ${rateCheck.resetSeconds} seconds before trying again.`,
        },
        { status: 429 }
      );
    }

    const body = await request.json();
    const orderId = 'HC-' + Math.floor(100000 + Math.random() * 900000);

    const rawName = `${body.firstName || ''} ${body.lastName || ''}`.trim() || body.customerName || 'Customer';
    const cleanName = sanitizeString(rawName, 80);
    const cleanEmail = sanitizeEmail(body.email || body.customerEmail);
    const cleanPhone = sanitizePhone(body.phone || body.customerPhone);
    const cleanCity = sanitizeString(body.city || '', 50);
    const cleanAddress = sanitizeString(body.address || '', 300);
    const cleanNotes = body.notes ? sanitizeString(body.notes, 500) : null;

    const order = await prisma.order.create({
      data: {
        id: orderId,
        customerName: cleanName,
        customerEmail: cleanEmail,
        customerPhone: cleanPhone,
        city: cleanCity,
        address: cleanAddress,
        postalCode: body.postalCode ? sanitizeString(body.postalCode, 20) : null,
        isCorporate: body.isCorporate ?? false,
        companyName: body.companyName ? sanitizeString(body.companyName, 100) : null,
        taxNumber: body.taxNumber ? sanitizeString(body.taxNumber, 50) : null,
        paymentMethod: body.paymentMethod || 'instapay',
        paymentStatus: body.paymentStatus || (body.paymentMethod === 'cod' ? 'cash_on_delivery' : 'pending'),
        orderStatus: 'processing',
        subtotal: Number(body.subtotal) || 0,
        shipping: Number(body.shipping) || 0,
        vat: Number(body.vat) || 0,
        discount: Number(body.discount) || 0,
        total: Number(body.total) || 0,
        notes: cleanNotes,
        items: {
          create: (body.items || []).map((item: any) => ({
            productId: item.product?.id || item.productId || 'custom',
            productName: sanitizeString(item.product?.name || item.productName || 'Product Item', 120),
            productNameAr: item.product?.nameAr || item.productNameAr ? sanitizeString(item.product?.nameAr || item.productNameAr, 120) : null,
            quantity: Math.max(1, Number(item.quantity) || 1),
            unitPrice: Math.max(0, Number(item.unitPrice) || 0),
            totalPrice: Math.max(0, Number(item.totalPrice) || Number(item.unitPrice) || 0),
            selectedRam: item.selectedRam ? sanitizeString(item.selectedRam, 30) : null,
            selectedStorage: item.selectedStorage ? sanitizeString(item.selectedStorage, 30) : null,
            selectedWarranty: item.selectedWarranty ? sanitizeString(item.selectedWarranty, 30) : null,
          })),
        },
      },
      include: {
        items: true,
      },
    });

    ordersCache.clear();
    adminStatsCache.clear();

    // Asynchronously dispatch confirmation to customer and alert to admin
    sendOrderConfirmationEmails(order).catch((err) => {
      console.error('[OrdersAPI] Error sending order confirmation emails:', err);
    });

    return NextResponse.json({ success: true, order }, { status: 201 });
  } catch (error: any) {
    console.error('Order creation error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
