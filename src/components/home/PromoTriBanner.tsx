'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useStore } from '@/context/StoreContext';
import { ArrowRight, Cpu, Scan, Server } from 'lucide-react';

export const PromoTriBanner: React.FC = () => {
  const { isRtl } = useStore();

  const banners = [
    {
      id: 1,
      badge: 'High Compute',
      badgeAr: 'أداء فائق',
      icon: Cpu,
      title: 'Enterprise Desktops & Workstations',
      titleAr: 'أجهزة ديسكتوب ووركستيشن احترافية',
      subtitle: 'Engineered for high-compute workloads and daily corporate reliability.',
      subtitleAr: 'مصممة للإنتاجية العالية والأعمال الهندسية والمكتبية المتواصلة.',
      bgGradient: 'bg-gradient-to-br from-blue-50/70 via-white to-slate-50',
      badgeColor: 'bg-blue-100 text-blue-700 border-blue-200/60',
      borderColor: 'border-blue-200/70 hover:border-blue-500',
      btnColor: 'bg-blue-600 hover:bg-blue-700 text-white',
      buttonText: 'Shop Desktops',
      buttonTextAr: 'تصفح الأجهزة',
      href: '/category/desktops',
      image: '/images/category_desktops.jpg'
    },
    {
      id: 2,
      badge: 'Fast Archiving',
      badgeAr: 'أرشفة إلكترونية',
      icon: Scan,
      title: 'Document Scanners & Archiving',
      titleAr: 'الماسحات الضوئية والأرشفة الإلكترونية',
      subtitle: 'High speed duplex scanning with auto document feeders for enterprises.',
      subtitleAr: 'سحب مستندات فائق السرعة على الوجهين للبنوك والشركات.',
      bgGradient: 'bg-gradient-to-br from-teal-50/70 via-white to-slate-50',
      badgeColor: 'bg-teal-100 text-teal-700 border-teal-200/60',
      borderColor: 'border-teal-200/70 hover:border-teal-500',
      btnColor: 'bg-teal-700 hover:bg-teal-800 text-white',
      buttonText: 'Shop Scanners',
      buttonTextAr: 'تصفح الماسحات',
      href: '/category/scanner',
      image: '/images/category_scanner.jpg'
    },
    {
      id: 3,
      badge: 'PoE & Gigabit',
      badgeAr: 'شبكات وسويتشات',
      icon: Server,
      title: 'Enterprise Network Gear That Scales',
      titleAr: 'حلول وبنية شبكات متطورة',
      subtitle: 'Gigabit PoE switches, Cisco routers, and high-performance gateways.',
      subtitleAr: 'سويتشات مدارة وراوترات واي فاي 6 فائقة الاستقرار.',
      bgGradient: 'bg-gradient-to-br from-indigo-50/70 via-white to-slate-50',
      badgeColor: 'bg-indigo-100 text-indigo-700 border-indigo-200/60',
      borderColor: 'border-indigo-200/70 hover:border-indigo-500',
      btnColor: 'bg-indigo-600 hover:bg-indigo-700 text-white',
      buttonText: 'Shop Networking',
      buttonTextAr: 'تصفح الشبكات',
      href: '/category/network-device',
      image: '/images/category_network.jpg'
    }
  ];

  return (
    <section className="py-6 sm:py-8">
      <div className="max-w-[1536px] mx-auto px-4 sm:px-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 lg:gap-5">
          {banners.map((b) => {
            const Icon = b.icon;
            return (
              <div
                key={b.id}
                className={`rounded-2xl sm:rounded-3xl ${b.bgGradient} p-5 sm:p-6 flex flex-col justify-between min-h-[220px] relative overflow-hidden group shadow-xs border ${b.borderColor} hover:shadow-md hover:-translate-y-1 transition-all duration-300`}
              >
                {/* Product hardware image with mix-blend-multiply to completely erase white background */}
                <div className="absolute right-2 bottom-2 rtl:right-auto rtl:left-2 w-36 sm:w-40 h-32 sm:h-36 group-hover:scale-108 group-hover:-translate-y-1 transition-all duration-300 pointer-events-none flex items-center justify-center">
                  <Image
                    src={b.image}
                    alt={b.title}
                    fill
                    className="object-contain mix-blend-multiply"
                  />
                </div>

                {/* Text content */}
                <div className="relative z-10 max-w-[62%] space-y-2">
                  <div className={`inline-flex items-center gap-1 text-[10px] font-extrabold uppercase tracking-wider px-2.5 py-0.5 rounded-full border ${b.badgeColor}`}>
                    <Icon className="w-3 h-3" />
                    <span>{isRtl ? b.badgeAr : b.badge}</span>
                  </div>
                  <h3 className="text-base sm:text-lg font-black text-gray-900 leading-tight">
                    {isRtl ? b.titleAr : b.title}
                  </h3>
                  <p className="text-xs text-gray-600 leading-snug line-clamp-2">
                    {isRtl ? b.subtitleAr : b.subtitle}
                  </p>
                </div>

                {/* Action Button */}
                <div className="relative z-10 pt-4">
                  <Link
                    href={b.href}
                    className={`inline-flex items-center gap-1.5 ${b.btnColor} text-xs font-bold px-4 py-2 rounded-xl transition-all shadow-xs active:scale-95`}
                  >
                    <span>{isRtl ? b.buttonTextAr : b.buttonText}</span>
                    <ArrowRight className="w-3.5 h-3.5 rtl:rotate-180" />
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
