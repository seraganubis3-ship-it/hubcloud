import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { requireAdmin } from '@/lib/auth-guard';
import { DEFAULT_STORE_SETTINGS } from '@/lib/settings-constants';

export async function GET(request: Request) {
  const auth = await requireAdmin(request);
  if (!auth.authorized) return auth.response;

  try {
    const record = await prisma.systemSetting.findUnique({
      where: { key: 'store_settings' },
    });

    const settings = record ? { ...DEFAULT_STORE_SETTINGS, ...(record.value as any) } : DEFAULT_STORE_SETTINGS;

    return NextResponse.json({ success: true, settings });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  const auth = await requireAdmin(request);
  if (!auth.authorized) return auth.response;

  try {
    const body = await request.json();

    const currentRecord = await prisma.systemSetting.findUnique({
      where: { key: 'store_settings' },
    });

    const currentSettings = currentRecord
      ? { ...DEFAULT_STORE_SETTINGS, ...(currentRecord.value as any) }
      : DEFAULT_STORE_SETTINGS;

    const updatedSettings = {
      ...currentSettings,
      ...body,
    };

    const saved = await prisma.systemSetting.upsert({
      where: { key: 'store_settings' },
      create: {
        key: 'store_settings',
        value: updatedSettings,
      },
      update: {
        value: updatedSettings,
      },
    });

    return NextResponse.json({
      success: true,
      message: 'Store settings updated successfully in database',
      settings: saved.value,
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
