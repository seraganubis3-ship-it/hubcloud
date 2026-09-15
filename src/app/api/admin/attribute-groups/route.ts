import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { requireAdmin } from '@/lib/auth-guard';
import { attributeGroupsCache } from '@/lib/server-cache';

export async function GET() {
  const cached = attributeGroupsCache.get('all');
  if (cached) {
    return NextResponse.json(cached, {
      headers: { 'Cache-Control': 'private, s-maxage=60' },
    });
  }

  try {
    const groups = await prisma.attributeGroup.findMany({
      include: {
        attributes: {
          orderBy: { name: 'asc' },
        },
      },
      orderBy: { displayOrder: 'asc' },
    });

    const result = { success: true, groups };
    attributeGroupsCache.set('all', result);

    return NextResponse.json(result, {
      headers: { 'Cache-Control': 'private, s-maxage=60' },
    });
  } catch (error: any) {
    const fallback = attributeGroupsCache.get('all');
    if (fallback) {
      return NextResponse.json(fallback);
    }
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const auth = await requireAdmin(request);
  if (!auth.authorized) return auth.response;

  try {
    const body = await request.json();

    if (!body.name) {
      return NextResponse.json({ success: false, error: 'Group name is required' }, { status: 400 });
    }

    const created = await prisma.attributeGroup.create({
      data: {
        name: body.name.trim(),
        nameAr: body.nameAr?.trim() || body.name.trim(),
        displayOrder: Number(body.displayOrder) || 0,
      },
    });

    attributeGroupsCache.clear();

    return NextResponse.json({ success: true, group: created }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
