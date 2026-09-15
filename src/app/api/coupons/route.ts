import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { requireAdmin } from '@/lib/auth-guard';

export async function GET() {
  try {
    const coupons = await prisma.coupon.findMany({
      orderBy: { id: 'desc' },
    });

    return NextResponse.json({
      success: true,
      coupons,
    });
  } catch (error: any) {
    console.error('Error fetching coupons:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const auth = await requireAdmin(request);
  if (!auth.authorized) return auth.response;

  try {
    const body = await request.json();
    const code = (body.code || '').trim().toUpperCase();
    const discountAmount = Number(body.discountAmount || body.discount || 0);
    const minSpend = Number(body.minSpend || 0);
    const isActive = body.isActive !== undefined ? Boolean(body.isActive) : true;

    if (!code) {
      return NextResponse.json({ success: false, error: 'Coupon code is required' }, { status: 400 });
    }

    if (discountAmount <= 0) {
      return NextResponse.json({ success: false, error: 'Discount amount must be greater than 0' }, { status: 400 });
    }

    const created = await prisma.coupon.create({
      data: {
        code,
        discountAmount,
        minSpend,
        isActive,
      },
    });

    return NextResponse.json({ success: true, coupon: created }, { status: 201 });
  } catch (error: any) {
    console.error('Error creating coupon:', error);
    if (error.code === 'P2002') {
      return NextResponse.json({ success: false, error: 'A coupon with this code already exists' }, { status: 409 });
    }
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
