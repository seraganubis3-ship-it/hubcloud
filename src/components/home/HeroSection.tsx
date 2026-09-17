'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useStore } from '@/context/StoreContext';
import { ChevronLeft, ChevronRight } from 'lucide-react';

export const HeroSection: React.FC = () => {
  const { isRtl } = useStore();
  const [currentSlide, setCurrentSlide] = useState(0);

  const banners = [
    {
      id: 1,
      title: 'High-End Laptops & Mobile Workstations',
      titleAr: 'لابتوبات ومحطات عمل احترافية فائقة الأداء',
      primaryHref: '/category/laptops',
      image: '/images/banners/hero_laptops.jpg',
    },
    {
      id: 2,
      title: 'High-Performance Desktops & Workstations',
      titleAr: 'محطات عمل وأجهزة ديسكتوب فائقة القوة',
      primaryHref: '/category/desktops',
      image: '/images/banners/hero_desktops.jpg',
    },
    {
      id: 3,
      title: 'Enterprise Infrastructure & Networking Solutions',
      titleAr: 'سويتشات Cisco المدارة وجدران حماية Fortinet',
      primaryHref: '/category/network-device',
      image: '/images/banners/hero_network.jpg',
    },
  ];

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % banners.length);
    }, 7000);
    return () => clearInterval(timer);
  }, [banners.length]);

  return (
    <section className="pt-2 sm:pt-4 pb-2">
      <div className="max-w-[1536px] mx-auto px-3 sm:px-6">
        {/* Full Photographic Image Banner Slider (Widescreen Horizontal Layout - 100% Complete & Uncropped) */}
        <div className="relative rounded-2xl sm:rounded-3xl overflow-hidden shadow-lg group bg-slate-950 w-full h-[200px] sm:h-[280px] md:h-[360px] lg:h-[430px] xl:h-[480px] border border-slate-800/80">
          {banners.map((b, index) => {
            const isActive = index === currentSlide;
            return (
              <Link
                key={b.id}
                href={b.primaryHref}
                aria-label={isRtl ? b.titleAr : b.title}
                className={`absolute inset-0 block w-full h-full transition-opacity duration-700 ease-in-out ${
                  isActive ? 'opacity-100 z-10 pointer-events-auto' : 'opacity-0 z-0 pointer-events-none'
                }`}
              >
                {/* Real High-Resolution Studio Photography Banner Image - 100% Uncropped */}
                <Image
                  src={b.image}
                  alt={isRtl ? b.titleAr : b.title}
                  fill
                  priority={index === 0}
                  className="object-contain sm:object-cover object-center w-full h-full"
                  sizes="(max-width: 1536px) 100vw, 1536px"
                />
              </Link>
            );
          })}

          {/* Navigation Arrows */}
          <button
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              setCurrentSlide((prev) => (prev - 1 + banners.length) % banners.length);
            }}
            aria-label="Previous Slide"
            className="absolute left-3 sm:left-5 top-1/2 -translate-y-1/2 z-20 w-8 h-8 sm:w-11 sm:h-11 rounded-full bg-slate-950/60 hover:bg-slate-900 text-white flex items-center justify-center backdrop-blur-md border border-white/15 opacity-0 group-hover:opacity-100 transition-all duration-200 hover:scale-105 shadow-lg"
          >
            <ChevronLeft className="w-4 h-4 sm:w-6 sm:h-6 rtl:rotate-180" />
          </button>

          <button
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              setCurrentSlide((prev) => (prev + 1) % banners.length);
            }}
            aria-label="Next Slide"
            className="absolute right-3 sm:right-5 top-1/2 -translate-y-1/2 z-20 w-8 h-8 sm:w-11 sm:h-11 rounded-full bg-slate-950/60 hover:bg-slate-900 text-white flex items-center justify-center backdrop-blur-md border border-white/15 opacity-0 group-hover:opacity-100 transition-all duration-200 hover:scale-105 shadow-lg"
          >
            <ChevronRight className="w-4 h-4 sm:w-6 sm:h-6 rtl:rotate-180" />
          </button>

          {/* Navigation Dots Indicator */}
          <div className="absolute bottom-2.5 sm:bottom-4 left-1/2 -translate-x-1/2 z-20 flex items-center gap-1.5 sm:gap-2 bg-slate-950/60 backdrop-blur-md px-3 py-1.5 rounded-full border border-white/15 shadow-md">
            {banners.map((_, i) => (
              <button
                key={i}
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  setCurrentSlide(i);
                }}
                aria-label={`Go to slide ${i + 1}`}
                className={`h-1.5 sm:h-2 rounded-full transition-all duration-300 ${
                  currentSlide === i ? 'w-5 sm:w-7 bg-blue-500' : 'w-1.5 sm:w-2 bg-white/40 hover:bg-white/70'
                }`}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};
