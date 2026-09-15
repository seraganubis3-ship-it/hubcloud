import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { requireAdmin } from '@/lib/auth-guard';
import { adminStatsCache } from '@/lib/server-cache';

export async function GET(request: Request) {
  const auth = await requireAdmin(request);
  if (!auth.authorized) return auth.response;

  const cached = adminStatsCache.get('stats');
  if (cached) {
    return NextResponse.json(cached, {
      headers: { 'Cache-Control': 'private, s-maxage=30' },
    });
  }

  try {
    const [productsCount, categoriesCount, orders, recentOrders] = await Promise.all([
      prisma.product.count(),
      prisma.category.count(),
      prisma.order.findMany({
        select: {
          id: true,
          total: true,
          orderStatus: true,
          paymentStatus: true,
          createdAt: true,
        },
        orderBy: { createdAt: 'desc' },
      }),
      prisma.order.findMany({
        take: 6,
        orderBy: { createdAt: 'desc' },
        include: {
          items: true,
        },
      }),
    ]);

    // Active non-cancelled orders for revenue calculation
    const nonCancelled = orders.filter((o) => o.orderStatus !== 'cancelled');
    const totalRevenue = nonCancelled.reduce((sum, o) => sum + (Number(o.total) || 0), 0);
    const totalOrders = orders.length;
    const averageOrderValue = nonCancelled.length > 0 ? Math.round(totalRevenue / nonCancelled.length) : 0;

    // Status counts
    const statusBreakdown = {
      processing: orders.filter((o) => o.orderStatus === 'processing').length,
      shipped: orders.filter((o) => o.orderStatus === 'shipped').length,
      delivered: orders.filter((o) => o.orderStatus === 'delivered').length,
      cancelled: orders.filter((o) => o.orderStatus === 'cancelled').length,
    };

    // Real Monthly breakdown for the past 6 months from database
    const now = new Date();
    const months = [];
    const monthNamesEn = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const monthNamesAr = ['يناير', 'فبراير', 'مارس', 'أبريل', 'مايو', 'يونيو', 'يوليو', 'أغسطس', 'سبتمبر', 'أكتوبر', 'نوفمبر', 'ديسمبر'];

    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const mIdx = d.getMonth();
      const yr = d.getFullYear();

      // Filter real DB orders belonging to this month and year
      const mOrders = orders.filter((o) => {
        const ordDate = new Date(o.createdAt);
        return ordDate.getMonth() === mIdx && ordDate.getFullYear() === yr;
      });

      const mRevenue = mOrders
        .filter((o) => o.orderStatus !== 'cancelled')
        .reduce((sum, o) => sum + (Number(o.total) || 0), 0);

      months.push({
        label: `${monthNamesEn[mIdx]}`,
        labelAr: `${monthNamesAr[mIdx]}`,
        monthIndex: mIdx,
        year: yr,
        revenue: mRevenue,
        orders: mOrders.length,
      });
    }

    // Real Quarterly breakdown for the current year from database
    const quarters = [
      { label: 'Q1', labelAr: 'الربع 1', months: [0, 1, 2] },
      { label: 'Q2', labelAr: 'الربع 2', months: [3, 4, 5] },
      { label: 'Q3', labelAr: 'الربع 3', months: [6, 7, 8] },
      { label: 'Q4', labelAr: 'الربع 4', months: [9, 10, 11] },
    ].map((q) => {
      const qOrders = orders.filter((o) => {
        const ordDate = new Date(o.createdAt);
        return ordDate.getFullYear() === now.getFullYear() && q.months.includes(ordDate.getMonth());
      });

      const qRevenue = qOrders
        .filter((o) => o.orderStatus !== 'cancelled')
        .reduce((sum, o) => sum + (Number(o.total) || 0), 0);

      return {
        label: q.label,
        labelAr: q.labelAr,
        revenue: qRevenue,
        orders: qOrders.length,
      };
    });

    const result = {
      success: true,
      stats: {
        totalRevenue,
        totalOrders,
        averageOrderValue,
        totalProducts: productsCount,
        totalCategories: categoriesCount,
        statusBreakdown,
        monthlyBreakdown: months,
        quarterlyBreakdown: quarters,
      },
      recentOrders,
    };

    adminStatsCache.set('stats', result);

    return NextResponse.json(result, {
      headers: { 'Cache-Control': 'private, s-maxage=30' },
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
