import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { requireAdmin } from '@/lib/auth-guard';

export const DEFAULT_STORE_SETTINGS = {
  storeName: 'HUB CLOUD IT Solutions',
  supportPhone: '01019569891',
  supportEmail: 's@hubcloud.info',
  showroomAddress: '181 شارع السودان - الدور التاسع - المهندسين، الجيزة',
  commercialRegistry: '142083',
  officialWarrantyPartner: 'موزع وشريك معتمد لتجهيزات الشبكات ومحطات العمل',
  workingHours: 'السبت إلى الخميس: 9:00 ص - 9:00 م (الجمعة عطلة أسبوعية)',
  freeShippingThreshold: 5000,
  standardDeliveryFee: 75,
  dispatchCutoff: '16:00',
  vodafoneCashWallet: '01019569891',
  instapayIpa: 'hubcloud@instapay',
  instapayPhone: '01019569891',
  socialLinks: [
    { id: 'whatsapp', name: 'WhatsApp Direct', url: 'https://wa.me/201019569891', enabled: true },
    { id: 'facebook', name: 'Facebook Page', url: 'https://facebook.com/hubcloud.eg', enabled: true },
    { id: 'instagram', name: 'Instagram', url: 'https://instagram.com/hubcloud.eg', enabled: true },
    { id: 'linkedin', name: 'LinkedIn Company', url: 'https://linkedin.com/company/hubcloud-eg', enabled: true },
    { id: 'tiktok', name: 'TikTok', url: 'https://tiktok.com/@hubcloud.eg', enabled: false },
    { id: 'youtube', name: 'YouTube Channel', url: 'https://youtube.com/@hubcloud-eg', enabled: false },
  ],
};

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
