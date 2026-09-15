'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useStore } from '@/context/StoreContext';
import { SiteContent, DEFAULT_SITE_CONTENT } from '@/lib/content';
import { Truck, CheckCircle2, ChevronRight, Clock, MapPin, ShieldCheck, Box } from 'lucide-react';

export default function ShippingPage() {
  const { isRtl, formatPrice } = useStore();
  const [content, setContent] = useState<SiteContent>(DEFAULT_SITE_CONTENT);

  useEffect(() => {
    fetch('/api/content')
      .then(res => res.json())
      .then(data => {
        if (data.success && data.content) setContent(data.content);
      })
      .catch(() => {});
  }, []);

  const { shipping } = content;

  return (
    <div className="py-10 bg-slate-50 min-h-screen">
      <div className="max-w-4xl mx-auto px-4 space-y-8">
        {/* Breadcrumbs */}
        <div className="flex items-center gap-2 text-[12px] text-gray-500">
          <Link href="/" className="hover:text-blue-600 transition-colors">{isRtl ? 'الرئيسية' : 'Home'}</Link>
          <ChevronRight className="w-3 h-3 rtl:rotate-180 text-gray-400" />
          <span className="font-semibold text-gray-900">{isRtl ? 'الشحن والتوصيل' : 'Shipping & Delivery'}</span>
        </div>

        {/* Hero Card */}
        <div className="bg-white rounded-3xl border border-gray-200 p-8 sm:p-10 shadow-xs space-y-4">
          <div className="w-14 h-14 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold shadow-xs">
            <Truck className="w-8 h-8" />
          </div>

          <div className="space-y-2">
            <h1 className="text-2xl sm:text-3xl font-black text-gray-900">
              {isRtl ? shipping.titleAr : shipping.title}
            </h1>
            <p className="text-xs sm:text-sm text-gray-600 leading-relaxed max-w-2xl">
              {isRtl ? shipping.subtitleAr : shipping.subtitle}
            </p>
          </div>
        </div>

        {/* Timeline cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-xs space-y-3">
            <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
              <Clock className="w-5 h-5" />
            </div>
            <h3 className="font-extrabold text-gray-900 text-base">
              {isRtl ? 'القاهرة الكبرى والجيزة' : 'Greater Cairo & Giza'}
            </h3>
            <p className="text-xs sm:text-sm text-gray-600 leading-relaxed">
              {isRtl ? shipping.cairoDeliveryAr : shipping.cairoDelivery}
            </p>
            <span className="inline-block text-[11px] font-bold text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-full">
              {isRtl ? 'تسليم سريع وفحص قبل الاستلام' : 'Fast Express Delivery'}
            </span>
          </div>

          <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-xs space-y-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <MapPin className="w-5 h-5" />
            </div>
            <h3 className="font-extrabold text-gray-900 text-base">
              {isRtl ? 'باقي محافظات الجمهورية' : 'All Egyptian Governorates'}
            </h3>
            <p className="text-xs sm:text-sm text-gray-600 leading-relaxed">
              {isRtl ? shipping.governoratesDeliveryAr : shipping.governoratesDelivery}
            </p>
            <span className="inline-block text-[11px] font-bold text-blue-600 bg-blue-50 px-2.5 py-1 rounded-full">
              {isRtl ? 'شحن مؤمن لجميع المدن' : 'Insured Courier Transit'}
            </span>
          </div>
        </div>

        {/* Rates & Free Shipping */}
        <div className="bg-white rounded-3xl border border-gray-200 p-8 shadow-xs space-y-4">
          <h3 className="font-black text-gray-900 text-base">
            {isRtl ? 'رسوم التوصيل والشحن المجاني' : 'Shipping Rates & Free Delivery'}
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
              <span className="text-gray-500 block mb-1">{isRtl ? 'تكلفة الشحن القياسية:' : 'Standard Shipping Fee:'}</span>
              <span className="text-xl font-black text-gray-900 font-mono">{formatPrice(shipping.standardFee)}</span>
            </div>

            <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200">
              <span className="text-emerald-700 block mb-1">{isRtl ? 'شحن مجاني لكافة الطلبات فوق:' : 'Free Shipping on orders over:'}</span>
              <span className="text-xl font-black text-emerald-800 font-mono">{formatPrice(shipping.freeShippingMin)}</span>
            </div>
          </div>

          <div className="pt-2 text-xs text-gray-600 leading-relaxed flex items-start gap-2">
            <Box className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
            <span>{isRtl ? shipping.notesAr : shipping.notes}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
