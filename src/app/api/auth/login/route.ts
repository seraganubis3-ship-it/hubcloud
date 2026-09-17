import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { verifyPassword, signSessionToken, SESSION_COOKIE_OPTIONS } from '@/lib/auth';
import { checkDistributedRateLimit, getClientIp } from '@/lib/rate-limit';
import { sanitizeEmail } from '@/lib/sanitize';

export async function POST(request: Request) {
  try {
    // 1. Rate Limiting: Max 8 failed attempts per 15 minutes per IP (Distributed / Serverless safe)
    const ip = getClientIp(request);
    const rateCheck = await checkDistributedRateLimit(ip, 'auth:login', 8, 15 * 60);
    if (!rateCheck.success) {
      return NextResponse.json(
        {
          success: false,
          error: `Too many login attempts. Please wait ${rateCheck.resetSeconds} seconds before trying again.`,
        },
        { status: 429 }
      );
    }

    const body = await request.json();
    const cleanEmail = sanitizeEmail(body.email);
    const password = typeof body.password === 'string' ? body.password : '';

    if (!cleanEmail || !password) {
      return NextResponse.json(
        { success: false, error: 'Email and password are required.' },
        { status: 400 }
      );
    }

    // 2. Fetch user from database including stored password hash
    const user = await prisma.user.findUnique({
      where: { email: cleanEmail },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        role: true,
        adminRoleId: true,
        password: true,
        createdAt: true,
      },
    });

    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Invalid email or password.' },
        { status: 401 }
      );
    }

    // 3. Verify password against bcrypt hash (strictly reject null or invalid passwords)
    if (!user.password) {
      return NextResponse.json(
        { success: false, error: 'Invalid email or password.' },
        { status: 401 }
      );
    }

    const isValid = await verifyPassword(password, user.password);
    if (!isValid) {
      return NextResponse.json(
        { success: false, error: 'Invalid email or password.' },
        { status: 401 }
      );
    }

    // 4. Issue signed Edge-compatible JWT session token
    const token = await signSessionToken({
      userId: user.id,
      email: user.email,
      role: user.role,
      name: user.name,
      adminRoleId: user.adminRoleId,
    });

    const response = NextResponse.json({
      success: true,
      message: 'Logged in successfully',
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
        createdAt: user.createdAt.toISOString().split('T')[0],
      },
    });

    // 5. Attach tamper-proof HTTP-only cookie
    response.cookies.set({
      ...SESSION_COOKIE_OPTIONS,
      value: token,
    });

    return response;
  } catch (error: any) {
    console.error('Login error:', error);
    return NextResponse.json(
      { success: false, error: 'An unexpected error occurred during login.' },
      { status: 500 }
    );
  }
}
