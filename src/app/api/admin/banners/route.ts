import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { requireAdmin } from '@/lib/auth-guard';
import { DEFAULT_HERO_BANNERS } from '@/app/api/banners/route';

export async function GET(request: Request) {
  const auth = await requireAdmin(request);
  if (!auth.authorized) return auth.response;

  try {
    let banners = await prisma.banner.findMany({
      orderBy: { displayOrder: 'asc' },
    });

    // Auto-seed default banners if table is empty
    if (banners.length === 0) {
      for (const b of DEFAULT_HERO_BANNERS) {
        await prisma.banner.create({
          data: {
            title: b.title,
            titleAr: b.titleAr,
            primaryHref: b.primaryHref,
            image: b.image,
            isActive: b.isActive,
            displayOrder: b.displayOrder,
          },
        });
      }
      banners = await prisma.banner.findMany({
        orderBy: { displayOrder: 'asc' },
      });
    }

    return NextResponse.json({ success: true, banners });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const auth = await requireAdmin(request);
  if (!auth.authorized) return auth.response;

  try {
    const body = await request.json();
    const { title, titleAr, primaryHref, image, isActive, displayOrder } = body;

    if (!title || !titleAr || !image) {
      return NextResponse.json(
        { success: false, error: 'Title, Arabic Title, and Image URL are required.' },
        { status: 400 }
      );
    }

    const newBanner = await prisma.banner.create({
      data: {
        title,
        titleAr,
        primaryHref: primaryHref || '/products',
        image,
        isActive: isActive !== undefined ? Boolean(isActive) : true,
        displayOrder: Number(displayOrder) || 0,
      },
    });

    return NextResponse.json({ success: true, banner: newBanner });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  const auth = await requireAdmin(request);
  if (!auth.authorized) return auth.response;

  try {
    const body = await request.json();
    const { id, title, titleAr, primaryHref, image, isActive, displayOrder } = body;

    if (!id) {
      return NextResponse.json({ success: false, error: 'Banner ID is required.' }, { status: 400 });
    }

    const updatedBanner = await prisma.banner.update({
      where: { id },
      data: {
        ...(title !== undefined && { title }),
        ...(titleAr !== undefined && { titleAr }),
        ...(primaryHref !== undefined && { primaryHref }),
        ...(image !== undefined && { image }),
        ...(isActive !== undefined && { isActive: Boolean(isActive) }),
        ...(displayOrder !== undefined && { displayOrder: Number(displayOrder) }),
      },
    });

    return NextResponse.json({ success: true, banner: updatedBanner });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  const auth = await requireAdmin(request);
  if (!auth.authorized) return auth.response;

  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ success: false, error: 'Banner ID is required.' }, { status: 400 });
    }

    await prisma.banner.delete({
      where: { id },
    });

    return NextResponse.json({ success: true, message: 'Banner deleted successfully' });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
