'use client';

import React, { useRef } from 'react';
import Link from 'next/link';
import { ProductCard } from '@/components/product/ProductCard';
import { ProductCardSkeleton } from '@/components/product/ProductCardSkeleton';
import { useStore } from '@/context/StoreContext';
import { ArrowRight, Trophy, ChevronLeft, ChevronRight } from 'lucide-react';

export const BestSellersSection: React.FC = () => {
  const { isRtl, products, isCatalogLoading } = useStore();
  const scrollRef = useRef<HTMLDivElement>(null);

  const bestSellers = (products.length > 0 ? products : [])
    .filter(p => p.isBestSeller)
    .slice(0, 10);

  const scroll = (direction: 'left' | 'right') => {
    if (!scrollRef.current) return;
    const distance = 300;
    const factor = isRtl ? (direction === 'left' ? 1 : -1) : (direction === 'left' ? -1 : 1);
    scrollRef.current.scrollBy({ left: distance * factor, behavior: 'smooth' });
  };

  return (
    <section className="py-6 sm:py-8 bg-white">
      <div className="max-w-[1536px] mx-auto px-4 sm:px-6">
        {/* Section Header */}
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-500 flex items-center justify-center">
              <Trophy className="w-4 h-4" />
            </div>
            <h2 className="text-lg sm:text-2xl font-black text-gray-900 tracking-tight">
              {isRtl ? 'الأكثر طلباً ومبيعاً' : 'Best Sellers & Top Rated'}
            </h2>
          </div>

          <Link
            href="/products?filter=bestseller"
            className="text-xs sm:text-sm font-extrabold text-blue-600 hover:text-blue-700 flex items-center gap-1 group"
          >
            <span>{isRtl ? 'عرض الكل' : 'View All'}</span>
            <ArrowRight className="w-4 h-4 rtl:rotate-180 transition-transform group-hover:translate-x-0.5 rtl:group-hover:-translate-x-0.5" />
          </Link>
        </div>

        {/* Carousel Container with Left/Right Navigation Arrows on the Sides */}
        <div className="relative">
          {/* Left Arrow Button */}
          <button
            onClick={() => scroll('left')}
            aria-label="Scroll left"
            className="hidden sm:flex absolute -left-3 lg:-left-5 top-1/2 -translate-y-1/2 z-20 w-10 h-10 rounded-full bg-white/95 hover:bg-white border border-gray-200 hover:border-blue-500 text-gray-700 hover:text-blue-600 items-center justify-center transition-all shadow-md hover:scale-110 active:scale-95"
          >
            <ChevronLeft className="w-5 h-5 rtl:rotate-180" />
          </button>

          {/* Right Arrow Button */}
          <button
            onClick={() => scroll('right')}
            aria-label="Scroll right"
            className="hidden sm:flex absolute -right-3 lg:-right-5 top-1/2 -translate-y-1/2 z-20 w-10 h-10 rounded-full bg-white/95 hover:bg-white border border-gray-200 hover:border-blue-500 text-gray-700 hover:text-blue-600 items-center justify-center transition-all shadow-md hover:scale-110 active:scale-95"
          >
            <ChevronRight className="w-5 h-5 rtl:rotate-180" />
          </button>

          {/* Horizontal Smooth Carousel with Snap */}
          <div
            ref={scrollRef}
            dir={isRtl ? 'rtl' : 'ltr'}
            className="flex items-stretch gap-3 sm:gap-4 overflow-x-auto scroll-smooth snap-x snap-mandatory [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden py-2 px-1 sm:px-0"
          >
            {isCatalogLoading && bestSellers.length === 0
              ? [...Array(5)].map((_, i) => (
                  <div key={i} className="w-[180px] sm:w-[230px] md:w-[260px] flex-shrink-0 snap-start">
                    <ProductCardSkeleton viewMode="grid" />
                  </div>
                ))
              : bestSellers.map(product => (
                  <div key={product.id} className="w-[180px] sm:w-[230px] md:w-[260px] flex-shrink-0 snap-start">
                    <ProductCard product={product} />
                  </div>
                ))}
          </div>
        </div>
      </div>
    </section>
  );
};
