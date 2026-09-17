'use client';

import React from 'react';
import Link from 'next/link';
import { useStore } from '@/context/StoreContext';
import { ShieldCheck } from 'lucide-react';
import {
  AppleLogo,
  DellLogo,
  HPLogo,
  IntelLogo,
  LenovoLogo,
  SamsungLogo,
  MicrosoftLogo,
  CiscoLogo,
  FortinetLogo,
  HikvisionLogo,
  KasperskyLogo,
  QNAPLogo,
  APCLogo,
} from '@/components/ui/BrandLogos';

export const BrandRow: React.FC = React.memo(function BrandRow() {
  const { isRtl } = useStore();

  const partners = [
    { id: 'dell', name: 'Dell Technologies', component: DellLogo, height: 'h-7 sm:h-8' },
    { id: 'hp', name: 'HP Enterprise', component: HPLogo, height: 'h-7 sm:h-8' },
    { id: 'lenovo', name: 'Lenovo', component: LenovoLogo, height: 'h-5 sm:h-6' },
    { id: 'apple', name: 'Apple', component: AppleLogo, height: 'h-7 sm:h-8' },
    { id: 'intel', name: 'Intel', component: IntelLogo, height: 'h-5 sm:h-6' },
    { id: 'samsung', name: 'Samsung', component: SamsungLogo, height: 'h-4 sm:h-5' },
    { id: 'microsoft', name: 'Microsoft', component: MicrosoftLogo, height: 'h-5 sm:h-6' },
    { id: 'cisco', name: 'Cisco', component: CiscoLogo, height: 'h-6 sm:h-7' },
    { id: 'hikvision', name: 'Hikvision', component: HikvisionLogo, height: 'h-4 sm:h-5' },
    { id: 'fortinet', name: 'Fortinet', component: FortinetLogo, height: 'h-5 sm:h-6' },
    { id: 'apc', name: 'APC Schneider', component: APCLogo, height: 'h-7 sm:h-8' },
    { id: 'qnap', name: 'QNAP', component: QNAPLogo, height: 'h-4 sm:h-5' },
    { id: 'kaspersky', name: 'Kaspersky', component: KasperskyLogo, height: 'h-4 sm:h-5' },
  ];

  // Double list for infinite seamless loop
  const marqueePartners = [...partners, ...partners];

  return (
    <section className="py-4 sm:py-6 overflow-hidden">
      <div className="max-w-[1536px] mx-auto px-4 sm:px-6">
        <div className="bg-white rounded-2xl sm:rounded-3xl border border-gray-200/80 p-4 sm:p-5 shadow-xs overflow-hidden">
          
          {/* Section Header */}
          <div className="flex items-center justify-center gap-2 mb-3 sm:mb-4 text-center">
            <ShieldCheck className="w-4 h-4 text-blue-600" />
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
              {isRtl ? 'شركاء العتاد والتكنولوجيا المعتمدون' : 'Authorized Technology Partners'}
            </span>
          </div>

          {/* Continuous Sliding Marquee Container */}
          <div
            dir="ltr"
            style={{ direction: 'ltr' }}
            className="relative w-full overflow-hidden [mask-image:_linear-gradient(to_right,transparent_0,_black_40px,_black_calc(100%-40px),transparent_100%)]"
          >
            <div className="flex items-center gap-8 sm:gap-12 w-max animate-brand-marquee hover:[animation-play-state:paused] py-1">
              {marqueePartners.map((brand, idx) => {
                const LogoComp = brand.component;
                return (
                  <Link
                    key={`${brand.id}-${idx}`}
                    href={`/products?brand=${brand.id}`}
                    aria-label={brand.name}
                    title={brand.name}
                    className="flex-shrink-0 flex items-center justify-center px-2 hover:scale-110 transition-transform duration-200"
                  >
                    <LogoComp className={`${brand.height} opacity-80 hover:opacity-100 transition-opacity`} />
                  </Link>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes brandMarquee {
          0% {
            transform: translateX(0);
          }
          100% {
            transform: translateX(-50%);
          }
        }
        .animate-brand-marquee {
          animation: brandMarquee 35s linear infinite;
        }
      `}</style>
    </section>
  );
});
