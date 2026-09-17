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

    // Build O(1) lookup map of orders per customer email instead of O(N*M) loop
    const ordersByEmail = new Map<string, { count: number; total: number }>();
    for (const o of orders) {
      const email = o.customerEmail.toLowerCase().trim();
      const existing = ordersByEmail.get(email) || { count: 0, total: 0 };
      existing.count += 1;
      existing.total += Number(o.total || 0);
      ordersByEmail.set(email, existing);
    }

    const customers = users.map((u) => {
      const stats = ordersByEmail.get(u.email.toLowerCase().trim()) || { count: 0, total: 0 };

      return {
        id: u.id,
        name: u.name,
        email: u.email,
        phone: u.phone,
        role: u.role,
        ordersCount: stats.count,
        totalSpent: stats.total,
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
