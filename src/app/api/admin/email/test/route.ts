import { NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/auth-guard';
import { testSmtpConnection } from '@/lib/email-service';

export async function POST(request: Request) {
  const auth = await requireAdmin(request);
  if (!auth.authorized) return auth.response;

  try {
    const body = await request.json();
    const { targetEmail, customConfig } = body;

    if (!targetEmail || typeof targetEmail !== 'string') {
      return NextResponse.json({ success: false, message: 'يرجى إدخال عنوان بريد إلكتروني صالح للتجربة' }, { status: 400 });
    }

    const result = await testSmtpConnection(targetEmail, customConfig);
    return NextResponse.json(result);
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message || 'حدث خطأ أثناء فحص خادم الـ SMTP' }, { status: 500 });
  }
}
