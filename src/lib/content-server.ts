import { prisma } from '@/lib/db';
import { SiteContent, DEFAULT_SITE_CONTENT } from './content';

export async function getSiteContent(): Promise<SiteContent> {
  try {
    const record = await prisma.systemSetting.findUnique({
      where: { key: 'site_content' },
    });
    if (record?.value) {
      return { ...DEFAULT_SITE_CONTENT, ...(record.value as any) };
    }
  } catch (err) {
    console.warn('Error reading stored site content from database, falling back to defaults:', err);
  }
  return DEFAULT_SITE_CONTENT;
}

export async function saveSiteContent(content: Partial<SiteContent>): Promise<SiteContent> {
  const current = await getSiteContent();
  const updated: SiteContent = {
    ...current,
    ...content,
    about: { ...current.about, ...(content.about || {}) },
    warranty: { ...current.warranty, ...(content.warranty || {}) },
    returns: { ...current.returns, ...(content.returns || {}) },
    shipping: { ...current.shipping, ...(content.shipping || {}) },
    faq: { ...current.faq, ...(content.faq || {}) },
    contact: { ...current.contact, ...(content.contact || {}) },
  };

  try {
    await prisma.systemSetting.upsert({
      where: { key: 'site_content' },
      create: {
        key: 'site_content',
        value: updated as any,
      },
      update: {
        value: updated as any,
      },
    });
  } catch (err) {
    console.error('Error writing site content to database:', err);
  }

  return updated;
}

