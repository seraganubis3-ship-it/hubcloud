'use client';

import React from 'react';
import { useStore } from '@/context/StoreContext';
import { Truck, Award, Headphones, FileText } from 'lucide-react';

export const TopUtilityBar: React.FC = () => {
  const { isRtl } = useStore();

  return (
    <div className="bg-[#F8FAFC] border-b border-gray-200 text-[12px] text-gray-600 py-1.5 px-4 hidden md:block">
      <div className="max-w-[1536px] mx-auto flex items-center justify-between">
        {/* Left Benefits List */}
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-1.5 hover:text-hub-blue transition-colors">
            <Truck className="w-3.5 h-3.5 text-hub-blue" />
            <span>{isRtl ? 'توصيل سريع لجميع محافظات مصر' : 'Fast Delivery Across Egypt'}</span>
          </div>

          <div className="flex items-center gap-1.5 hover:text-hub-blue transition-colors">
            <Award className="w-3.5 h-3.5 text-amber-500" />
            <span>{isRtl ? 'ضمان محلي معتمد' : 'Official Local Warranty'}</span>
          </div>

          <div className="flex items-center gap-1.5 hover:text-hub-blue transition-colors">
            <FileText className="w-3.5 h-3.5 text-blue-600" />
            <span>{isRtl ? 'منتجات أصلية 100% مع فاتورة رسمية' : '100% Genuine Hardware & Official Receipt'}</span>
          </div>
        </div>

        {/* Right: 24/7 Expert Support */}
        <div className="flex items-center gap-1.5 hover:text-hub-blue transition-colors font-medium">
          <Headphones className="w-3.5 h-3.5 text-purple-600" />
          <span>{isRtl ? 'خدمة عملاء ودعم فني 24/7' : '24/7 Expert Technical Support'}</span>
        </div>
      </div>
    </div>
  );
};
