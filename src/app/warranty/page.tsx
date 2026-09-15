'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useStore } from '@/context/StoreContext';
import { SiteContent, DEFAULT_SITE_CONTENT } from '@/lib/content';
import { ShieldCheck, CheckCircle2, ChevronRight, Phone, MessageCircle, AlertTriangle, FileText } from 'lucide-react';

export default function WarrantyPage() {
  const { isRtl } = useStore();
  const [content, setContent] = useState<SiteContent>(DEFAULT_SITE_CONTENT);

  useEffect(() => {
    fetch('/api/content')
      .then(res => res.json())
      .then(data => {
        if (data.success && data.content) setContent(data.content);
      })
      .catch(() => {});
  }, []);

  const { warranty, contact } = content;

  return (
    <div className="py-10 bg-slate-50 min-h-screen">
      <div className="max-w-4xl mx-auto px-4 space-y-8">
        {/* Breadcrumbs */}
        <div className="flex items-center gap-2 text-[12px] text-gray-500">
          <Link href="/" className="hover:text-blue-600 transition-colors">{isRtl ? 'الرئيسية' : 'Home'}</Link>
          <ChevronRight className="w-3 h-3 rtl:rotate-180 text-gray-400" />
          <span className="font-semibold text-gray-900">{isRtl ? 'سياسة الضمان المعتمد' : 'Warranty Policy'}</span>
        </div>

        {/* Hero Card */}
        <div className="bg-white rounded-3xl border border-gray-200 p-8 sm:p-10 shadow-xs space-y-4">
          <div className="w-14 h-14 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold shadow-xs">
            <ShieldCheck className="w-8 h-8" />
          </div>

          <div className="space-y-2">
            <h1 className="text-2xl sm:text-3xl font-black text-gray-900">
              {isRtl ? warranty.titleAr : warranty.title}
            </h1>
            <p className="text-xs sm:text-sm text-gray-600 leading-relaxed max-w-2xl">
              {isRtl ? warranty.subtitleAr : warranty.subtitle}
            </p>
          </div>
        </div>

        {/* Policy Sections */}
        <div className="space-y-4">
          {warranty.sections.map((sec, idx) => (
            <div key={idx} className="bg-white rounded-2xl border border-gray-200 p-6 sm:p-7 shadow-xs space-y-2.5">
              <div className="flex items-center gap-2.5">
                <span className="w-7 h-7 rounded-xl bg-blue-100 text-blue-700 font-black text-xs flex items-center justify-center">
                  {idx + 1}
                </span>
                <h2 className="text-base sm:text-lg font-black text-gray-900">
                  {isRtl ? sec.headingAr : sec.heading}
                </h2>
              </div>
              <p className="text-xs sm:text-sm text-gray-600 leading-relaxed pr-9 rtl:pr-0 rtl:pl-9">
                {isRtl ? sec.contentAr : sec.content}
              </p>
            </div>
          ))}
        </div>

        {/* Direct Warranty Support CTA */}
        <div className="bg-gradient-to-br from-[#0B1E38] to-[#12325E] text-white rounded-3xl p-6 sm:p-8 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-md">
          <div className="space-y-1 text-center sm:text-start">
            <h3 className="text-base font-black">{isRtl ? 'هل تحتاج لمطالبة بالضمان أو استفسار فني؟' : 'Need Warranty Support?'}</h3>
            <p className="text-xs text-slate-300">{isRtl ? 'فريق الصيانة والدعم الفني المعتمد متاح لمساعدتك فوراً.' : 'Our certified technical team is ready to assist you.'}</p>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <a
              href={`https://wa.me/201060777895`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs px-4 py-2.5 rounded-xl transition-colors shadow-sm"
            >
              <MessageCircle className="w-4 h-4" />
              <span>{isRtl ? 'واتساب الدعم الفني' : 'WhatsApp Support'}</span>
            </a>
            <a
              href={`tel:+2001060777895`}
              className="inline-flex items-center gap-1.5 bg-white/10 hover:bg-white/20 text-white font-bold text-xs px-4 py-2.5 rounded-xl transition-colors border border-white/20"
            >
              <Phone className="w-4 h-4" />
              <span>{contact.phone}</span>
            </a>
          </div>
        </div>

      </div>
    </div>
  );
}
