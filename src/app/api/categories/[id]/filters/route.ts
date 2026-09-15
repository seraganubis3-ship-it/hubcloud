import { NextResponse } from 'next/server';
import { getCategoryFiltersData } from '@/lib/category-filters';

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const data = await getCategoryFiltersData(params.id);
    if (!data) {
      return NextResponse.json({ success: false, error: 'Category not found' }, { status: 404 });
    }
    return NextResponse.json(data, {
      headers: {
        'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=1800',
      },
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

