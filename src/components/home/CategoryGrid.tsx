'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useStore } from '@/context/StoreContext';
import { ArrowRight } from 'lucide-react';

export const CategoryGrid: React.FC = () => {
  const { isRtl, categories } = useStore();

  const displayCategories = categories.length > 0 ? categories : [];

  return (
    <section className="py-4 sm:py-8 bg-white">
      <div className="max-w-[1536px] mx-auto px-4 sm:px-6">
        {/* Section Header (Desktop/Tablet) */}
        <div className="hidden sm:flex items-center justify-between mb-6">
          <h2 className="text-xl sm:text-2xl font-black text-gray-900 tracking-tight">
            {isRtl ? 'تسوق حسب الأقسام' : 'Shop by Category'}
          </h2>

          <Link
            href="/products"
            className="inline-flex items-center gap-1 text-[13px] sm:text-[14px] font-semibold text-blue-600 hover:text-blue-700 hover:underline transition-colors group"
          >
            <span>{isRtl ? 'كل الأقسام' : 'View All Categories'}</span>
            <ArrowRight className="w-4 h-4 rtl:rotate-180 transition-transform group-hover:translate-x-1 rtl:group-hover:-translate-x-1" />
          </Link>
        </div>

        {/* Mobile Horizontal Circle Category Strip */}
        <div className="sm:hidden flex items-start gap-3.5 overflow-x-auto scroll-smooth touch-pan-x [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden py-2 px-1">
          {displayCategories.map((cat) => (
            <Link
              key={cat.id}
              href={`/category/${cat.slug}`}
              className="flex-shrink-0 flex flex-col items-center text-center group w-[72px]"
            >
              {/* Circular / Rounded White Icon Card */}
              <div className="w-14 h-14 rounded-2xl bg-white border border-gray-200 shadow-2xs group-hover:border-blue-500 group-hover:shadow-sm transition-all duration-200 p-2 flex items-center justify-center relative overflow-hidden mb-1.5 active:scale-95">
                <Image
                  src={cat.image}
                  alt={cat.name}
                  fill
                  sizes="56px"
                  className="object-contain p-1 mix-blend-multiply group-hover:scale-110 transition-transform duration-200"
                />
              </div>

              {/* Label below with 2 lines max */}
              <span className="text-[11px] font-bold text-gray-800 group-hover:text-blue-600 transition-colors leading-snug line-clamp-2 min-h-[28px]">
                {isRtl ? cat.nameAr : cat.name}
              </span>
            </Link>
          ))}
        </div>

        {/* Desktop & Tablet Categories Grid */}
        <div className="hidden sm:grid grid-cols-3 md:grid-cols-5 gap-3 sm:gap-4 lg:gap-5">
          {displayCategories.map((cat) => (
            <Link
              key={cat.id}
              href={`/category/${cat.slug}`}
              className="group bg-white rounded-2xl border border-gray-200 hover:border-blue-500 hover:shadow-md transition-all duration-200 p-4 sm:p-5 flex flex-col items-center text-center"
            >
              {/* Product Hardware Cutout Image */}
              <div className="w-full aspect-[4/3] relative flex items-center justify-center mb-2 overflow-hidden">
                <Image
                  src={cat.image}
                  alt={cat.name}
                  fill
                  sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 20vw"
                  className="object-contain p-1 group-hover:scale-105 transition-transform duration-300"
                />
              </div>

              {/* Category Name */}
              <h3 className="text-[13px] sm:text-[15px] font-bold text-gray-900 group-hover:text-blue-600 transition-colors tracking-tight">
                {isRtl ? cat.nameAr : cat.name}
              </h3>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
};
