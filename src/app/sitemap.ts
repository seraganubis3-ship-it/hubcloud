import { MetadataRoute } from 'next';
import { prisma } from '@/lib/db';
import { SITE_CONFIG } from '@/lib/seo';

// Force dynamic evaluation so new products appear in the sitemap immediately
// without requiring a full redeployment
export const dynamic = 'force-dynamic';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = SITE_CONFIG.url;

  // Static routes — only publicly indexable pages
  const staticRoutes: MetadataRoute.Sitemap = [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1.0,
    },
    {
      url: `${baseUrl}/products`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.9,
    },
    {
      url: `${baseUrl}/deals`,
      lastModified: new Date(),
      changeFrequency: 'hourly',
      priority: 0.9,
    },
    // Note: /cart is intentionally excluded — it's a private transactional route
    {
      url: `${baseUrl}/about`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.7,
    },
    {
      url: `${baseUrl}/warranty`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.6,
    },
    {
      url: `${baseUrl}/returns`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.6,
    },
    {
      url: `${baseUrl}/shipping`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.6,
    },
    {
      url: `${baseUrl}/faq`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.6,
    },
  ];

  try {
    const [dbProducts, dbCategories] = await Promise.all([
      // Only active, non-archived products in sitemap
      prisma.product.findMany({
        where: { status: 'active', isArchived: false },
        select: { id: true, updatedAt: true },
      }),
      // Only active, non-archived categories
      prisma.category.findMany({
        where: { isActive: true, isArchived: false },
        select: { slug: true },
      }),
    ]);

    const productUrls: MetadataRoute.Sitemap = dbProducts.map((p: any) => ({
      url: `${baseUrl}/products/${p.id}`,
      lastModified: p.updatedAt || new Date(),
      changeFrequency: 'weekly',
      priority: 0.8,
    }));

    const categoryUrls: MetadataRoute.Sitemap = dbCategories.map((c: any) => ({
      url: `${baseUrl}/category/${c.slug}`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.85,
    }));

    return [...staticRoutes, ...categoryUrls, ...productUrls];
  } catch (e) {
    return staticRoutes;
  }
}
