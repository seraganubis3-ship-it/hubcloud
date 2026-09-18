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
    const [productsCount, categoriesCount, recentOrders, totalOrders, revenueAgg, statusGroups] = await Promise.all([
      prisma.product.count(),
      prisma.category.count(),
      prisma.order.findMany({
        take: 6,
        orderBy: { createdAt: 'desc' },
        include: {
          items: true,
        },
      }),
      prisma.order.count(),
      prisma.order.aggregate({
        where: { orderStatus: { not: 'cancelled' } },
        _sum: { total: true },
        _count: true,
      }),
      prisma.order.groupBy({
        by: ['orderStatus'],
        _count: true,
      })
    ]);

    const nonCancelledCount = revenueAgg._count;
    const totalRevenue = Number(revenueAgg._sum.total || 0);
    const averageOrderValue = nonCancelledCount > 0 ? Math.round(totalRevenue / nonCancelledCount) : 0;

    const statusBreakdown = {
      processing: statusGroups.find((g) => g.orderStatus === 'processing')?._count || 0,
      shipped: statusGroups.find((g) => g.orderStatus === 'shipped')?._count || 0,
      delivered: statusGroups.find((g) => g.orderStatus === 'delivered')?._count || 0,
      cancelled: statusGroups.find((g) => g.orderStatus === 'cancelled')?._count || 0,
    };

    const now = new Date();
    const monthNamesEn = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const monthNamesAr = ['يناير', 'فبراير', 'مارس', 'أبريل', 'مايو', 'يونيو', 'يوليو', 'أغسطس', 'سبتمبر', 'أكتوبر', 'نوفمبر', 'ديسمبر'];
    
    const months = [];
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const nextMonth = new Date(now.getFullYear(), now.getMonth() - i + 1, 1);
      const mIdx = d.getMonth();
      const yr = d.getFullYear();

      const [mCount, mRev] = await Promise.all([
        prisma.order.count({ where: { createdAt: { gte: d, lt: nextMonth } } }),
        prisma.order.aggregate({
          where: { createdAt: { gte: d, lt: nextMonth }, orderStatus: { not: 'cancelled' } },
          _sum: { total: true },
        }),
      ]);

      months.push({
        label: monthNamesEn[mIdx],
        labelAr: monthNamesAr[mIdx],
        monthIndex: mIdx,
        year: yr,
        revenue: Number(mRev._sum.total || 0),
        orders: mCount,
      });
    }

    const quarters = [];
    const quartersDefs = [
      { label: 'Q1', labelAr: 'الربع 1', start: new Date(now.getFullYear(), 0, 1), end: new Date(now.getFullYear(), 3, 1) },
      { label: 'Q2', labelAr: 'الربع 2', start: new Date(now.getFullYear(), 3, 1), end: new Date(now.getFullYear(), 6, 1) },
      { label: 'Q3', labelAr: 'الربع 3', start: new Date(now.getFullYear(), 6, 1), end: new Date(now.getFullYear(), 9, 1) },
      { label: 'Q4', labelAr: 'الربع 4', start: new Date(now.getFullYear(), 9, 1), end: new Date(now.getFullYear() + 1, 0, 1) },
    ];

    for (const q of quartersDefs) {
      const [qCount, qRev] = await Promise.all([
        prisma.order.count({ where: { createdAt: { gte: q.start, lt: q.end } } }),
        prisma.order.aggregate({
          where: { createdAt: { gte: q.start, lt: q.end }, orderStatus: { not: 'cancelled' } },
          _sum: { total: true },
        }),
      ]);

      quarters.push({
        label: q.label,
        labelAr: q.labelAr,
        revenue: Number(qRev._sum.total || 0),
        orders: qCount,
      });
    }

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
