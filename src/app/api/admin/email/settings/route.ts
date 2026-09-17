import { NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/auth-guard';
import { getSmtpConfig, saveSmtpConfig } from '@/lib/email-service';

export async function GET(request: Request) {
  const auth = await requireAdmin(request);
  if (!auth.authorized) return auth.response;

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
  const auth = await requireAdmin(request);
  if (!auth.authorized) return auth.response;

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
