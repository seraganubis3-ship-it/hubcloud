import type { Metadata } from 'next';
import { Inter, Tajawal } from 'next/font/google';
import './globals.css';
import { StoreProvider } from '@/context/StoreContext';
import { StoreLayoutWrapper } from '@/components/layout/StoreLayoutWrapper';

import { SITE_CONFIG, generateOrganizationJsonLd, generateWebSiteJsonLd } from '@/lib/seo';

const inter = Inter({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700', '800'],
  variable: '--font-inter',
  display: 'swap',
});

const tajawal = Tajawal({
  subsets: ['arabic'],
  weight: ['400', '500', '700', '800'],
  variable: '--font-tajawal',
  display: 'swap',
});

export const metadata: Metadata = {
  metadataBase: new URL(SITE_CONFIG.url),
  title: {
    default: `${SITE_CONFIG.name} | Leading Tech & IT Gear Store in Egypt`,
    template: `%s | ${SITE_CONFIG.name}`,
  },
  description: SITE_CONFIG.description,
  keywords: [
    'Laptops Egypt',
    'Dell Laptops Cairo',
    'HP Enterprise Desktops',
    'Cisco Network Switches',
    'Fujitsu Scanners Egypt',
    'شراء لابتوب في مصر',
    'أجهزة كمبيوتر مكتبي',
    'معدات شبكات وسيرفرات',
    'ماسحات ضوئية مستندات',
    'قطع هاردوير بضمان محلي',
    'هاب كلاود للتكنولوجيا',
  ],
  authors: [{ name: SITE_CONFIG.name, url: SITE_CONFIG.url }],
  creator: SITE_CONFIG.name,
  publisher: SITE_CONFIG.name,
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  alternates: {
    canonical: '/',
  },
  openGraph: {
    type: 'website',
    locale: 'ar_EG',
    alternateLocale: 'en_US',
    url: SITE_CONFIG.url,
    title: `${SITE_CONFIG.name} | متجر تكنولوجيا المعلومات والأجهزة الاحترافية في مصر`,
    description: SITE_CONFIG.descriptionAr,
    siteName: SITE_CONFIG.name,
    images: [
      {
        url: SITE_CONFIG.ogImage,
        width: 1200,
        height: 630,
        alt: `${SITE_CONFIG.name} Logo`,
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: SITE_CONFIG.name,
    description: SITE_CONFIG.description,
    images: [SITE_CONFIG.ogImage],
  },
  icons: {
    icon: [
      { url: '/favicon.svg', type: 'image/svg+xml' },
      { url: '/favicon.png', type: 'image/png' },
    ],
    apple: [
      { url: '/favicon.png', type: 'image/png' },
    ],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const organizationJsonLd = generateOrganizationJsonLd();
  const webSiteJsonLd = generateWebSiteJsonLd();

  return (
    <html lang="en" dir="ltr" className={`${inter.variable} ${tajawal.variable}`}>
      <head>
        {/* Global Schema.org Structured Data */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationJsonLd) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(webSiteJsonLd) }}
        />
      </head>
      <body className="min-h-screen flex flex-col bg-[#F4F6F8] text-[#1E293B] antialiased font-sans">
        <StoreProvider>
          <StoreLayoutWrapper>
            {children}
          </StoreLayoutWrapper>
        </StoreProvider>
      </body>
    </html>
  );
}
