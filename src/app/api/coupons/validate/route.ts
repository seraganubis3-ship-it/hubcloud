import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { checkRateLimit, getClientIp } from '@/lib/rate-limit';

export async function POST(request: Request) {
  try {
    // Rate Limiting: Max 15 attempts per minute per IP to prevent coupon brute-forcing
    const ip = getClientIp(request);
    const rateCheck = checkRateLimit(ip, 'coupons:validate', 15, 60);
    if (!rateCheck.success) {
      return NextResponse.json(
        {
          success: false,
          valid: false,
          message: `Too many validation attempts. Please wait ${rateCheck.resetSeconds} seconds before trying again.`,
        },
        { status: 429 }
      );
    }

    const { code, subtotal } = await request.json();
    const cleanCode = (code || '').trim().toUpperCase();

    if (!cleanCode) {
      return NextResponse.json(
        {
          success: false,
          valid: false,
          message: 'Please enter a coupon code',
        },
        { status: 400 }
      );
    }

    const coupon = await prisma.coupon.findUnique({
      where: { code: cleanCode },
    });

    if (!coupon) {
      return NextResponse.json(
        {
          success: false,
          valid: false,
          message: 'Invalid discount coupon code',
        },
        { status: 404 }
      );
    }

    if (!coupon.isActive) {
      return NextResponse.json(
        {
          success: false,
          valid: false,
          message: 'This coupon is currently inactive or expired',
        },
        { status: 400 }
      );
    }

    const numSubtotal = Number(subtotal);
    const minSpend = Number(coupon.minSpend || 0);
    const discountAmount = Number(coupon.discountAmount || 0);

    if (!isNaN(numSubtotal) && numSubtotal > 0 && minSpend > 0) {
      if (numSubtotal < minSpend) {
        return NextResponse.json(
          {
            success: false,
            valid: false,
            message: `Coupon requires a minimum order spend of EGP ${minSpend.toLocaleString('en-US')}`,
            minSpend,
          },
          { status: 400 }
        );
      }
    }

    return NextResponse.json({
      success: true,
      valid: true,
      code: coupon.code,
      discountAmount,
      minSpend,
    });
  } catch (error: any) {
    console.error('Error validating coupon:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
