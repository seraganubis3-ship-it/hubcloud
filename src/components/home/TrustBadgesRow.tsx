'use client';

import React from 'react';
import { useStore } from '@/context/StoreContext';
import { ShieldCheck, Award, Truck, Headphones } from 'lucide-react';

export const TrustBadgesRow: React.FC = () => {
  const { isRtl } = useStore();

  const badges = [
    {
      id: 1,
      icon: ShieldCheck,
      iconColor: 'text-blue-600',
      title: '100% Genuine Products',
      titleAr: 'منتجات أصلية 100%'
    },
    {
      id: 2,
      icon: Award,
      iconColor: 'text-blue-600',
      title: 'Official Warranty',
      titleAr: 'ضمان رسمي معتمد'
    },
    {
      id: 3,
      icon: Truck,
      iconColor: 'text-blue-600',
      title: 'Fast Delivery Across Egypt',
      titleAr: 'شحن سريع لجميع المحافظات'
    },
    {
      id: 4,
      icon: Headphones,
      iconColor: 'text-blue-600',
      title: '24/7 Expert Support',
      titleAr: 'دعم فني متخصص 24/7'
    }
  ];

  return (
    <div className="max-w-[1536px] mx-auto px-4 sm:px-6 my-3">
      <div className="bg-white rounded-2xl border border-gray-200/90 shadow-2xs p-3.5 sm:p-4 grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 divide-y sm:divide-y-0 sm:divide-x sm:rtl:divide-x-reverse divide-gray-100">
        {badges.map((b) => {
          const Icon = b.icon;
          return (
            <div key={b.id} className="flex items-center gap-2.5 pt-2 sm:pt-0 first:pt-0 sm:px-3 justify-start">
              <div className="w-8 h-8 rounded-xl bg-blue-50/80 flex items-center justify-center flex-shrink-0">
                <Icon className={`w-4 h-4 ${b.iconColor}`} />
              </div>
              <span className="text-[11px] sm:text-[12px] font-bold text-gray-800 leading-tight">
                {isRtl ? b.titleAr : b.title}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
};
