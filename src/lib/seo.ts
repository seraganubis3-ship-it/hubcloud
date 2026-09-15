import { Product } from '@/types';

export const SITE_CONFIG = {
  name: 'HUB CLOUD IT Solutions',
  nameAr: 'هاب كلاود لحلول وتكنولوجيا المعلومات',
  url: process.env.NEXT_PUBLIC_SITE_URL || 'https://hubcloud-eg.com',
  ogImage: '/hubcloud_logo_transparent.png',
  description: 'Your trusted enterprise IT partner in Egypt for Laptops, Desktops, Network Devices, Document Scanners, Servers, and Accessories with official local warranty and fast delivery across Egypt.',
  descriptionAr: 'شريكك التكنولوجي المعتمد في مصر لأجهزة اللابتوب، الكمبيوتر المكتبي، معدات الشبكات، السيرفرات، الماسحات الضوئية، والإكسسوارات بضمان محلي معتمد وتوصيل سريع لكافة المحافظات.',
  telephone: '+201022288444',
  email: 'sales@hubcloud-eg.com',
  address: {
    streetAddress: '23 El Tayaran St.',
    addressLocality: 'Nasr City',
    addressRegion: 'Cairo',
    postalCode: '11765',
    addressCountry: 'EG',
  },
  geo: {
    latitude: 30.059488,
    longitude: 31.334057,
  },
  openingHours: 'Mo,Tu,We,Th,Sa,Su 09:00-22:00',
  priceRange: 'EGP 100 - EGP 150000',
  socialLinks: [
    'https://facebook.com/hubcloud.eg',
    'https://linkedin.com/company/hubcloud-eg',
    'https://instagram.com/hubcloud.eg',
  ],
};

/**
 * Generate Schema.org WebSite JSON-LD with Sitelinks Searchbox
 */
export function generateWebSiteJsonLd() {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: SITE_CONFIG.name,
    alternateName: [SITE_CONFIG.nameAr, 'HubCloud Egypt', 'Hub Cloud'],
    url: SITE_CONFIG.url,
    potentialAction: {
      '@type': 'SearchAction',
      target: {
        '@type': 'EntryPoint',
        urlTemplate: `${SITE_CONFIG.url}/products?q={search_term_string}`,
      },
      'query-input': 'required name=search_term_string',
    },
  };
}

/**
 * Generate Schema.org Organization & LocalBusiness JSON-LD
 */
export function generateOrganizationJsonLd() {
  return {
    '@context': 'https://schema.org',
    '@type': 'ComputerStore',
    name: SITE_CONFIG.name,
    alternateName: SITE_CONFIG.nameAr,
    url: SITE_CONFIG.url,
    logo: `${SITE_CONFIG.url}${SITE_CONFIG.ogImage}`,
    image: `${SITE_CONFIG.url}${SITE_CONFIG.ogImage}`,
    description: SITE_CONFIG.descriptionAr,
    telephone: SITE_CONFIG.telephone,
    email: SITE_CONFIG.email,
    priceRange: SITE_CONFIG.priceRange,
    openingHours: SITE_CONFIG.openingHours,
    sameAs: SITE_CONFIG.socialLinks,
    contactPoint: {
      '@type': 'ContactPoint',
      telephone: SITE_CONFIG.telephone,
      contactType: 'customer service and enterprise sales',
      areaServed: 'EG',
      availableLanguage: ['Arabic', 'English'],
    },
    address: {
      '@type': 'PostalAddress',
      ...SITE_CONFIG.address,
    },
    geo: {
      '@type': 'GeoCoordinates',
      latitude: SITE_CONFIG.geo.latitude,
      longitude: SITE_CONFIG.geo.longitude,
    },
    paymentAccepted: 'Cash, Credit Card, Vodafone Cash, InstaPay, Fawry, ValU, Aman',
    currenciesAccepted: 'EGP',
  };
}

/**
 * Generate Schema.org Product JSON-LD for Google Rich Results
 */
export function generateProductJsonLd(product: Product) {
  const images = (product.images && product.images.length > 0)
    ? product.images.map(img => img.startsWith('http') ? img : `${SITE_CONFIG.url}${img}`)
    : [`${SITE_CONFIG.url}${product.thumbnail}`];

  return {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: product.name,
    alternateName: product.nameAr,
    image: images,
    description: product.description,
    sku: product.sku,
    mpn: product.sku,
    category: product.category,
    brand: {
      '@type': 'Brand',
      name: product.brand,
    },
    offers: {
      '@type': 'Offer',
      url: `${SITE_CONFIG.url}/products/${product.id}`,
      priceCurrency: 'EGP',
      price: product.price,
      priceValidUntil: '2026-12-31',
      itemCondition: 'https://schema.org/NewCondition',
      availability: product.inStock
        ? 'https://schema.org/InStock'
        : 'https://schema.org/OutOfStock',
      seller: {
        '@type': 'Organization',
        name: SITE_CONFIG.name,
      },
      hasMerchantReturnPolicy: {
        '@type': 'MerchantReturnPolicy',
        applicableCountry: 'EG',
        returnPolicyCategory: 'https://schema.org/MerchantReturnFiniteReturnWindow',
        merchantReturnDays: 14,
        returnMethod: 'https://schema.org/ReturnByMail',
      },
    },
  };
}

/**
 * Generate Schema.org BreadcrumbList JSON-LD
 */
export function generateBreadcrumbJsonLd(items: { name: string; url: string }[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: item.url.startsWith('http') ? item.url : `${SITE_CONFIG.url}${item.url}`,
    })),
  };
}
