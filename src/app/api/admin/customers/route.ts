import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { requireAdmin } from '@/lib/auth-guard';

export async function GET(request: Request) {
  const auth = await requireAdmin(request);
  if (!auth.authorized) return auth.response;

  try {
    const users = await prisma.user.findMany({
      orderBy: { createdAt: 'desc' },
    });

    const orders = await prisma.order.findMany({
      select: {
        customerEmail: true,
        total: true,
      },
    });

    const customers = users.map((u) => {
      const userOrders = orders.filter(
        (o) => o.customerEmail.toLowerCase() === u.email.toLowerCase()
      );
      const ordersCount = userOrders.length;
      const totalSpent = userOrders.reduce((sum, o) => sum + o.total, 0);

      return {
        id: u.id,
        name: u.name,
        email: u.email,
        phone: u.phone,
        role: u.role,
        ordersCount,
        totalSpent,
        joinedDate: u.createdAt.toLocaleDateString('en-GB', {
          day: '2-digit',
          month: 'short',
          year: 'numeric',
        }),
      };
    });

    return NextResponse.json({ success: true, count: customers.length, customers });
  } catch (error: any) {
    console.error('Customers API error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
