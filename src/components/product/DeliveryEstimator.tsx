'use client';

import React, { useState } from 'react';
import { useStore } from '@/context/StoreContext';
import { Truck, MapPin, CheckCircle2 } from 'lucide-react';

export const DeliveryEstimator: React.FC = () => {
  const { language, isRtl } = useStore();
  const [city, setCity] = useState('cairo');

  const deliveryData: Record<string, { days: string; daysAr: string; cost: number }> = {
    cairo: { days: 'Within 24 Hours (Next Day)', daysAr: 'خلال 24 ساعة (اليوم التالي)', cost: 75 },
    giza: { days: 'Within 24 Hours (Next Day)', daysAr: 'خلال 24 ساعة (اليوم التالي)', cost: 75 },
    alex: { days: '1 - 2 Business Days', daysAr: '1 إلى 2 يوم عمل', cost: 95 },
    delta: { days: '2 - 3 Business Days', daysAr: '2 إلى 3 أيام عمل', cost: 110 },
    upper: { days: '2 - 4 Business Days', daysAr: '2 إلى 4 أيام عمل', cost: 130 },
  };

  const selected = deliveryData[city] || deliveryData.cairo;

  return (
    <div className="bg-slate-50 rounded-xl p-4 border border-gray-200 space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Truck className="w-4 h-4 text-hub-blue" />
          <h4 className="font-bold text-gray-900 text-[13px]">
            {isRtl ? 'حاسبة موعد التوصيل التقديري' : 'Estimated Delivery Calculator'}
          </h4>
        </div>

        <select
          value={city}
          onChange={(e) => setCity(e.target.value)}
          className="bg-white border border-gray-300 rounded-lg px-2.5 py-1 text-[12px] font-bold text-gray-700 focus:outline-none focus:border-hub-blue"
        >
          <option value="cairo">Cairo (القاهرة)</option>
          <option value="giza">Giza (الجيزة)</option>
          <option value="alex">Alexandria (الإسكندرية)</option>
          <option value="delta">Delta Governorates (الدلتا)</option>
          <option value="upper">Upper Egypt (الصعيد)</option>
        </select>
      </div>

      <div className="flex items-center justify-between bg-white p-2.5 rounded-lg border border-gray-200 text-[12px]">
        <div className="flex items-center gap-1.5 text-emerald-700 font-bold">
          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
          <span>{isRtl ? selected.daysAr : selected.days}</span>
        </div>
        <span className="font-bold text-gray-900">
          {isRtl ? `شحن: ${selected.cost} ج.م` : `Shipping: EGP ${selected.cost}`}
        </span>
      </div>
    </div>
  );
};
