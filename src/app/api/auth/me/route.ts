import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getSessionUserFromRequest, verifyPassword, hashPassword } from '@/lib/auth';
import { sanitizeString, sanitizePhone } from '@/lib/sanitize';
import { userSessionCache } from '@/lib/server-cache';

export async function GET(request: Request) {
  try {
    const session = await getSessionUserFromRequest(request);
    if (!session) {
      return NextResponse.json({ success: true, authenticated: false, user: null }, { status: 200 });
    }

    const cached = userSessionCache.get(session.userId);
    if (cached) {
      return NextResponse.json({ success: true, user: cached }, {
        headers: { 'Cache-Control': 'private, s-maxage=60' }
      });
    }

    const user = await prisma.user.findUnique({
      where: { id: session.userId },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        role: true,
        adminRoleId: true,
        createdAt: true,
      },
    });

    if (!user) {
      return NextResponse.json({ success: false, user: null }, { status: 404 });
    }

    const formattedUser = {
      ...user,
      createdAt: user.createdAt.toISOString().split('T')[0],
    };

    userSessionCache.set(session.userId, formattedUser);

    return NextResponse.json({
      success: true,
      user: formattedUser,
    }, {
      headers: { 'Cache-Control': 'private, s-maxage=60' }
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  try {
    // Only allow authenticated users to update their own profile
    const session = await getSessionUserFromRequest(request);
    if (!session) {
      return NextResponse.json(
        { success: false, error: 'Authentication required' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const cleanName = body.name ? sanitizeString(body.name, 80) : undefined;
    const cleanPhone = body.phone ? sanitizePhone(body.phone) : undefined;

    // Handle password change if requested
    let newHashedPassword: string | undefined = undefined;
    if (body.newPassword) {
      const currentPassword = typeof body.currentPassword === 'string' ? body.currentPassword : '';
      const newPassword = typeof body.newPassword === 'string' ? body.newPassword : '';

      if (newPassword.length < 6) {
        return NextResponse.json(
          { success: false, error: 'يجب أن لا تقل كلمة المرور الجديدة عن 6 أحرف' },
          { status: 400 }
        );
      }

      // Fetch user's current password hash
      const userRecord = await prisma.user.findUnique({
        where: { id: session.userId },
        select: { password: true },
      });

      if (!userRecord || !userRecord.password) {
        return NextResponse.json({ success: false, error: 'المستخدم غير موجود أو لا يملك كلمة مرور مسجلة' }, { status: 400 });
      }

      const isMatch = await verifyPassword(currentPassword, userRecord.password);
      if (!isMatch) {
        return NextResponse.json(
          { success: false, error: 'كلمة المرور الحالية غير صحيحة' },
          { status: 400 }
        );
      }

      newHashedPassword = await hashPassword(newPassword);
    }

    const updated = await prisma.user.update({
      where: { id: session.userId },
      data: {
        ...(cleanName && { name: cleanName }),
        ...(cleanPhone && { phone: cleanPhone }),
        ...(newHashedPassword && { password: newHashedPassword }),
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

    userSessionCache.delete(session.userId);

    return NextResponse.json({
      success: true,
      message: newHashedPassword ? 'تم تحديث كلمة المرور بنجاح' : 'تم تحديث البيانات بنجاح',
      user: {
        ...updated,
        createdAt: updated.createdAt.toISOString().split('T')[0],
      },
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
