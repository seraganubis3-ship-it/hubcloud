import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export const DEFAULT_HERO_BANNERS = [
  {
    id: 'banner-1',
    title: 'High-End Laptops & Mobile Workstations',
    titleAr: 'لابتوبات ومحطات عمل احترافية فائقة الأداء',
    primaryHref: '/category/laptops',
    image: '/images/banners/hero_laptops.jpg',
    isActive: true,
    displayOrder: 1,
  },
  {
    id: 'banner-2',
    title: 'High-Performance Desktops & Workstations',
    titleAr: 'محطات عمل وأجهزة ديسكتوب فائقة القوة',
    primaryHref: '/category/desktops',
    image: '/images/banners/hero_desktops.jpg',
    isActive: true,
    displayOrder: 2,
  },
  {
    id: 'banner-3',
    title: 'Enterprise Infrastructure & Networking Solutions',
    titleAr: 'سويتشات Cisco المدارة وجدران حماية Fortinet',
    primaryHref: '/category/network-device',
    image: '/images/banners/hero_network.jpg',
    isActive: true,
    displayOrder: 3,
  },
];

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
