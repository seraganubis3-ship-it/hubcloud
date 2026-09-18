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

        {/* All Discounted Gear or Empty State */}
        {dealProducts.length > 0 ? (
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
        ) : (
          <div className="py-16 text-center bg-slate-50 border border-slate-200/70 rounded-3xl p-8 sm:p-12 space-y-4 max-w-2xl mx-auto my-8">
            <div className="w-16 h-16 rounded-2xl bg-amber-500/10 text-amber-500 border border-amber-500/20 flex items-center justify-center mx-auto shadow-xs">
              <Flame className="w-8 h-8" />
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-slate-900">
              {isRtl ? 'لا توجد عروض حصرية نشطة اليوم' : 'No Active Flash Deals Today'}
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 max-w-md mx-auto leading-relaxed">
              {isRtl
                ? 'ترقبوا تخفيضاتنا وعروضنا الحصرية القادمة قريباً! يمكنك دائماً استكشاف كامل تشكيلة الأجهزة والحلول التقنية المتاحة حالياً.'
                : 'Stay tuned for upcoming exclusive deals! In the meantime, explore our full catalog of high-performance hardware and enterprise gear.'}
            </p>
            <div className="pt-2">
              <Link
                href="/products"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-hub-blue hover:bg-blue-700 text-white text-xs sm:text-sm font-bold shadow-md shadow-blue-500/20 active:scale-95 transition-all"
              >
                <span>{isRtl ? 'تصفح جميع المنتجات' : 'Browse All Products'}</span>
              </Link>
            </div>
          </div>
        )}

        <TrustBadgesRow />
      </div>
    </div>
  );
}
