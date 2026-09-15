'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useStore } from '@/context/StoreContext';
import { MapPin, Phone, Mail, Clock, Send, CheckCircle2, ChevronRight, Building } from 'lucide-react';
import { DEFAULT_SITE_CONTENT, SiteContent } from '@/lib/content';

export default function ContactPage() {
  const { language, isRtl, showToast } = useStore();
  const [submitted, setSubmitted] = useState(false);
  const [content, setContent] = useState<SiteContent>(DEFAULT_SITE_CONTENT);

  React.useEffect(() => {
    fetch('/api/content')
      .then(res => res.json())
      .then(data => {
        if (data.success && data.content) {
          setContent(data.content);
        }
      })
      .catch(() => {});
  }, []);

  const contact = content.contact;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
    showToast(isRtl ? 'تم استلام رسالتك! سيتواصل معك أحد مهندسينا خلال ساعات.' : 'Message received! Our team will contact you shortly.', 'success');
  };

  return (
    <div className="py-6">
      <div className="max-w-7xl mx-auto px-4 space-y-6">
        {/* Breadcrumbs */}
        <div className="flex items-center gap-2 text-[12px] text-gray-500">
          <Link href="/" className="hover:text-hub-blue">{isRtl ? 'الرئيسية' : 'Home'}</Link>
          <ChevronRight className="w-3 h-3 rtl:rotate-180 text-gray-400" />
          <span className="font-semibold text-gray-900">{isRtl ? 'تواصل معنا' : 'Contact Us'}</span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left Info (5 Cols) */}
          <div className="lg:col-span-5 bg-gradient-to-br from-[#0C1F38] to-[#1E3A8A] text-white rounded-2xl p-6 sm:p-8 shadow-md space-y-6">
            <div>
              <span className="text-blue-400 font-bold uppercase tracking-wider text-[11px] block mb-1">
                {isRtl ? 'شريكك التكنولوجي في مصر' : 'Enterprise Support'}
              </span>
              <h1 className="text-2xl sm:text-3xl font-extrabold">{isRtl ? 'تواصل مع HUB CLOUD' : 'Get in Touch with HUB CLOUD'}</h1>
              <p className="text-[13px] text-gray-300 mt-2">
                {isRtl
                  ? 'فريق المهندسين واستشاريي المبيعات جاهزون للرد على استفساراتكم وتقديم عروض أسعار متكاملة لمشروعك.'
                  : 'Our certified engineers and enterprise sales consultants are ready to assist you with technical inquiries and custom quotes.'}
              </p>
            </div>

            <div className="space-y-4 text-[13px] text-gray-200">
              <div className="flex items-start gap-3">
                <MapPin className="w-5 h-5 text-hub-cyan flex-shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold block text-white">{isRtl ? 'المقر الرئيسي (المهندسين):' : 'Headquarters (Mohandseen):'}</span>
                  <span>{isRtl ? contact.addressAr : contact.address}</span>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <Phone className="w-5 h-5 text-hub-cyan flex-shrink-0" />
                <div>
                  <span className="font-bold block text-white">{isRtl ? 'الهاتف والمبيعات المباشرة:' : 'Direct Sales & Hotline:'}</span>
                  <a href={`tel:${contact.phone.replace(/\s+/g, '')}`} dir="ltr" className="font-mono hover:text-hub-cyan transition-colors">
                    {contact.phone}
                  </a>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <Mail className="w-5 h-5 text-hub-cyan flex-shrink-0" />
                <div>
                  <span className="font-bold block text-white">{isRtl ? 'البريد الإلكتروني للشركات:' : 'Corporate Email:'}</span>
                  <a href={`mailto:${contact.email}`} className="hover:text-hub-cyan transition-colors">
                    {contact.email}
                  </a>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <Clock className="w-5 h-5 text-hub-cyan flex-shrink-0" />
                <div>
                  <span className="font-bold block text-white">{isRtl ? 'أوقات العمل الرسمية:' : 'Working Hours:'}</span>
                  <span>{isRtl ? contact.workingHoursAr : contact.workingHours}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Right Form (7 Cols) */}
          <div className="lg:col-span-7 bg-white rounded-2xl border border-gray-200 p-6 sm:p-8 shadow-sm">
            <h2 className="text-xl font-bold text-gray-900 mb-4 pb-2 border-b border-gray-100">
              {isRtl ? 'طلب عرض سعر / استفسار فني' : 'Send an Inquiry / Request a Quote'}
            </h2>

            {submitted ? (
              <div className="p-8 text-center space-y-3 bg-emerald-50 rounded-xl border border-emerald-200 text-emerald-900">
                <CheckCircle2 className="w-12 h-12 text-emerald-600 mx-auto" />
                <h3 className="font-bold text-lg">{isRtl ? 'تم إرسال رسالتك بنجاح!' : 'Message Sent Successfully!'}</h3>
                <p className="text-[13px]">{isRtl ? 'سيتواصل معك مهندس الحسابات خلال ساعتين كحد أقصى.' : 'Our account manager will get back to you within 2 hours.'}</p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-[12px] font-bold text-gray-700 block mb-1">{isRtl ? 'الاسم بالكامل' : 'Full Name'} *</label>
                    <input type="text" required className="w-full px-3.5 py-2 text-[13px] border border-gray-300 rounded-xl focus:outline-none focus:border-hub-blue" />
                  </div>
                  <div>
                    <label className="text-[12px] font-bold text-gray-700 block mb-1">{isRtl ? 'اسم الشركة (اختياري)' : 'Company Name (Optional)'}</label>
                    <input type="text" className="w-full px-3.5 py-2 text-[13px] border border-gray-300 rounded-xl focus:outline-none focus:border-hub-blue" />
                  </div>
                  <div>
                    <label className="text-[12px] font-bold text-gray-700 block mb-1">{isRtl ? 'البريد الإلكتروني' : 'Email Address'} *</label>
                    <input type="email" required className="w-full px-3.5 py-2 text-[13px] border border-gray-300 rounded-xl focus:outline-none focus:border-hub-blue" />
                  </div>
                  <div>
                    <label className="text-[12px] font-bold text-gray-700 block mb-1">{isRtl ? 'رقم الهاتف' : 'Phone Number'} *</label>
                    <input type="tel" required className="w-full px-3.5 py-2 text-[13px] border border-gray-300 rounded-xl focus:outline-none focus:border-hub-blue" />
                  </div>
                </div>

                <div>
                  <label className="text-[12px] font-bold text-gray-700 block mb-1">{isRtl ? 'نوع الطلب' : 'Inquiry Type'}</label>
                  <select className="w-full px-3.5 py-2 text-[13px] border border-gray-300 rounded-xl focus:outline-none focus:border-hub-blue bg-white">
                    <option>{isRtl ? 'استفسار عن المنتجات والمواصفات' : 'Products & Specifications Inquiry'}</option>
                    <option>{isRtl ? 'استفسار عن حلول الشبكات والكمبيوتر' : 'PC & Networking Solutions'}</option>
                    <option>{isRtl ? 'خدمات الصيانة والضمان المعتمد' : 'Warranty & Technical Support'}</option>
                    <option>{isRtl ? 'استفسار عام' : 'General Inquiry'}</option>
                  </select>
                </div>

                <div>
                  <label className="text-[12px] font-bold text-gray-700 block mb-1">{isRtl ? 'تفاصيل الرسالة أو المواصفات المطلوبة' : 'Message Details'} *</label>
                  <textarea rows={4} required className="w-full px-3.5 py-2 text-[13px] border border-gray-300 rounded-xl focus:outline-none focus:border-hub-blue" />
                </div>

                <button
                  type="submit"
                  className="w-full bg-hub-blue hover:bg-hub-blue-dark text-white font-bold text-[14px] py-3 rounded-xl transition-colors shadow-md flex items-center justify-center gap-2"
                >
                  <Send className="w-4 h-4 rtl:rotate-180" />
                  <span>{isRtl ? 'إرسال الطلب الآن' : 'Submit Inquiry'}</span>
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
