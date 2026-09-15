import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { requireAdmin } from '@/lib/auth-guard';
import { ordersCache, adminStatsCache } from '@/lib/server-cache';
import { sendOrderStatusUpdateEmail } from '@/lib/email-service';

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const order = await prisma.order.findUnique({
      where: { id },
      include: {
        items: true,
      },
    });

    if (!order) {
      return NextResponse.json({ success: false, error: 'Order not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, order });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
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

    const updated = await prisma.order.update({
      where: { id },
      data: {
        ...(orderStatus && { orderStatus }),
        ...(paymentStatus && { paymentStatus }),
      },
      include: {
        items: true,
      },
    });

    ordersCache.clear();
    adminStatsCache.clear();

    if (orderStatus) {
      sendOrderStatusUpdateEmail(updated, orderStatus).catch((err) => {
        console.error('[OrdersAPI] Failed to dispatch order status update email:', err);
      });
    }

    return NextResponse.json({ success: true, order: updated });
  } catch (error: any) {
    console.error('Update order error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
