'use client';

import React from 'react';
import Link from 'next/link';
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

export const BrandRow: React.FC = () => {
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

  return (
    <section className="py-2.5">
      <div className="max-w-[1536px] mx-auto px-4 sm:px-6">
        <div className="bg-white rounded-2xl sm:rounded-3xl border border-gray-200/80 px-4 py-4 sm:py-5 shadow-xs">
          {/* 13 Official Partners Logos Strip - Protected with dir="ltr" to ensure flawless alignment in Arabic (RTL) */}
          <div
            dir="ltr"
            style={{ direction: 'ltr' }}
            className="flex items-center gap-6 sm:gap-8 md:gap-9 overflow-x-auto scroll-smooth touch-pan-x [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden py-1 px-2 justify-start xl:justify-between"
          >
            {partners.map((brand) => {
              const LogoComp = brand.component;
              return (
                <Link
                  key={brand.id}
                  href={`/products?brand=${brand.id}`}
                  aria-label={brand.name}
                  title={brand.name}
                  className="flex-shrink-0 flex items-center justify-center py-2 px-3 sm:px-4 rounded-xl hover:bg-slate-50 transition-all duration-200 group"
                >
                  <LogoComp className={`${brand.height} transition-transform duration-200 group-hover:scale-110`} />
                </Link>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
};
