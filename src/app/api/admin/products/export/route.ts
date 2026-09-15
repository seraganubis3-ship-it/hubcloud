import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { requireAdmin } from '@/lib/auth-guard';

export async function GET(request: Request) {
  const auth = await requireAdmin(request);
  if (!auth.authorized) return auth.response;

  try {
    const { searchParams } = new URL(request.url);
    const format = searchParams.get('format') || 'csv';

    const products = await prisma.product.findMany({
      include: {
        category: {
          select: { name: true, slug: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    if (format === 'json') {
      return NextResponse.json({ success: true, count: products.length, products });
    }

    // CSV format
    const headers = [
      'SKU',
      'Name',
      'NameAr',
      'Brand',
      'CategorySlug',
      'Price',
      'OldPrice',
      'CostPrice',
      'StockCount',
      'Status',
      'Barcode',
      'Thumbnail',
    ];

    const escapeCsv = (str: any) => {
      if (str === null || str === undefined) return '';
      const s = String(str).replace(/"/g, '""');
      return `"${s}"`;
    };

    const rows = products.map((p) => [
      escapeCsv(p.sku),
      escapeCsv(p.name),
      escapeCsv(p.nameAr),
      escapeCsv(p.brand),
      escapeCsv(p.categoryId),
      escapeCsv(p.price),
      escapeCsv(p.oldPrice || ''),
      escapeCsv(p.costPrice || ''),
      escapeCsv(p.stockCount),
      escapeCsv(p.status),
      escapeCsv(p.barcode || ''),
      escapeCsv(p.thumbnail),
    ]);

    const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');

    return new NextResponse(csvContent, {
      status: 200,
      headers: {
        'Content-Type': 'text/csv; charset=utf-8',
        'Content-Disposition': `attachment; filename="hubcloud-products-${Date.now()}.csv"`,
      },
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
