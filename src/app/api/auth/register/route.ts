import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { hashPassword, signSessionToken, SESSION_COOKIE_OPTIONS } from '@/lib/auth';
import { checkDistributedRateLimit, getClientIp } from '@/lib/rate-limit';
import { sanitizeString, sanitizeEmail, sanitizePhone } from '@/lib/sanitize';

export async function POST(request: Request) {
  try {
    // 1. Rate Limiting: Max 5 registrations per hour per IP (Distributed / Serverless safe)
    const ip = getClientIp(request);
    const rateCheck = await checkDistributedRateLimit(ip, 'auth:register', 5, 3600);
    if (!rateCheck.success) {
      return NextResponse.json(
        {
          success: false,
          error: `Too many registration attempts. Please try again in ${rateCheck.resetSeconds} seconds.`,
        },
        { status: 429 }
      );
    }

    const body = await request.json();
    const cleanName = sanitizeString(body.name, 80);
    const cleanEmail = sanitizeEmail(body.email);
    const cleanPhone = sanitizePhone(body.phone);
    const password = typeof body.password === 'string' ? body.password : '';

    if (!cleanName || !cleanEmail || !cleanPhone) {
      return NextResponse.json(
        { success: false, error: 'Name, valid email, and phone number are required.' },
        { status: 400 }
      );
    }

    if (password.length < 6) {
      return NextResponse.json(
        { success: false, error: 'Password must be at least 6 characters long.' },
        { status: 400 }
      );
    }

    // 2. Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email: cleanEmail },
    });

    if (existingUser) {
      return NextResponse.json(
        { success: false, error: 'An account with this email address already exists.' },
        { status: 409 }
      );
    }

    // 3. Cryptographically hash password
    const hashedPassword = await hashPassword(password);

    // 4. Create user record (default to customer role)
    const user = await prisma.user.create({
      data: {
        name: cleanName,
        email: cleanEmail,
        phone: cleanPhone,
        password: hashedPassword,
        role: 'customer',
      },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        role: true,
        createdAt: true,
      },
    });

    // 5. Generate signed HTTP-only JWT session cookie
    const token = await signSessionToken({
      userId: user.id,
      email: user.email,
      role: user.role,
      name: user.name,
    });

    const response = NextResponse.json({
      success: true,
      message: 'Account registered successfully',
      user: {
        ...user,
        createdAt: user.createdAt.toISOString().split('T')[0],
      },
    });

    response.cookies.set({
      ...SESSION_COOKIE_OPTIONS,
      value: token,
    });

    return response;
  } catch (error: any) {
    console.error('Registration error:', error);
    return NextResponse.json(
      { success: false, error: 'An unexpected error occurred during registration.' },
      { status: 500 }
    );
  }
}
