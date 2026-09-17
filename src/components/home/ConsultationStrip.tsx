'use client';

import React from 'react';
import { useStore } from '@/context/StoreContext';
import { Briefcase, MessageCircle, ShieldCheck, FileCheck } from 'lucide-react';

export const ConsultationStrip: React.FC = React.memo(function ConsultationStrip() {
  const { isRtl } = useStore();

  return (
    <section className="pt-8 sm:pt-12 pb-4">
      <div className="max-w-[1536px] mx-auto px-4 sm:px-6">
        <div className="relative rounded-2xl sm:rounded-3xl bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900 border border-blue-900/40 p-6 sm:p-10 text-white shadow-xl overflow-hidden">
          {/* Subtle tech background glow */}
          <div className="absolute -right-16 -top-16 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute -left-16 -bottom-16 w-64 h-64 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />

          <div className="relative z-10 flex flex-col lg:flex-row items-center justify-between gap-6 sm:gap-8">
            {/* Left Content */}
            <div className="space-y-3 max-w-2xl text-center lg:text-start">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/20 border border-blue-400/30 text-blue-300 text-xs font-bold">
                <Briefcase className="w-3.5 h-3.5" />
                <span>{isRtl ? 'حلول وتوريدات الشركات والمؤسسات (B2B)' : 'Corporate IT Solutions & Procurement'}</span>
              </div>

              <h3 className="text-xl sm:text-2xl md:text-3xl font-black tracking-tight text-white leading-snug">
                {isRtl
                  ? 'هل تبحث عن تجهيز مقرات، شبكات، أو حواسيب لشركتك؟'
                  : 'Equipping Your Office with Laptops, Workstations & Network Gear?'}
              </h3>

              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed font-normal">
                {isRtl
                  ? 'فريقنا الهندسي جاهز لتقديم استشارات البنية التحتية، فواتير ضريبية إلكترونية معتمدة، وأسعار خاصة للكميات والمشاريع.'
                  : 'Our certified IT engineers provide infrastructure consulting, official tax invoices, and volume pricing for enterprise clients.'}
              </p>

              {/* Quick Trust Pills */}
              <div className="flex flex-wrap items-center justify-center lg:justify-start gap-4 pt-1 text-[11px] sm:text-xs text-blue-200/90 font-medium">
                <div className="flex items-center gap-1.5">
                  <FileCheck className="w-4 h-4 text-emerald-400" />
                  <span>{isRtl ? 'فواتير ضريبية إلكترونية معتمدة' : 'Official VAT Invoices'}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-blue-400" />
                  <span>{isRtl ? 'ضمان رسمي واستبدال فوري' : 'Authorized Warranty & RMA'}</span>
                </div>
              </div>
            </div>

            {/* Right CTAs */}
            <div className="flex flex-col sm:flex-row items-center gap-3 w-full lg:w-auto shrink-0">
              <a
                href="https://wa.me/2001060777895"
                target="_blank"
                rel="noopener noreferrer"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-7 py-3.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs sm:text-sm transition-all shadow-lg shadow-emerald-600/25 active:scale-95"
              >
                <MessageCircle className="w-4 h-4" />
                <span>{isRtl ? 'تواصل مع مستشار تقني عبر واتساب' : 'Chat with IT Specialist on WhatsApp'}</span>
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
});
