import { NextResponse } from 'next/server';
import { requireSession } from '@/lib/auth-guard';
import { getSmtpConfig, saveSmtpConfig } from '@/lib/email-service';

export async function GET(request: Request) {
  const auth = await requireSession(request);
  if (!auth.authorized) return auth.response;

  if (auth.user.role !== 'admin' && !auth.user.email?.includes('admin')) {
    return NextResponse.json({ success: false, error: 'غير مصرح بالوصول' }, { status: 403 });
  }

  try {
    const config = getSmtpConfig();
    // Mask password before returning to client
    const safeConfig = {
      ...config,
      hasPassword: Boolean(config.pass),
      pass: config.pass ? '••••••••' : '',
    };

    return NextResponse.json({ success: true, settings: safeConfig });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const auth = await requireSession(request);
  if (!auth.authorized) return auth.response;

  if (auth.user.role !== 'admin' && !auth.user.email?.includes('admin')) {
    return NextResponse.json({ success: false, error: 'غير مصرح بالوصول' }, { status: 403 });
  }

  try {
    const body = await request.json();
    const updated = saveSmtpConfig(body);

    const safeConfig = {
      ...updated,
      hasPassword: Boolean(updated.pass),
      pass: updated.pass ? '••••••••' : '',
    };

    return NextResponse.json({ success: true, settings: safeConfig });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
