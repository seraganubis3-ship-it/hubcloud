import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { requireAdmin } from '@/lib/auth-guard';

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  const auth = await requireAdmin(request);
  if (!auth.authorized) return auth.response;

  try {
    const { id } = params;
    const body = await request.json();

    const dataToUpdate: any = {};
    if (body.code !== undefined) dataToUpdate.code = body.code.trim().toUpperCase();
    if (body.discountAmount !== undefined) dataToUpdate.discountAmount = Number(body.discountAmount);
    if (body.discount !== undefined) dataToUpdate.discountAmount = Number(body.discount);
    if (body.minSpend !== undefined) dataToUpdate.minSpend = Number(body.minSpend);
    if (body.isActive !== undefined) dataToUpdate.isActive = Boolean(body.isActive);

    const updated = await prisma.coupon.update({
      where: { id },
      data: dataToUpdate,
    });

    return NextResponse.json({ success: true, coupon: updated });
  } catch (error: any) {
    console.error(`Error updating coupon ${params.id}:`, error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  const auth = await requireAdmin(request);
  if (!auth.authorized) return auth.response;

  try {
    const { id } = params;

    await prisma.coupon.delete({
      where: { id },
    });

    return NextResponse.json({ success: true, message: 'Coupon deleted successfully' });
  } catch (error: any) {
    console.error(`Error deleting coupon ${params.id}:`, error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
