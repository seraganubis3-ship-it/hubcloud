'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useStore } from '@/context/StoreContext';
import { ArrowRight, Layers } from 'lucide-react';

export const CategoryGrid: React.FC = () => {
  const { isRtl, categories } = useStore();

  const displayCategories = categories.length > 0 ? categories : [];

  return (
    <section className="py-4 sm:py-6">
      <div className="max-w-[1536px] mx-auto px-4 sm:px-6">
        {/* Section Header */}
        <div className="flex items-center justify-between mb-4 sm:mb-6">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
              <Layers className="w-4 h-4" />
            </div>
            <h2 className="text-lg sm:text-2xl font-black text-gray-900 tracking-tight">
              {isRtl ? 'تسوق حسب الأقسام' : 'Shop by Category'}
            </h2>
          </div>

          <Link
            href="/products"
            className="inline-flex items-center gap-1 text-xs sm:text-sm font-bold text-blue-600 hover:text-blue-700 transition-colors group"
          >
            <span>{isRtl ? 'كل الأقسام' : 'View All Categories'}</span>
            <ArrowRight className="w-4 h-4 rtl:rotate-180 transition-transform group-hover:translate-x-1 rtl:group-hover:-translate-x-1" />
          </Link>
        </div>

        {/* Mobile Horizontal Snap Category Strip */}
        <div
          dir={isRtl ? 'rtl' : 'ltr'}
          className="sm:hidden flex items-stretch gap-3 overflow-x-auto scroll-smooth snap-x snap-mandatory [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden py-2 px-1"
        >
          {displayCategories.map((cat) => (
            <Link
              key={cat.id}
              href={`/category/${cat.slug}`}
              className="snap-start flex-shrink-0 w-[130px] bg-white rounded-2xl border border-gray-200/90 p-3 flex flex-col items-center text-center shadow-xs active:scale-95 transition-all duration-200 group"
            >
              <div className="w-16 h-16 relative flex items-center justify-center mb-2">
                <Image
                  src={cat.image}
                  alt={cat.name}
                  fill
                  sizes="64px"
                  className="object-contain drop-shadow-sm group-hover:scale-110 transition-transform duration-200"
                />
              </div>

              <span className="text-xs font-bold text-gray-900 leading-snug line-clamp-2">
                {isRtl ? cat.nameAr : cat.name}
              </span>
            </Link>
          ))}
        </div>

        {/* Desktop & Tablet Categories Grid */}
        <div className="hidden sm:grid sm:grid-cols-3 md:grid-cols-5 gap-3.5 sm:gap-4 lg:gap-5">
          {displayCategories.map((cat) => (
            <Link
              key={cat.id}
              href={`/category/${cat.slug}`}
              className="group bg-slate-50/70 hover:bg-white rounded-2xl sm:rounded-3xl border border-gray-200/80 hover:border-blue-500/50 hover:shadow-lg transition-all duration-300 p-5 flex flex-col items-center text-center"
            >
              {/* Product Hardware Cutout Image */}
              <div className="w-full aspect-[4/3] relative flex items-center justify-center mb-2.5 overflow-hidden">
                <Image
                  src={cat.image}
                  alt={cat.name}
                  fill
                  sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 20vw"
                  className="object-contain p-2 group-hover:scale-110 drop-shadow-sm transition-transform duration-300"
                />
              </div>

              {/* Category Name & Indicator */}
              <h3 className="text-sm sm:text-base font-black text-gray-900 group-hover:text-blue-600 transition-colors tracking-tight mb-1">
                {isRtl ? cat.nameAr : cat.name}
              </h3>
              <span className="text-[11px] font-semibold text-slate-400 group-hover:text-blue-500 transition-colors flex items-center gap-0.5">
                <span>{isRtl ? 'استعراض' : 'Explore'}</span>
                <ArrowRight className="w-3 h-3 rtl:rotate-180 group-hover:translate-x-0.5 rtl:group-hover:-translate-x-0.5 transition-transform" />
              </span>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
};
