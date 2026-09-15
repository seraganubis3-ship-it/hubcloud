'use client';

import React from 'react';
import Link from 'next/link';
import { ProductCard } from '@/components/product/ProductCard';
import { DealsSection } from '@/components/home/DealsSection';
import { TrustBadgesRow } from '@/components/home/TrustBadgesRow';
import { useStore } from '@/context/StoreContext';
import { generateBreadcrumbJsonLd } from '@/lib/seo';
import { Flame, ChevronRight } from 'lucide-react';

export default function DealsPage() {
  const { language, isRtl, products } = useStore();
  const dealProducts = products.filter(p => (p.discountPercentage && p.discountPercentage > 0) || p.isDeal);

  const breadcrumbsJsonLd = generateBreadcrumbJsonLd([
    { name: 'Home', url: '/' },
    { name: 'Deals & Discounts', url: '/deals' },
  ]);

  return (
    <div className="py-6">
      {/* Schema.org Breadcrumb JSON-LD */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbsJsonLd) }}
      />

      <div className="max-w-[1536px] mx-auto px-4 sm:px-6 space-y-6">
        {/* Breadcrumbs */}
        <div className="flex items-center gap-2 text-[12px] text-gray-500">
          <Link href="/" className="hover:text-hub-blue">{isRtl ? 'الرئيسية' : 'Home'}</Link>
          <ChevronRight className="w-3 h-3 rtl:rotate-180 text-gray-400" />
          <span className="font-semibold text-gray-900">{isRtl ? 'العروض والتخفيضات' : 'Deals & Discounts'}</span>
        </div>

        {/* Live Deals Section */}
        <DealsSection />

        {/* All Discounted Gear */}
        <div className="space-y-4 pt-4">
          <div className="flex items-center gap-2">
            <Flame className="w-6 h-6 text-hub-red fill-hub-red" />
            <h2 className="text-2xl font-extrabold text-gray-900">
              {isRtl ? 'جميع المنتجات المخفضة والعروض الحصرية' : 'All Discounted Tech & IT Gear'}
            </h2>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
            {dealProducts.map(prod => (
              <ProductCard key={prod.id} product={prod} />
            ))}
          </div>
        </div>

        <TrustBadgesRow />
      </div>
    </div>
  );
}
