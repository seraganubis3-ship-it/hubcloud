'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { ProductCard } from '@/components/product/ProductCard';
import { ProductCardSkeleton } from '@/components/product/ProductCardSkeleton';
import { useStore } from '@/context/StoreContext';
import { Clock, ArrowRight, Flame, ChevronLeft, ChevronRight } from 'lucide-react';

export const DealsSection: React.FC = () => {
  const { isRtl, products, isCatalogLoading } = useStore();
  const scrollRef = useRef<HTMLDivElement>(null);

  // Live countdown timer state (Hours, Minutes, Seconds)
  const [timeLeft, setTimeLeft] = useState({
    hours: 8,
    minutes: 24,
    seconds: 35
  });

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev.seconds > 0) {
          return { ...prev, seconds: prev.seconds - 1 };
        } else if (prev.minutes > 0) {
          return { ...prev, minutes: 59, seconds: 59 };
        } else if (prev.hours > 0) {
          return { hours: prev.hours - 1, minutes: 59, seconds: 59 };
        }
        return { hours: 23, minutes: 59, seconds: 59 };
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const formatDigit = (num: number) => num.toString().padStart(2, '0');

  // Filter deal products dynamically from DB
  const dealProducts = (products.length > 0 ? products : [])
    .filter(p => p.isDeal)
    .slice(0, 10);

  // Auto-hide section completely if no deals are active today
  if (!isCatalogLoading && dealProducts.length === 0) {
    return null;
  }

  // If catalog is loaded and empty of deals, do not render
  if (products.length > 0 && dealProducts.length === 0) {
    return null;
  }

  const scroll = (direction: 'left' | 'right') => {
    if (!scrollRef.current) return;
    const distance = 300;
    const factor = isRtl ? (direction === 'left' ? 1 : -1) : (direction === 'left' ? -1 : 1);
    scrollRef.current.scrollBy({ left: distance * factor, behavior: 'smooth' });
  };

  return (
    <section className="py-6 sm:py-8 bg-slate-50/60 border-y border-slate-200/80">
      <div className="max-w-[1536px] mx-auto px-4 sm:px-6">
        {/* Section Header with Countdown Timer & Navigation */}
        <div className="flex flex-wrap items-center justify-between gap-3 mb-5">
          <div className="flex flex-wrap items-center gap-3">
            <h2 className="text-lg sm:text-2xl font-black text-gray-900 tracking-tight flex items-center gap-2">
              <Flame className="w-5 h-5 text-red-500 fill-red-500 animate-pulse" />
              <span>{isRtl ? 'عروض اليوم الحصرية' : "Today's Deals"}</span>
            </h2>

            {/* Countdown Badge */}
            <div className="flex items-center gap-1.5 bg-gradient-to-r from-red-600 to-rose-600 text-white text-[11px] sm:text-xs font-black px-3 py-1 rounded-full shadow-xs">
              <Clock className="w-3.5 h-3.5" />
              <span>{isRtl ? 'ينتهي خلال' : 'Ends in'}</span>
              <span className="font-mono tracking-wider font-black" dir="ltr">
                {formatDigit(timeLeft.hours)}:{formatDigit(timeLeft.minutes)}:{formatDigit(timeLeft.seconds)}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Carousel Nav Arrows */}
            <div className="hidden sm:flex items-center gap-1.5">
              <button
                onClick={() => scroll('left')}
                aria-label="Scroll left"
                className="w-8 h-8 rounded-full bg-white border border-gray-200 hover:border-blue-500 hover:bg-blue-50 text-gray-700 hover:text-blue-600 flex items-center justify-center transition-all shadow-2xs active:scale-95"
              >
                <ChevronLeft className="w-4 h-4 rtl:rotate-180" />
              </button>
              <button
                onClick={() => scroll('right')}
                aria-label="Scroll right"
                className="w-8 h-8 rounded-full bg-white border border-gray-200 hover:border-blue-500 hover:bg-blue-50 text-gray-700 hover:text-blue-600 flex items-center justify-center transition-all shadow-2xs active:scale-95"
              >
                <ChevronRight className="w-4 h-4 rtl:rotate-180" />
              </button>
            </div>

            <Link
              href="/deals"
              className="text-xs sm:text-sm font-extrabold text-blue-600 hover:text-blue-700 flex items-center gap-1 group"
            >
              <span>{isRtl ? 'كل العروض' : 'View All'}</span>
              <ArrowRight className="w-4 h-4 rtl:rotate-180 transition-transform group-hover:translate-x-0.5 rtl:group-hover:-translate-x-0.5" />
            </Link>
          </div>
        </div>

        {/* Horizontal Smooth Carousel with Snap */}
        <div
          ref={scrollRef}
          dir={isRtl ? 'rtl' : 'ltr'}
          className="flex items-stretch gap-3 sm:gap-4 overflow-x-auto scroll-smooth snap-x snap-mandatory [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden py-2 px-1 sm:px-0"
        >
          {isCatalogLoading && dealProducts.length === 0
            ? [...Array(5)].map((_, i) => (
                <div key={i} className="w-[180px] sm:w-[230px] md:w-[260px] flex-shrink-0 snap-start">
                  <ProductCardSkeleton viewMode="grid" />
                </div>
              ))
            : dealProducts.map((product) => (
                <div key={product.id} className="w-[180px] sm:w-[230px] md:w-[260px] flex-shrink-0 snap-start">
                  <ProductCard product={product} />
                </div>
              ))}
        </div>
      </div>
    </section>
  );
};
