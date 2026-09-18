import { NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/auth-guard';
import { getEmailLogs } from '@/lib/email-service';

export async function GET(request: Request) {
  const auth = await requireAdmin(request);
  if (!auth.authorized) return auth.response;

  try {
    const logs = await getEmailLogs();
    return NextResponse.json({ success: true, logs });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
