import { NextResponse } from 'next/server';
import { requireSession } from '@/lib/auth-guard';
import { getEmailLogs } from '@/lib/email-service';

export async function GET(request: Request) {
  const auth = await requireSession(request);
  if (!auth.authorized) return auth.response;

  if (auth.user.role !== 'admin' && !auth.user.email?.includes('admin')) {
    return NextResponse.json({ success: false, error: 'غير مصرح بالوصول' }, { status: 403 });
  }

  try {
    const logs = getEmailLogs();
    return NextResponse.json({ success: true, logs });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
