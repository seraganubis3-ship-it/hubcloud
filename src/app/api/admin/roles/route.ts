import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { DEFAULT_ADMIN_ROLES } from '@/lib/rbac';
import { requireAdmin, requireManager } from '@/lib/auth-guard';

export async function GET(request: Request) {
  const auth = await requireAdmin(request);
  if (!auth.authorized) return auth.response;

  try {
    const staff = await prisma.user.findMany({
      where: {
        OR: [
          { role: 'admin' },
          { email: 'admin@hubcloud.eg' },
        ],
      },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        role: true,
        adminRoleId: true,
        createdAt: true,
      },
      orderBy: { createdAt: 'asc' },
    });

    return NextResponse.json({
      success: true,
      roles: DEFAULT_ADMIN_ROLES,
      staff,
    });
  } catch (error: any) {
    console.error('Error fetching roles and staff:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  // Only the General Store Manager can modify staff roles and assignments
  const auth = await requireManager(request);
  if (!auth.authorized) return auth.response;

  try {
    const body = await request.json();
    const { userId, adminRoleId, role } = body;

    if (!userId) {
      return NextResponse.json({ success: false, error: 'User ID is required' }, { status: 400 });
    }

    const updated = await prisma.user.update({
      where: { id: userId },
      data: {
        role: role || 'admin',
        adminRoleId: adminRoleId !== undefined ? adminRoleId : undefined,
      },
      // Explicit projection — never return password hash in response
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

    return NextResponse.json({
      success: true,
      user: updated,
      adminRoleId,
    });
  } catch (error: any) {
    console.error('Error updating staff role:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
