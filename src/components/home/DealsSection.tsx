'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { ProductCard } from '@/components/product/ProductCard';
import { ProductCardSkeleton } from '@/components/product/ProductCardSkeleton';
import { useStore } from '@/context/StoreContext';
import { Clock, ArrowRight, Flame } from 'lucide-react';

export const DealsSection: React.FC = () => {
  const { isRtl, products, isCatalogLoading } = useStore();

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
    .slice(0, 5);

  return (
    <section className="py-6 sm:py-8 bg-gray-50/70 border-y border-gray-200/80">
      <div className="max-w-[1536px] mx-auto px-4 sm:px-6">
        {/* Section Header with Countdown Timer */}
        <div className="flex flex-wrap items-center justify-between gap-3 mb-5">
          <div className="flex flex-wrap items-center gap-2.5">
            <h2 className="text-lg sm:text-2xl font-black text-gray-900 tracking-tight flex items-center gap-2">
              <Flame className="w-5 h-5 text-hub-red fill-hub-red" />
              <span>{isRtl ? 'عروض اليوم' : "Today's Deals"}</span>
            </h2>

            {/* Countdown Badge */}
            <div className="flex items-center gap-1.5 bg-hub-red text-white text-[11px] sm:text-[12px] font-black px-3 py-1 rounded-full shadow-badge">
              <Clock className="w-3.5 h-3.5" />
              <span>{isRtl ? 'باقي على الانتهاء' : 'Ends in'}</span>
              <span className="font-mono tracking-wider font-black" dir="ltr">
                {formatDigit(timeLeft.hours)}:{formatDigit(timeLeft.minutes)}:{formatDigit(timeLeft.seconds)}
              </span>
            </div>
          </div>

          <Link
            href="/deals"
            className="text-[12px] sm:text-[13px] font-extrabold text-hub-blue hover:text-hub-blue-dark flex items-center gap-1 group"
          >
            <span>{isRtl ? 'كل العروض' : 'View All Deals'}</span>
            <ArrowRight className="w-4 h-4 rtl:rotate-180 transition-transform group-hover:translate-x-0.5 rtl:group-hover:-translate-x-0.5" />
          </Link>
        </div>

        {/* Responsive 2-column mobile, 3-tablet, 5-desktop grid */}
        <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-2.5 sm:gap-4">
          {isCatalogLoading && dealProducts.length === 0
            ? [...Array(5)].map((_, i) => <ProductCardSkeleton key={i} viewMode="grid" />)
            : dealProducts.map(product => (
                <ProductCard key={product.id} product={product} />
              ))}
        </div>
      </div>
    </section>
  );
};
