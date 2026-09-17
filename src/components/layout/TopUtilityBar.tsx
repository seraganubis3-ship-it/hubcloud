'use client';

import React from 'react';
import { useStore } from '@/context/StoreContext';
import { Truck, ShieldCheck, Award, CreditCard, Headphones, Phone } from 'lucide-react';

export const TopUtilityBar: React.FC = () => {
  const { isRtl } = useStore();

  const trustItems = [
    {
      id: 1,
      icon: Truck,
      textEn: 'Fast Delivery Across Egypt',
      textAr: 'شحن سريع لجميع المحافظات'
    },
    {
      id: 2,
      icon: ShieldCheck,
      textEn: '100% Genuine Products',
      textAr: 'منتجات أصلية 100%'
    },
    {
      id: 3,
      icon: Award,
      textEn: 'Official Warranty',
      textAr: 'ضمان محلي معتمد'
    },
    {
      id: 4,
      icon: CreditCard,
      textEn: 'Installments up to 24 Months',
      textAr: 'تقسيط حتى 24 شهر'
    },
    {
      id: 5,
      icon: Headphones,
      textEn: '24/7 Support',
      textAr: 'دعم فني 24/7'
    }
  ];

  return (
    <div className="bg-[#F8FAFC] border-b border-gray-200/90 text-[11.5px] text-gray-600 py-1.5 px-4 hidden md:block">
      <div className="max-w-[1536px] mx-auto flex items-center justify-between gap-4">
        {/* 5 Trust Items from Image */}
        <div className="flex items-center gap-3.5 lg:gap-6 text-slate-700 overflow-x-auto">
          {trustItems.map((item) => {
            const Icon = item.icon;
            return (
              <div
                key={item.id}
                className="flex items-center gap-1.5 shrink-0 hover:text-blue-600 transition-colors"
              >
                <Icon className="w-3.5 h-3.5 text-slate-500 stroke-[1.8] shrink-0" />
                <span className="font-medium text-[11.5px]">{isRtl ? item.textAr : item.textEn}</span>
              </div>
            );
          })}
        </div>

        {/* Right: Sales Hotline & WhatsApp */}
        <div className="flex items-center gap-3.5 text-[11.5px] shrink-0">
          <a
            href="tel:+2001060777895"
            className="flex items-center gap-1.5 text-slate-700 hover:text-blue-600 font-semibold transition-colors"
            dir="ltr"
          >
            <Phone className="w-3 h-3 text-blue-600" />
            <span>+20 010 60 777 895</span>
          </a>

          <span className="text-gray-300">|</span>

          <a
            href="https://wa.me/2001060777895"
            target="_blank"
            rel="noopener noreferrer"
            className="text-slate-600 hover:text-emerald-600 font-medium transition-colors"
          >
            {isRtl ? 'خدمة العملاء' : 'Customer Care'}
          </a>
        </div>
      </div>
    </div>
  );
};
