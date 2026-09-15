'use client';

import React from 'react';
import Link from 'next/link';
import { ProductCard } from '@/components/product/ProductCard';
import { ProductCardSkeleton } from '@/components/product/ProductCardSkeleton';
import { useStore } from '@/context/StoreContext';
import { ArrowRight, Trophy } from 'lucide-react';

export const BestSellersSection: React.FC = () => {
  const { isRtl, products, isCatalogLoading } = useStore();

  const bestSellers = (products.length > 0 ? products : [])
    .filter(p => p.isBestSeller)
    .slice(0, 5);

  return (
    <section className="py-6 sm:py-8 bg-white">
      <div className="max-w-[1536px] mx-auto px-4 sm:px-6">
        {/* Section Header */}
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-2">
            <Trophy className="w-5 h-5 text-amber-500" />
            <h2 className="text-lg sm:text-2xl font-black text-gray-900 tracking-tight">
              {isRtl ? 'الأكثر مبيعاً' : 'Best Sellers & Top Rated'}
            </h2>
          </div>

          <Link
            href="/products?filter=bestseller"
            className="text-[12px] sm:text-[13px] font-extrabold text-hub-blue hover:text-hub-blue-dark flex items-center gap-1 group"
          >
            <span>{isRtl ? 'عرض الكل' : 'View All'}</span>
            <ArrowRight className="w-4 h-4 rtl:rotate-180 transition-transform group-hover:translate-x-0.5 rtl:group-hover:-translate-x-0.5" />
          </Link>
        </div>

        {/* Responsive 2-column mobile, 3-tablet, 5-desktop grid */}
        <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-2.5 sm:gap-4">
          {isCatalogLoading && bestSellers.length === 0
            ? [...Array(5)].map((_, i) => <ProductCardSkeleton key={i} viewMode="grid" />)
            : bestSellers.map(product => (
                <ProductCard key={product.id} product={product} />
              ))}
        </div>
      </div>
    </section>
  );
};
