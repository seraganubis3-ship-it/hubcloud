import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { DEFAULT_STORE_SETTINGS } from '@/lib/settings-constants';

export async function GET() {
  try {
    const record = await prisma.systemSetting.findUnique({
      where: { key: 'store_settings' },
    });

    const settings = record ? { ...DEFAULT_STORE_SETTINGS, ...(record.value as any) } : DEFAULT_STORE_SETTINGS;

    return NextResponse.json({ success: true, settings });
  } catch (error: any) {
    return NextResponse.json({ success: true, settings: DEFAULT_STORE_SETTINGS });
  }
}
