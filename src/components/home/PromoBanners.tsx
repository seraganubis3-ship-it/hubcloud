'use client';

import React, { useState, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useStore } from '@/context/StoreContext';
import { ArrowRight, Laptop, Server, Monitor } from 'lucide-react';

export const PromoBanners: React.FC = () => {
  const { isRtl } = useStore();
  const scrollRef = useRef<HTMLDivElement>(null);
  const [activeSlide, setActiveSlide] = useState(0);

  const banners = [
    {
      id: 1,
      badge: 'Pro Computing',
      badgeAr: 'لابتوبات ومحطات عمل',
      icon: Laptop,
      title: 'High-Performance Laptops',
      titleAr: 'لابتوبات الأعمال والمصممين',
      subtitle: 'Apple MacBook Pro, Dell Latitude & Lenovo ThinkPad with up to 3 years official warranty.',
      subtitleAr: 'أحدث أجهزة أبل ماك بوك وديل ولينوفو الأصلية بضمان معتمد وتقسيط مريح حتى 24 شهراً.',
      btnText: 'Shop Laptops',
      btnTextAr: 'تصفح اللابتوبات',
      href: '/category/laptops',
      image: '/images/banners/promo_laptops.jpg',
      badgeColor: 'bg-blue-500/25 text-blue-200 border-blue-400/40',
      btnColor: 'bg-blue-600 hover:bg-blue-500 text-white shadow-blue-600/30',
      highlightEn: 'Intel Ultra & Apple M3',
      highlightAr: 'معالجات Intel Ultra و Apple M3',
    },
    {
      id: 2,
      badge: 'Enterprise Infrastructure',
      badgeAr: 'بنية تحتية وشبكات',
      icon: Server,
      title: 'Cisco Switches & Firewalls',
      titleAr: 'سويتشات وجدران حماية معتمدة',
      subtitle: 'Cisco Catalyst Gigabit PoE+ switches, Fortinet FortiGate hardware firewalls and access points.',
      subtitleAr: 'سويتشات سيسكو المدارة وجدران الحماية فورتينت لربط وحماية بيانات الشركات مع دعم فني مستمر.',
      btnText: 'Explore Networking',
      btnTextAr: 'تصفح الشبكات',
      href: '/category/network-device',
      image: '/images/banners/promo_networking.jpg',
      badgeColor: 'bg-cyan-500/25 text-cyan-200 border-cyan-400/40',
      btnColor: 'bg-cyan-600 hover:bg-cyan-500 text-white shadow-cyan-600/30',
      highlightEn: 'Gigabit PoE+ & Zero-Trust',
      highlightAr: 'منافذ PoE+ وجدار حماية',
    },
    {
      id: 3,
      badge: 'Heavy Workstations',
      badgeAr: 'محطات عمل وإنتاجية فائقة',
      icon: Monitor,
      title: 'High-Performance Desktops',
      titleAr: 'محطات عمل وأجهزة ديسكتوب',
      subtitle: 'Dell Precision & Apple Mac Studio engineered for 3D modeling, deep rendering & 24/7 uptime.',
      subtitleAr: 'محطات عمل ديل بريسيجن وماك ستوديو مصممة للعمل الهندسي الشاق والرندرة والتشغيل المتواصل.',
      btnText: 'Explore Desktops',
      btnTextAr: 'تصفح محطات العمل',
      href: '/category/desktops',
      image: '/images/banners/promo_desktops.jpg',
      badgeColor: 'bg-indigo-500/25 text-indigo-200 border-indigo-400/40',
      btnColor: 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-indigo-600/30',
      highlightEn: 'RTX Ada & Intel Xeon',
      highlightAr: 'كروت RTX Ada و Xeon',
    },
  ];

  const handleScroll = () => {
    if (!scrollRef.current) return;
    const container = scrollRef.current;
    const scrollLeft = Math.abs(container.scrollLeft);
    const cardWidth = container.clientWidth * 0.85;
    if (cardWidth > 0) {
      const index = Math.round(scrollLeft / cardWidth);
      setActiveSlide(Math.min(Math.max(index, 0), banners.length - 1));
    }
  };

  const scrollToSlide = (index: number) => {
    if (!scrollRef.current) return;
    const container = scrollRef.current;
    const cards = container.querySelectorAll<HTMLElement>('[data-promo-card]');
    if (cards[index]) {
      cards[index].scrollIntoView({
        behavior: 'smooth',
        inline: 'center',
        block: 'nearest',
      });
      setActiveSlide(index);
    }
  };

  return (
    <section className="py-4 sm:py-6">
      <div className="max-w-[1536px] mx-auto px-4 sm:px-6">
        {/* On Mobile: Horizontal Swipeable Carousel (Snap Scroll). On Desktop: 3-Column Grid */}
        <div
          ref={scrollRef}
          onScroll={handleScroll}
          className="flex md:grid md:grid-cols-3 overflow-x-auto md:overflow-visible snap-x snap-mandatory md:snap-none gap-4 lg:gap-6 pb-2 md:pb-0 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        >
          {banners.map((b) => {
            const Icon = b.icon;
            return (
              <div
                key={b.id}
                data-promo-card
                className="w-[86vw] max-w-[360px] md:w-auto md:max-w-none shrink-0 md:shrink snap-center md:snap-align-none relative rounded-2xl sm:rounded-3xl overflow-hidden flex flex-col justify-between p-4 sm:p-6 text-white group shadow-lg hover:shadow-2xl transition-all duration-300 border border-slate-800 bg-gradient-to-br from-[#0a1528] via-[#0e2140] to-[#070e1b]"
              >
                {/* Top Section: Badge & Spec Highlight */}
                <div className="space-y-2 sm:space-y-2.5">
                  <div className="flex items-center justify-between gap-2">
                    <div
                      className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold border backdrop-blur-md ${b.badgeColor}`}
                    >
                      <Icon className="w-3.5 h-3.5" />
                      <span>{isRtl ? b.badgeAr : b.badge}</span>
                    </div>

                    <span className="text-[10px] font-mono text-slate-300 bg-white/10 backdrop-blur-md border border-white/15 px-2 py-0.5 rounded-md">
                      {isRtl ? b.highlightAr : b.highlightEn}
                    </span>
                  </div>

                  <h3 className="text-base sm:text-xl font-black text-white tracking-tight leading-snug text-left rtl:text-right drop-shadow-sm">
                    {isRtl ? b.titleAr : b.title}
                  </h3>

                  <p className="text-[11px] sm:text-xs text-slate-300 line-clamp-2 leading-relaxed font-normal text-left rtl:text-right">
                    {isRtl ? b.subtitleAr : b.subtitle}
                  </p>
                </div>

                {/* Middle Section: Dedicated Photographic Showcase (16:9 Aspect Ratio) */}
                <div className="relative w-full aspect-[16/9] rounded-xl sm:rounded-2xl overflow-hidden my-3 sm:my-4 border border-slate-700/60 shadow-lg bg-slate-950">
                  <Image
                    src={b.image}
                    alt={isRtl ? b.titleAr : b.title}
                    fill
                    className="object-contain sm:object-cover object-center group-hover:scale-105 transition-transform duration-500"
                    sizes="(max-width: 768px) 85vw, 33vw"
                  />
                </div>

                {/* Bottom Section: Action Link & Warranty */}
                <div className="pt-2 border-t border-white/10 flex items-center justify-between">
                  <Link
                    href={b.href}
                    className={`inline-flex items-center gap-2 text-xs font-extrabold px-3.5 py-2 sm:px-4 sm:py-2 rounded-xl transition-all shadow-md active:scale-95 ${b.btnColor}`}
                  >
                    <span>{isRtl ? b.btnTextAr : b.btnText}</span>
                    <ArrowRight className="w-3.5 h-3.5 rtl:rotate-180 group-hover:translate-x-0.5 rtl:group-hover:-translate-x-0.5 transition-transform" />
                  </Link>

                  <span className="text-[10px] sm:text-[11px] text-slate-400 font-medium">
                    {isRtl ? 'ضمان محلي معتمد' : 'Official Warranty'}
                  </span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Mobile Pagination Indicator Dots */}
        <div className="flex md:hidden justify-center items-center gap-2 pt-3">
          {banners.map((_, i) => (
            <button
              key={i}
              onClick={() => scrollToSlide(i)}
              aria-label={`Go to promo banner ${i + 1}`}
              className={`h-1.5 rounded-full transition-all duration-300 ${
                activeSlide === i ? 'w-6 bg-blue-500' : 'w-2 bg-slate-300 hover:bg-slate-400'
              }`}
            />
          ))}
        </div>
      </div>
    </section>
  );
};
