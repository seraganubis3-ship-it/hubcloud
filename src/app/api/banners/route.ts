import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { DEFAULT_HERO_BANNERS } from '@/lib/settings-constants';

export async function GET() {
  try {
    const banners = await prisma.banner.findMany({
      where: { isActive: true },
      orderBy: { displayOrder: 'asc' },
    });

    if (banners.length === 0) {
      return NextResponse.json({ success: true, banners: DEFAULT_HERO_BANNERS });
    }

    return NextResponse.json({ success: true, banners });
  } catch (error: any) {
    return NextResponse.json({ success: true, banners: DEFAULT_HERO_BANNERS });
  }
}
