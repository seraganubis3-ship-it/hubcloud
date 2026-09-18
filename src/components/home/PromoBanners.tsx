'use client';

import React from 'react';
import Image from 'next/image';
import { useStore } from '@/context/StoreContext';
import { PhoneCall, MessageCircle, MapPin, Mail } from 'lucide-react';

export const PromoBanners: React.FC = () => {
  const { isRtl } = useStore();

  const whatsappMessage = encodeURIComponent(
    isRtl
      ? 'مرحباً Hubcloud، أرغب في الاستفسار عن الأنظمة والحلول الأمنية والسحابية'
      : 'Hello Hubcloud, I would like to inquire about Security Systems & Cloud Solutions'
  );

  return (
    <section className="py-4 sm:py-6" aria-label={isRtl ? 'حلول هاب كلاود المتكاملة' : 'Hubcloud Integrated Solutions'}>
      <div className="max-w-[1536px] mx-auto px-4 sm:px-6">
        <div className="group relative overflow-hidden rounded-2xl sm:rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-md hover:shadow-xl transition-all duration-300">
          {/* Main Clickable Banner */}
          <a
            href={`https://wa.me/201019569891?text=${whatsappMessage}`}
            target="_blank"
            rel="noopener noreferrer"
            className="block relative w-full aspect-[960/365] overflow-hidden cursor-pointer bg-slate-100 dark:bg-slate-950"
            title={isRtl ? 'تواصل معنا لحلول الأنظمة الأمنية والبنية التحتية' : 'Contact us for security systems & cloud infrastructure'}
          >
            <Image
              src="/images/banners/hubcloud-solutions-banner.png"
              alt="Hubcloud IT Solutions - Security Systems & Cloud Infrastructure"
              fill
              priority
              sizes="(max-width: 768px) 100vw, (max-width: 1536px) 95vw, 1536px"
              className="object-contain object-center group-hover:scale-[1.015] transition-transform duration-500 ease-out"
            />
          </a>

          {/* Quick Contact & Verification Strip */}
          <div className="bg-slate-50/90 dark:bg-slate-800/80 border-t border-slate-200/80 dark:border-slate-800/80 px-3.5 sm:px-6 py-2.5 sm:py-3 flex flex-wrap items-center justify-between gap-3 text-xs">
            <div className="flex flex-wrap items-center gap-3 sm:gap-6 text-slate-600 dark:text-slate-300">
              <span className="flex items-center gap-1.5 font-medium text-[11px] sm:text-xs">
                <MapPin className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-blue-600 shrink-0" />
                <span>{isRtl ? '181 ش السودان - المهندسين - الدور الـ 9' : '181 Sudan St., Mohandessin, 9th Floor'}</span>
              </span>
              <a
                href="mailto:s@hubcloud.info"
                className="hidden md:flex items-center gap-1.5 hover:text-blue-600 transition-colors text-xs"
              >
                <Mail className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-blue-600 shrink-0" />
                <span>s@hubcloud.info</span>
              </a>
            </div>

            <div className="flex items-center gap-2 sm:gap-3 ms-auto">
              <a
                href="tel:01019569891"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 hover:bg-blue-100 dark:hover:bg-blue-900/50 font-bold transition-all text-xs shadow-sm"
              >
                <PhoneCall className="w-3.5 h-3.5" />
                <span dir="ltr">01019569891</span>
              </a>
              <a
                href={`https://wa.me/201019569891?text=${whatsappMessage}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold transition-all shadow-sm active:scale-95 text-xs"
              >
                <MessageCircle className="w-3.5 h-3.5" />
                <span>{isRtl ? 'محادثة واتساب' : 'WhatsApp'}</span>
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

