'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useStore } from '@/context/StoreContext';
import { ChevronLeft, ChevronRight, ArrowRight, ShieldCheck, Zap } from 'lucide-react';

export const HeroSection: React.FC = () => {
  const { isRtl } = useStore();
  const [currentSlide, setCurrentSlide] = useState(0);

  const banners = [
    {
      id: 1,
      title: 'Next-Gen Laptops & Ultrabooks',
      href: '/category/laptops',
      image: '/images/hero_banner_1.jpg'
    },
    {
      id: 2,
      title: 'High-Performance Desktops & Workstations',
      href: '/category/desktops',
      image: '/images/hero_banner_2.jpg'
    },
    {
      id: 3,
      title: 'Enterprise Tech Hardware Solutions',
      href: '/products',
      image: '/images/hero_banner_3.jpg'
    }
  ];

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % banners.length);
    }, 5500);
    return () => clearInterval(timer);
  }, [banners.length]);

  return (
    <section className="pt-2 pb-4">
      <div className="max-w-[1536px] mx-auto px-4 sm:px-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 lg:gap-5 items-stretch">
          {/* Main Full Graphic Banner Slider (8 or 9 cols on desktop) */}
          <div className="lg:col-span-8 xl:col-span-9 relative rounded-2xl sm:rounded-3xl overflow-hidden shadow-sm group bg-slate-900 h-[240px] sm:h-[340px] md:h-[390px] lg:h-[430px] w-full">
            {banners.map((b, index) => (
              <Link
                key={b.id}
                href={b.href}
                aria-label={b.title}
                className={`absolute inset-0 transition-opacity duration-700 ease-in-out ${
                  index === currentSlide ? 'opacity-100 z-10 pointer-events-auto' : 'opacity-0 z-0 pointer-events-none'
                }`}
              >
                <Image
                  src={b.image}
                  alt={b.title}
                  fill
                  priority={index === 0}
                  className="object-cover object-center w-full h-full"
                  sizes="(max-width: 1024px) 100vw, 1100px"
                />
              </Link>
            ))}

            {/* Navigation Arrows */}
            <button
              onClick={(e) => {
                e.preventDefault();
                setCurrentSlide((prev) => (prev - 1 + banners.length) % banners.length);
              }}
              aria-label="Previous Banner"
              className="absolute left-3 top-1/2 -translate-y-1/2 z-20 w-9 h-9 sm:w-11 sm:h-11 rounded-full bg-black/40 hover:bg-black/75 text-white flex items-center justify-center backdrop-blur-md opacity-0 group-hover:opacity-100 transition-all duration-200 hover:scale-105"
            >
              <ChevronLeft className="w-5 h-5 sm:w-6 sm:h-6 rtl:rotate-180" />
            </button>

            <button
              onClick={(e) => {
                e.preventDefault();
                setCurrentSlide((prev) => (prev + 1) % banners.length);
              }}
              aria-label="Next Banner"
              className="absolute right-3 top-1/2 -translate-y-1/2 z-20 w-9 h-9 sm:w-11 sm:h-11 rounded-full bg-black/40 hover:bg-black/75 text-white flex items-center justify-center backdrop-blur-md opacity-0 group-hover:opacity-100 transition-all duration-200 hover:scale-105"
            >
              <ChevronRight className="w-5 h-5 sm:w-6 sm:h-6 rtl:rotate-180" />
            </button>

            {/* Navigation Dots Indicator */}
            <div className="absolute bottom-3 sm:bottom-4 left-1/2 -translate-x-1/2 z-20 flex items-center gap-2 bg-black/30 backdrop-blur-md px-3 py-1.5 rounded-full">
              {banners.map((_, i) => (
                <button
                  key={i}
                  onClick={(e) => {
                    e.preventDefault();
                    setCurrentSlide(i);
                  }}
                  aria-label={`Go to slide ${i + 1}`}
                  className={`h-2 rounded-full transition-all duration-300 ${
                    currentSlide === i ? 'w-6 sm:w-8 bg-hub-blue' : 'w-2 sm:w-2.5 bg-white/60 hover:bg-white'
                  }`}
                />
              ))}
            </div>
          </div>

          {/* Responsive Dual Side Promo Cards (Grid on mobile/tablet, column on desktop) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:flex lg:flex-col gap-3 sm:gap-4 lg:col-span-4 xl:col-span-3 lg:h-[430px]">
            {/* Card 1: Laptops & Workstations */}
            <Link
              href="/category/laptops"
              className="rounded-2xl sm:rounded-3xl bg-gradient-to-br from-[#0B1528] via-[#102447] to-[#173873] text-white p-4 sm:p-5 flex flex-col justify-between relative overflow-hidden group border border-blue-900/40 hover:border-hub-blue hover:shadow-lg transition-all duration-300 min-h-[140px] sm:min-h-[160px] lg:flex-1"
            >
              {/* Subtle background glow */}
              <div className="absolute -right-6 -bottom-6 w-32 h-32 bg-blue-500/20 rounded-full blur-2xl pointer-events-none group-hover:bg-blue-500/30 transition-colors" />

              {/* Hardware Product Cutout on side */}
              <div className="absolute right-2 bottom-2 rtl:right-auto rtl:left-2 w-28 sm:w-32 h-24 sm:h-28 pointer-events-none group-hover:scale-110 transition-transform duration-300">
                <Image
                  src="/images/category_laptops.jpg"
                  alt="Laptops"
                  fill
                  className="object-contain drop-shadow-[0_10px_15px_rgba(0,0,0,0.5)]"
                />
              </div>

              {/* Content */}
              <div className="relative z-10 max-w-[70%] sm:max-w-[65%] space-y-1">
                <span className="inline-flex items-center gap-1 text-[10px] font-extrabold uppercase tracking-wider px-2 py-0.5 rounded-md bg-hub-blue text-white shadow-xs">
                  <Zap className="w-3 h-3" />
                  <span>{isRtl ? 'أجهزة بيزنس وجيمنج' : 'Business & Gaming'}</span>
                </span>
                <h3 className="text-sm sm:text-[16px] font-black leading-tight pt-1 group-hover:text-blue-300 transition-colors">
                  {isRtl ? 'لابتوبات ومحطات عمل' : 'Laptops & Workstations'}
                </h3>
                <p className="text-[11px] text-blue-200/80 leading-snug line-clamp-2">
                  {isRtl ? 'Dell Precision و ThinkPad و MacBook بأفضل الأسعار.' : 'Precision, ThinkPad & MacBook Pro with official warranty.'}
                </p>
              </div>

              {/* Action Button */}
              <div className="relative z-10 pt-2">
                <span className="inline-flex items-center gap-1.5 text-[12px] font-bold text-white group-hover:text-blue-300 transition-colors">
                  <span>{isRtl ? 'تصفح الأجهزة' : 'Shop Now'}</span>
                  <ArrowRight className="w-3.5 h-3.5 rtl:rotate-180 group-hover:translate-x-1 rtl:group-hover:-translate-x-1 transition-transform" />
                </span>
              </div>
            </Link>

            {/* Card 2: Enterprise Networking */}
            <Link
              href="/category/network-device"
              className="rounded-2xl sm:rounded-3xl bg-gradient-to-br from-[#091C24] via-[#0E2F38] to-[#124B4C] text-white p-4 sm:p-5 flex flex-col justify-between relative overflow-hidden group border border-teal-900/40 hover:border-emerald-400 hover:shadow-lg transition-all duration-300 min-h-[140px] sm:min-h-[160px] lg:flex-1"
            >
              {/* Subtle background glow */}
              <div className="absolute -right-6 -bottom-6 w-32 h-32 bg-teal-500/20 rounded-full blur-2xl pointer-events-none group-hover:bg-teal-500/30 transition-colors" />

              {/* Hardware Product Cutout on side */}
              <div className="absolute right-2 bottom-2 rtl:right-auto rtl:left-2 w-28 sm:w-32 h-24 sm:h-28 pointer-events-none group-hover:scale-110 transition-transform duration-300">
                <Image
                  src="/images/category_network.jpg"
                  alt="Networking"
                  fill
                  className="object-contain drop-shadow-[0_10px_15px_rgba(0,0,0,0.5)]"
                />
              </div>

              {/* Content */}
              <div className="relative z-10 max-w-[70%] sm:max-w-[65%] space-y-1">
                <span className="inline-flex items-center gap-1 text-[10px] font-extrabold uppercase tracking-wider px-2 py-0.5 rounded-md bg-teal-600 text-white shadow-xs">
                  <ShieldCheck className="w-3 h-3" />
                  <span>{isRtl ? 'تجهيز شركات ومؤسسات' : 'Enterprise Solutions'}</span>
                </span>
                <h3 className="text-sm sm:text-[16px] font-black leading-tight pt-1 group-hover:text-teal-200 transition-colors">
                  {isRtl ? 'سويتشات وشبكات Cisco' : 'Switches & Network Gear'}
                </h3>
                <p className="text-[11px] text-teal-200/80 leading-snug line-clamp-2">
                  {isRtl ? 'حلول سويتشات PoE وراوترات مدارة للشركات والبنوك.' : 'Cisco, Fortinet & Ubiquiti enterprise gear.'}
                </p>
              </div>

              {/* Action Button */}
              <div className="relative z-10 pt-2">
                <span className="inline-flex items-center gap-1.5 text-[12px] font-bold text-white group-hover:text-teal-200 transition-colors">
                  <span>{isRtl ? 'تصفح الشبكات' : 'Shop Networking'}</span>
                  <ArrowRight className="w-3.5 h-3.5 rtl:rotate-180 group-hover:translate-x-1 rtl:group-hover:-translate-x-1 transition-transform" />
                </span>
              </div>
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
};
