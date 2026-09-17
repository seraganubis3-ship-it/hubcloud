'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useStore } from '@/context/StoreContext';
import { SiteContent, DEFAULT_SITE_CONTENT } from '@/lib/content';
import { HelpCircle, ChevronDown, ChevronRight, Search, Phone, MessageCircle } from 'lucide-react';

export default function FaqPage() {
  const { isRtl } = useStore();
  const [content, setContent] = useState<SiteContent>(DEFAULT_SITE_CONTENT);
  const [searchQuery, setSearchQuery] = useState('');
  const [openItems, setOpenItems] = useState<Record<string, boolean>>({ 'faq-1': true, 'faq-2': true });

  useEffect(() => {
    fetch('/api/content')
      .then(res => res.json())
      .then(data => {
        if (data.success && data.content) setContent(data.content);
      })
      .catch(() => {});
  }, []);

  const { faq, contact } = content;

  const toggleItem = (id: string) => {
    setOpenItems(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const filteredFaqs = faq.items.filter(item => {
    const q = searchQuery.toLowerCase();
    return (
      item.question.toLowerCase().includes(q) ||
      item.questionAr.toLowerCase().includes(q) ||
      item.answer.toLowerCase().includes(q) ||
      item.answerAr.toLowerCase().includes(q)
    );
  });

  return (
    <div className="py-10 bg-slate-50 min-h-screen">
      <div className="max-w-4xl mx-auto px-4 space-y-8">
        {/* Breadcrumbs */}
        <div className="flex items-center gap-2 text-[12px] text-gray-500">
          <Link href="/" className="hover:text-blue-600 transition-colors">{isRtl ? 'الرئيسية' : 'Home'}</Link>
          <ChevronRight className="w-3 h-3 rtl:rotate-180 text-gray-400" />
          <span className="font-semibold text-gray-900">{isRtl ? 'الأسئلة الشائعة' : 'FAQs'}</span>
        </div>

        {/* Hero Card */}
        <div className="bg-white rounded-3xl border border-gray-200 p-8 sm:p-10 shadow-xs space-y-4">
          <div className="w-14 h-14 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold shadow-xs">
            <HelpCircle className="w-8 h-8" />
          </div>

          <div className="space-y-2">
            <h1 className="text-2xl sm:text-3xl font-black text-gray-900">
              {isRtl ? faq.titleAr : faq.title}
            </h1>
            <p className="text-xs sm:text-sm text-gray-600 leading-relaxed max-w-2xl">
              {isRtl ? faq.subtitleAr : faq.subtitle}
            </p>
          </div>

          {/* Quick Search inside FAQs */}
          <div className="pt-2">
            <div className="relative max-w-md">
              <Search className="w-4 h-4 text-gray-400 absolute left-3.5 rtl:left-auto rtl:right-3.5 top-3.5 pointer-events-none" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={isRtl ? 'ابحث في الأسئلة (مثال: الضمان، التوصيل، طرق الدفع)...' : 'Search questions (e.g. warranty, delivery, payment)...'}
                className="w-full pl-10 pr-3.5 rtl:pl-3.5 rtl:pr-10 py-2.5 text-xs bg-slate-50 border border-gray-200 rounded-xl focus:outline-none focus:border-blue-600 focus:bg-white transition-all"
              />
            </div>
          </div>
        </div>

        {/* FAQ Accordion List */}
        <div className="space-y-3">
          {filteredFaqs.length === 0 ? (
            <div className="bg-white rounded-2xl border border-gray-200 p-12 text-center text-gray-500 text-xs">
              {isRtl ? 'لم يتم العثور على إجابات مطابقة لبحثك' : 'No matching questions found'}
            </div>
          ) : (
            filteredFaqs.map((item) => {
              const isOpen = !!openItems[item.id];
              return (
                <div
                  key={item.id}
                  className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-2xs transition-all"
                >
                  <button
                    type="button"
                    onClick={() => toggleItem(item.id)}
                    className="w-full p-5 text-start flex items-center justify-between gap-3 hover:bg-slate-50 transition-colors"
                  >
                    <span className="font-extrabold text-sm text-gray-900 leading-snug">
                      {isRtl ? item.questionAr : item.question}
                    </span>
                    <ChevronDown className={`w-4 h-4 text-gray-400 shrink-0 transition-transform duration-200 ${isOpen ? 'rotate-180 text-blue-600' : ''}`} />
                  </button>

                  {isOpen && (
                    <div className="px-5 pb-5 pt-1 border-t border-gray-100 text-xs sm:text-sm text-gray-600 leading-relaxed animate-fadeIn">
                      {isRtl ? item.answerAr : item.answer}
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>

        {/* Bottom CTA */}
        <div className="bg-white rounded-3xl border border-gray-200 p-6 sm:p-8 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-xs">
          <div className="space-y-1 text-center sm:text-start">
            <h3 className="text-base font-black text-gray-900">{isRtl ? 'لديك استفسار آخر لم تجد إجابته؟' : 'Still have questions?'}</h3>
            <p className="text-xs text-gray-500">{isRtl ? 'فريق خدمة العملاء متواجد للمساعدة والرد على كافة الأسئلة.' : 'Our customer support team is happy to help you.'}</p>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <a
              href={`https://wa.me/201060777895`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs px-4 py-2.5 rounded-xl transition-colors shadow-sm"
            >
              <MessageCircle className="w-4 h-4" />
              <span>{isRtl ? 'تواصل عبر واتساب' : 'WhatsApp Support'}</span>
            </a>
            <a
              href="tel:+2001060777895"
              className="inline-flex items-center gap-1.5 bg-gray-100 hover:bg-gray-200 text-gray-800 font-bold text-xs px-4 py-2.5 rounded-xl transition-colors"
            >
              <Phone className="w-4 h-4 text-blue-600" />
              <span>{isRtl ? 'اتصال هاتفياً' : 'Call Support'}</span>
            </a>
          </div>
        </div>

      </div>
    </div>
  );
}
