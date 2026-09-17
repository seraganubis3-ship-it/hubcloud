'use client';

import React from 'react';
import { useStore } from '@/context/StoreContext';
import { ValuBadge, AmanBadge, MeezaBadge, FawryBadge } from '@/components/ui/PaymentBadges';

export const InstallmentStrip: React.FC = React.memo(function InstallmentStrip() {
  const { isRtl } = useStore();

  return (
    <div className="max-w-[1536px] mx-auto px-4 sm:px-6 my-4">
      <div className="bg-white rounded-2xl border border-gray-200 shadow-2xs p-3.5 sm:p-4 flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <span className="text-[12px] sm:text-[13px] font-extrabold text-blue-900 tracking-tight">
            {isRtl ? 'اشتري الآن، وادفع لاحقاً / تقسيط ميسر' : 'Buy Now, Pay Later / Easy Installments'}
          </span>
        </div>

        <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-3">
          <ValuBadge size="sm" />
          <AmanBadge size="sm" />
          <MeezaBadge size="sm" variant="white" />
          <FawryBadge size="sm" />
        </div>
      </div>
    </div>
  );
});
