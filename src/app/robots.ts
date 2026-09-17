import { MetadataRoute } from 'next';
import { SITE_CONFIG } from '@/lib/seo';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: [
          '/admin',
          '/admin/',
          '/admin/*',
          '/api/',
          '/api/*',
          '/cart',
          '/checkout',
          '/order-success/*',
          '/account',
        ],
      },
      {
        userAgent: 'Googlebot-Image',
        allow: ['/images/', '/*.png$', '/*.jpg$', '/*.svg$'],
      },
    ],
    sitemap: `${SITE_CONFIG.url}/sitemap.xml`,
  };
}
