import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { requireAdmin } from '@/lib/auth-guard';

export async function GET(request: Request) {
  const auth = await requireAdmin(request);
  if (!auth.authorized) return auth.response;

  try {
    const { searchParams } = new URL(request.url);
    const page = Math.max(1, Number(searchParams.get('page')) || 1);
    const limit = Math.max(1, Math.min(100, Number(searchParams.get('limit')) || 30));
    const entityType = searchParams.get('entityType'); // 'Product', 'Category', 'Attribute', 'Inventory'
    const action = searchParams.get('action');

    const where: any = {};
    if (entityType && entityType !== 'all') {
      where.entityType = entityType;
    }
    if (action && action !== 'all') {
      where.action = { contains: action, mode: 'insensitive' };
    }

    const [total, logs] = await Promise.all([
      prisma.auditLog.count({ where }),
      prisma.auditLog.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
    ]);

    const formatted = logs.map((log) => {
      let parsedDetails: any = log.details;
      if (typeof log.details === 'string') {
        try {
          parsedDetails = JSON.parse(log.details);
        } catch {
          parsedDetails = { raw: log.details };
        }
      }
      return {
        ...log,
        details: parsedDetails || {},
      };
    });

    return NextResponse.json({
      success: true,
      logs: formatted,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
