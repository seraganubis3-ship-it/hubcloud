'use client';

import React from 'react';
import { useStore } from '@/context/StoreContext';
import { Truck, ShieldCheck, Award, CreditCard, Headphones, RotateCcw } from 'lucide-react';

export const TrustBadgesRow: React.FC = () => {
  const { isRtl } = useStore();

  const badges = [
    {
      id: 1,
      icon: Truck,
      line1En: 'Fast Delivery',
      line2En: 'Across Egypt',
      line1Ar: 'شحن سريع',
      line2Ar: 'لجميع المحافظات'
    },
    {
      id: 2,
      icon: ShieldCheck,
      line1En: '100% Genuine',
      line2En: 'Products',
      line1Ar: 'منتجات أصلية',
      line2Ar: '100% معتمدة'
    },
    {
      id: 3,
      icon: Award,
      line1En: 'Official',
      line2En: 'Warranty',
      line1Ar: 'ضمان محلي',
      line2Ar: 'رسمي معتمد'
    },
    {
      id: 4,
      icon: CreditCard,
      line1En: 'Installments up to',
      line2En: '24 Months',
      line1Ar: 'تقسيط مريح',
      line2Ar: 'حتى 24 شهر'
    },
    {
      id: 5,
      icon: Headphones,
      line1En: '24/7 Expert',
      line2En: 'Support',
      line1Ar: 'دعم فني',
      line2Ar: 'متخصص 24/7'
    },
    {
      id: 6,
      icon: RotateCcw,
      line1En: 'Easy Returns',
      line2En: 'within 14 Days',
      line1Ar: 'إرجاع سهل',
      line2Ar: 'خلال 14 يوم'
    }
  ];

  return (
    <div className="max-w-[1536px] mx-auto px-4 sm:px-6 my-2 sm:my-3">
      <div className="bg-white rounded-2xl sm:rounded-3xl border border-gray-200/90 shadow-2xs p-3.5 sm:p-5">
        <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-y-4 gap-x-2 sm:gap-x-4 xl:divide-x xl:rtl:divide-x-reverse xl:divide-gray-200">
          {badges.map((b) => {
            const Icon = b.icon;
            return (
              <div
                key={b.id}
                className="flex items-center gap-2.5 sm:gap-3 xl:px-3 first:pl-0 last:pr-0 justify-start"
              >
                {/* Pure outline blue icon directly on white */}
                <Icon className="w-6 h-6 sm:w-7 sm:h-7 text-blue-600 stroke-[1.8] flex-shrink-0" />

                {/* Two line crisp text */}
                <div className="flex flex-col text-left rtl:text-right leading-tight">
                  <span className="text-[11px] sm:text-[12px] font-bold text-gray-800">
                    {isRtl ? b.line1Ar : b.line1En}
                  </span>
                  <span className="text-[11px] sm:text-[12px] font-bold text-gray-800">
                    {isRtl ? b.line2Ar : b.line2En}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
