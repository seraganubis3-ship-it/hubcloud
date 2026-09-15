'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useStore } from '@/context/StoreContext';
import { ArrowRight } from 'lucide-react';

export const PromoTriBanner: React.FC = () => {
  const { isRtl } = useStore();

  const banners = [
    {
      id: 1,
      badge: 'High Compute',
      badgeAr: 'أداء فائق',
      title: 'Enterprise Desktops & Workstations',
      titleAr: 'أجهزة ديسكتوب ووركستيشن للشركات',
      subtitle: 'Engineered for high-compute performance and daily reliability.',
      subtitleAr: 'مصممة للإنتاجية العالية والأعمال الهندسية والمكتبية المتواصلة.',
      gradient: 'from-[#0A192F] via-[#112E51] to-[#1E3A8A]',
      buttonText: 'Shop Desktops',
      buttonTextAr: 'تصفح الأجهزة',
      href: '/category/desktops',
      image: '/images/category_desktops.jpg'
    },
    {
      id: 2,
      badge: 'Fast Archiving',
      badgeAr: 'أرشفة إلكترونية',
      title: 'Document Scanners & Digital Archiving',
      titleAr: 'الماسحات الضوئية والأرشفة الإلكترونية',
      subtitle: 'High speed duplex scanning with auto document feeders.',
      subtitleAr: 'سحب مستندات فائق السرعة على الوجهين للبنوك والشركات.',
      gradient: 'from-[#06382B] via-[#084D3B] to-[#047857]',
      buttonText: 'Shop Scanners',
      buttonTextAr: 'تصفح الماسحات',
      href: '/category/scanner',
      image: '/images/category_scanner.jpg'
    },
    {
      id: 3,
      badge: 'PoE & Gigabit',
      badgeAr: 'شبكات وسويتشات',
      title: 'Network Solutions That Scale',
      titleAr: 'حلول وبنية شبكات متطورة',
      subtitle: 'Gigabit PoE switches, Wi-Fi 6 routers, and secure gateways.',
      subtitleAr: 'سويتشات مدارة وراوترات واي فاي 6 فائقة الاستقرار.',
      gradient: 'from-[#19163B] via-[#241E54] to-[#312E81]',
      buttonText: 'Shop Networking',
      buttonTextAr: 'تصفح الشبكات',
      href: '/category/network-device',
      image: '/images/category_network.jpg'
    }
  ];

  return (
    <section className="py-6">
      <div className="max-w-[1536px] mx-auto px-4 sm:px-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {banners.map(b => (
            <div
              key={b.id}
              className={`rounded-3xl bg-gradient-to-br ${b.gradient} text-white p-6 flex flex-col justify-between min-h-[200px] relative overflow-hidden group shadow-md border border-white/10 hover:shadow-xl transition-all duration-300 hover:-translate-y-1`}
            >
              {/* Product graphic */}
              <div className="absolute right-0 bottom-0 rtl:right-auto rtl:left-0 w-36 h-36 opacity-85 group-hover:scale-110 transition-transform duration-500 pointer-events-none rounded-xl overflow-hidden">
                <Image
                  src={b.image}
                  alt={b.title}
                  fill
                  className="object-contain drop-shadow-[0_15px_20px_rgba(0,0,0,0.6)]"
                />
              </div>

              {/* Text content */}
              <div className="relative z-10 max-w-[65%] space-y-1.5">
                <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-md bg-white/15 text-white/90 backdrop-blur-sm inline-block">
                  {isRtl ? b.badgeAr : b.badge}
                </span>
                <h3 className="text-[16px] font-black leading-tight drop-shadow-sm">
                  {isRtl ? b.titleAr : b.title}
                </h3>
                <p className="text-[12px] text-slate-200 leading-snug">
                  {isRtl ? b.subtitleAr : b.subtitle}
                </p>
              </div>

              {/* Action Button */}
              <div className="relative z-10 pt-4">
                <Link
                  href={b.href}
                  className="inline-flex items-center gap-1.5 bg-white text-slate-900 hover:bg-hub-blue hover:text-white text-[12px] font-extrabold px-4 py-2.5 rounded-xl transition-all shadow-sm active:scale-95"
                >
                  <span>{isRtl ? b.buttonTextAr : b.buttonText}</span>
                  <ArrowRight className="w-3.5 h-3.5 rtl:rotate-180" />
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
