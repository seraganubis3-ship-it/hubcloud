'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { SiteContent, DEFAULT_SITE_CONTENT } from '@/lib/content';
import { useStore } from '@/context/StoreContext';
import {
  ShieldCheck,
  Server,
  Video,
  Network,
  Monitor,
  Fingerprint,
  Cpu,
  Database,
  Printer,
  PhoneCall,
  Volume2,
  Tv,
  Users,
  Award,
  ChevronRight,
  Sparkles,
  Phone,
  Mail,
  MapPin,
  Building2,
  CheckCircle2,
  ArrowRight
} from 'lucide-react';

const ICON_MAP: Record<string, React.ElementType> = {
  Server,
  Video,
  Network,
  Monitor,
  ShieldCheck,
  Fingerprint,
  Cpu,
  Database,
  Printer,
  PhoneCall,
  Volume2,
  Tv,
};

export default function AboutPage() {
  const { isRtl } = useStore();
  const [content, setContent] = useState<SiteContent>(DEFAULT_SITE_CONTENT);

  useEffect(() => {
    fetch('/api/content')
      .then(res => res.json())
      .then(data => {
        if (data.success && data.content) {
          setContent(data.content);
        }
      })
      .catch(() => {});
  }, []);

  const { about, contact } = content;

  return (
    <div className="py-8 bg-slate-50 min-h-screen space-y-12">
      <div className="max-w-7xl mx-auto px-4 space-y-12">

        {/* Breadcrumbs */}
        <div className="flex items-center gap-2 text-[12px] text-gray-500">
          <Link href="/" className="hover:text-blue-600 transition-colors">{isRtl ? 'الرئيسية' : 'Home'}</Link>
          <ChevronRight className="w-3 h-3 rtl:rotate-180 text-gray-400" />
          <span className="font-semibold text-gray-900">{isRtl ? 'عن الشركة (من نحن)' : 'About HUB CLOUD'}</span>
        </div>

        {/* 1. HERO SECTION */}
        <div className="bg-gradient-to-br from-[#071426] via-[#0C2442] to-[#040E1C] rounded-3xl p-8 sm:p-14 text-white relative overflow-hidden shadow-xl">
          <div className="absolute top-0 right-0 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

          <div className="relative z-10 max-w-3xl space-y-5">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-500/20 border border-blue-400/30 text-blue-300 text-xs font-bold">
              <Sparkles className="w-3.5 h-3.5 text-blue-400" />
              <span>{isRtl ? 'خبرة تزيد عن 10 سنوات في حلول تكنولوجيا المعلومات' : '10+ Years of Enterprise IT Solutions'}</span>
            </div>

            <h1 className="text-3xl sm:text-5xl font-black tracking-tight leading-tight">
              {isRtl ? about.heroTitleAr : about.heroTitle}
            </h1>

            <p className="text-sm sm:text-base text-slate-300 leading-relaxed">
              {isRtl ? about.heroSubtitleAr : about.heroSubtitle}
            </p>

            <div className="pt-2 flex flex-wrap items-center gap-6 text-xs text-slate-300">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span className="font-bold">{isRtl ? 'أنظمة حماية وأمان متكاملة' : 'Integrated Security & Protection'}</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span className="font-bold">{isRtl ? 'خبراء ومهندسون معتمدون' : 'Certified Senior IT Engineers'}</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span className="font-bold">{isRtl ? 'ضمان محلي رسمي معتمد' : 'Official Agency Warranties'}</span>
              </div>
            </div>
          </div>
        </div>

        {/* 2. STATS COUNTER BAR */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-white rounded-2xl border border-gray-200 p-6 text-center shadow-xs">
            <span className="text-3xl sm:text-4xl font-black text-blue-600 font-mono block">
              +{about.experienceYears}
            </span>
            <span className="text-xs font-bold text-gray-600 mt-1 block">
              {isRtl ? 'سنوات من الخبرة الهندسية' : 'Years Experience'}
            </span>
          </div>

          <div className="bg-white rounded-2xl border border-gray-200 p-6 text-center shadow-xs">
            <span className="text-3xl sm:text-4xl font-black text-emerald-600 font-mono block">
              {about.completedProjects}
            </span>
            <span className="text-xs font-bold text-gray-600 mt-1 block">
              {isRtl ? 'مشروع ومنشأة تم تجهيزها' : 'Projects Completed'}
            </span>
          </div>

          <div className="bg-white rounded-2xl border border-gray-200 p-6 text-center shadow-xs">
            <span className="text-3xl sm:text-4xl font-black text-indigo-600 font-mono block">
              19+
            </span>
            <span className="text-xs font-bold text-gray-600 mt-1 block">
              {isRtl ? 'مؤسسة وبنك وطني يعتمدون علينا' : 'Major Enterprise Clients'}
            </span>
          </div>

          <div className="bg-white rounded-2xl border border-gray-200 p-6 text-center shadow-xs">
            <span className="text-3xl sm:text-4xl font-black text-amber-600 font-mono block">
              {about.clientSatisfaction}
            </span>
            <span className="text-xs font-bold text-gray-600 mt-1 block">
              {isRtl ? 'نسبة رضا العملاء' : 'Client Satisfaction'}
            </span>
          </div>
        </div>

        {/* 3. WHO ARE WE & VISION (TWO COLUMNS) */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-stretch">
          {/* Who Are We */}
          <div className="bg-white rounded-3xl border border-gray-200 p-8 sm:p-10 shadow-xs space-y-4 flex flex-col justify-between">
            <div className="space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
                <Users className="w-6 h-6" />
              </div>
              <h2 className="text-2xl font-black text-gray-900">
                {isRtl ? 'من نحن (Who are we)' : 'Who We Are'}
              </h2>
              <p className="text-sm text-gray-600 leading-relaxed whitespace-pre-line">
                {isRtl ? about.whoAreWeAr : about.whoAreWe}
              </p>
            </div>
            <div className="pt-4 border-t border-gray-100 flex items-center gap-2 text-xs font-bold text-blue-600">
              <span>HUB CLOUD IT Solutions</span>
              <span>•</span>
              <span>{isRtl ? 'فريق هندسي متكامل' : 'Professional Engineering Team'}</span>
            </div>
          </div>

          {/* Our Vision */}
          <div className="bg-white rounded-3xl border border-gray-200 p-8 sm:p-10 shadow-xs space-y-4 flex flex-col justify-between">
            <div className="space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold">
                <Award className="w-6 h-6" />
              </div>
              <h2 className="text-2xl font-black text-gray-900">
                {isRtl ? 'رؤيتنا (Our Vision)' : 'Our Vision'}
              </h2>
              <p className="text-sm text-gray-600 leading-relaxed whitespace-pre-line">
                {isRtl ? about.ourVisionAr : about.ourVision}
              </p>
            </div>
            <div className="pt-4 border-t border-gray-100 flex items-center gap-2 text-xs font-bold text-emerald-600">
              <CheckCircle2 className="w-4 h-4" />
              <span>{isRtl ? 'أعلى جودة • أقل تكلفة • في وقت قياسي' : 'Highest Quality • Lowest Cost • Record Time'}</span>
            </div>
          </div>
        </div>

        {/* 4. OUR 12 OFFICIAL SERVICES (GRID) */}
        <div id="services" className="space-y-6 pt-4 scroll-mt-24">
          <div className="text-center max-w-2xl mx-auto space-y-2">
            <span className="text-xs font-bold text-blue-600 uppercase tracking-wider">
              {isRtl ? 'مجالات العمل والتخصص' : 'Enterprise Capabilities'}
            </span>
            <h2 className="text-2xl sm:text-3xl font-black text-gray-900">
              {isRtl ? 'خدماتنا التكنولوجية المتكاملة' : 'Our Comprehensive Services'}
            </h2>
            <p className="text-xs sm:text-sm text-gray-500">
              {isRtl
                ? 'تغطية شاملة لكافة احتياجات البنية التحتية والعتاد الأمني والشبكات للمؤسسات والشركات.'
                : 'Complete end-to-end IT hardware, enterprise security, and networking infrastructure.'}
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {about.services.map((srv) => {
              const IconComp = ICON_MAP[srv.icon] || Server;
              return (
                <div
                  key={srv.id}
                  className="bg-white rounded-2xl border border-gray-200 p-5 hover:border-blue-300 hover:shadow-md transition-all group space-y-3"
                >
                  <div className="w-11 h-11 rounded-xl bg-slate-50 text-blue-600 group-hover:bg-blue-600 group-hover:text-white transition-colors flex items-center justify-center">
                    <IconComp className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-extrabold text-gray-900 text-sm mb-1 group-hover:text-blue-600 transition-colors">
                      {isRtl ? srv.titleAr : srv.title}
                    </h3>
                    <p className="text-xs text-gray-500 leading-relaxed">
                      {isRtl ? srv.descriptionAr : srv.description}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* 5. OUR CLIENTS & PARTNERS (FROM PDF) */}
        <div id="clients" className="space-y-8 pt-6 scroll-mt-24">
          {/* Major Clients */}
          <div className="bg-white rounded-3xl border border-gray-200 p-8 sm:p-12 shadow-xs space-y-6">
            <div className="text-center max-w-xl mx-auto space-y-2">
              <span className="text-xs font-bold text-blue-600 uppercase tracking-wider">
                {isRtl ? 'ثقة كبرى المؤسسات في مصر' : 'Trusted by Egyptian Leaders'}
              </span>
              <h2 className="text-2xl sm:text-3xl font-black text-gray-900">
                {isRtl ? 'عملاؤنا وشركاء المسيرة' : 'Our Esteemed Clients'}
              </h2>
              <p className="text-xs text-gray-500">
                {isRtl
                  ? 'نفخر بتقديم وتجهيز الحلول التكنولوجية لأكبر البنوك والمستشفيات والشركات الوطنية.'
                  : 'Proud to equip national banks, hospitals, and leading enterprises across Egypt.'}
              </p>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 pt-2">
              {about.clients.map((c, idx) => (
                <div
                  key={idx}
                  className="p-3.5 rounded-xl border border-gray-100 bg-slate-50/70 hover:bg-white hover:border-blue-200 hover:shadow-xs transition-all text-center flex flex-col justify-center min-h-[72px]"
                >
                  <span className="font-black text-gray-900 text-[12px] block">
                    {isRtl ? c.nameAr : c.name}
                  </span>
                  <span className="text-[10px] text-gray-400 font-medium block mt-0.5">
                    {c.sector}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Success Partners Brands */}
          <div className="bg-slate-900 text-white rounded-3xl p-8 sm:p-12 shadow-lg space-y-6">
            <div className="text-center max-w-xl mx-auto space-y-2">
              <span className="text-xs font-bold text-blue-400 uppercase tracking-wider">
                {isRtl ? 'التحالفات التكنولوجية العالمية' : 'Global Technology Alliances'}
              </span>
              <h2 className="text-2xl sm:text-3xl font-black text-white">
                {isRtl ? 'شركاء النجاح المعتمدون' : 'Our Success Partners'}
              </h2>
              <p className="text-xs text-slate-400">
                {isRtl
                  ? 'شراكات قوية مع كبرى الشركات المصنعة لضمان تزويدكم بأحدث الأجهزة والقطع الأصلية.'
                  : 'Certified partnerships with tier-1 technology vendors ensuring genuine hardware.'}
              </p>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3 pt-2">
              {about.partners.map((p, idx) => (
                <div
                  key={idx}
                  className="p-4 rounded-xl border border-slate-800 bg-slate-950/70 text-center hover:border-blue-500/50 transition-colors flex flex-col justify-center"
                >
                  <span className="font-black text-white text-[13px] block">{p.name}</span>
                  <span className="text-[10px] text-blue-300 font-medium block mt-0.5">{p.tier}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* 6. CONTACT CTA BOX */}
        <div className="bg-white rounded-3xl border border-gray-200 p-8 sm:p-10 shadow-xs flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="space-y-2 text-start">
            <h3 className="text-xl sm:text-2xl font-black text-gray-900">
              {isRtl ? 'هل تخطط لتجهيز مشروعك أو مقر شركتك؟' : 'Ready to equip your enterprise infrastructure?'}
            </h3>
            <p className="text-xs sm:text-sm text-gray-500 max-w-xl">
              {isRtl
                ? 'مهندسونا جاهزون لتقديم المعاينة والاستشارة الفنية وعروض الأسعار المخصصة.'
                : 'Our engineers are ready for technical consultation and custom volume quotes.'}
            </p>
            <div className="flex flex-wrap items-center gap-4 text-xs text-gray-600 pt-2">
              <span className="flex items-center gap-1 font-mono font-bold text-blue-600">
                <Phone className="w-3.5 h-3.5" />
                <span>{contact.phone}</span>
              </span>
              <span className="flex items-center gap-1 text-gray-500">
                <Mail className="w-3.5 h-3.5 text-blue-600" />
                <span>{contact.email}</span>
              </span>
              <span className="flex items-center gap-1 text-gray-500">
                <MapPin className="w-3.5 h-3.5 text-blue-600" />
                <span>{isRtl ? contact.addressAr : contact.address}</span>
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <a
              href="https://wa.me/2001060777895"
              target="_blank"
              rel="noopener noreferrer"
              className="bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs sm:text-sm px-6 py-3.5 rounded-xl shadow-md transition-all flex items-center gap-2"
            >
              <span>{isRtl ? 'تواصل مع فريقنا عبر واتساب' : 'Chat with Our Team on WhatsApp'}</span>
              <ArrowRight className="w-4 h-4 rtl:rotate-180" />
            </a>
          </div>
        </div>

      </div>
    </div>
  );
}
