import fs from 'fs';
import path from 'path';
import { SiteContent, DEFAULT_SITE_CONTENT } from './content';

const STORAGE_FILE_PATH = path.join(process.cwd(), 'src', 'data', 'site-content.json');

export function getSiteContent(): SiteContent {
  try {
    if (fs.existsSync(STORAGE_FILE_PATH)) {
      const data = fs.readFileSync(STORAGE_FILE_PATH, 'utf-8');
      const parsed = JSON.parse(data);
      return { ...DEFAULT_SITE_CONTENT, ...parsed };
    }
  } catch (err) {
    console.warn('Error reading stored site content, falling back to defaults:', err);
  }
  return DEFAULT_SITE_CONTENT;
}

export function saveSiteContent(content: Partial<SiteContent>): SiteContent {
  const current = getSiteContent();
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
    const dir = path.dirname(STORAGE_FILE_PATH);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    fs.writeFileSync(STORAGE_FILE_PATH, JSON.stringify(updated, null, 2), 'utf-8');
  } catch (err) {
    console.error('Error writing site content file:', err);
  }

  return updated;
}
