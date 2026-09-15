import { NextResponse } from 'next/server';
import { getSiteContent, saveSiteContent } from '@/lib/content-server';
import { requireAdmin } from '@/lib/auth-guard';

export async function GET() {
  try {
    const content = getSiteContent();
    return NextResponse.json({
      success: true,
      content,
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  const auth = await requireAdmin(request);
  if (!auth.authorized) return auth.response;

  try {
    const body = await request.json();
    const updated = saveSiteContent(body);

    return NextResponse.json({
      success: true,
      message: 'Site content updated successfully',
      content: updated,
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
