'use client';

import React from 'react';
import Image from 'next/image';
import { useStore } from '@/context/StoreContext';
import {
  Laptop,
  Monitor,
  Network,
  Scan,
  Headphones,
  ShieldCheck,
  Truck,
  CheckCircle2,
  Sparkles,
  ArrowRight,
} from 'lucide-react';

interface CategoryBannerProps {
  slug: string;
  categoryName: string;
  categoryNameAr?: string;
  itemCount: number;
  description?: string;
  descriptionAr?: string;
}

interface CategoryConfig {
  titleEn: string;
  titleAr: string;
  subtitleEn: string;
  subtitleAr: string;
  badgeEn: string;
  badgeAr: string;
  pillColor: string;
  bannerImage: string;
  perks: Array<{ en: string; ar: string }>;
  chips: string[];
}

const CATEGORY_CONFIGS: Record<string, CategoryConfig> = {
  laptops: {
    titleEn: 'Laptops & Mobile Workstations',
    titleAr: 'أجهزة اللابتوب ومحطات العمل المحمولة',
    subtitleEn:
      'Engineered with Intel Core Ultra & Apple M-Series for engineering, heavy computing, and creative professionals.',
    subtitleAr:
      'أجهزة أبل ماك بوك برو، ديل لابتوب، ولينوفو ثينك باد الأصلية بضمان محلي معتمد مع إمكانية التقسيط حتى 24 شهراً.',
    badgeEn: 'AUTHORIZED TECH DEALER',
    badgeAr: 'موزع رسمي معتمد',
    pillColor: 'bg-blue-500/20 text-blue-300 border-blue-400/40',
    bannerImage: '/images/banners/cat_laptops.jpg',
    perks: [
      { en: 'Official 1-3 Yr Warranty', ar: 'ضمان محلي معتمد حتى 3 سنوات' },
      { en: 'Fast Express Delivery', ar: 'شحن سريع لكافة المحافظات' },
      { en: 'Installments up to 24 Mos', ar: 'تقسيط مريح حتى 24 شهر' },
    ],
    chips: ['Apple MacBook Pro', 'Dell Latitude', 'Lenovo ThinkPad', 'ASUS ROG', 'HP EliteBook'],
  },
  desktops: {
    titleEn: 'Desktops & Heavy Workstations',
    titleAr: 'محطات العمل وأجهزة الكمبيوتر المكتبية',
    subtitleEn:
      'Industrial-grade Dell Precision, HP ProDesk & Apple Mac Studio built for continuous 24/7 uptime & CAD simulations.',
    subtitleAr:
      'محطات عمل ديل بريسيجن وماك ستوديو مصممة للأعمال الهندسية، الرندرة الشاقة، والتصميم ثلاثي الأبعاد مع أداء حراري فائق.',
    badgeEn: 'HEAVY WORKLOAD COMPUTING',
    badgeAr: 'حوسبة الأعمال والمشاريع الهندسية',
    pillColor: 'bg-indigo-500/20 text-indigo-300 border-indigo-400/40',
    bannerImage: '/images/banners/cat_desktops.jpg',
    perks: [
      { en: 'Intel Xeon & Core i9', ar: 'معالجات Intel Xeon و Core i9' },
      { en: 'NVIDIA RTX Ada Quadro', ar: 'كروت NVIDIA RTX الهندسية' },
      { en: 'Tested for 24/7 Stability', ar: 'جاهزة للتشغيل المتواصل 24/7' },
    ],
    chips: ['Dell Precision', 'Apple Mac Studio', 'HP ProDesk Tower', 'Micro Desktops'],
  },
  'network-device': {
    titleEn: 'Enterprise Network Infrastructure',
    titleAr: 'أجهزة ومعدات شبكات المؤسسات',
    subtitleEn:
      'Cisco Catalyst managed switches, Fortinet FortiGate hardware firewalls and enterprise Wi-Fi 6 wireless gear.',
    subtitleAr:
      'سويتشات سيسكو المدارة وجدران الحماية فورتينت لحماية واستقرار بيانات الشركات مع بنية تحتية سريعة وموثوقة.',
    badgeEn: 'ENTERPRISE INFRASTRUCTURE',
    badgeAr: 'بنية تحتية وشبكات معتمدة',
    pillColor: 'bg-cyan-500/20 text-cyan-300 border-cyan-400/40',
    bannerImage: '/images/banners/cat_network.jpg',
    perks: [
      { en: 'Gigabit PoE+ Managed', ar: 'سويتشات Gigabit PoE+ مدارة' },
      { en: 'Zero-Trust Cyber Defense', ar: 'جدران حماية وأمان متقدم' },
      { en: 'Official Cisco & Fortinet', ar: 'عتاد سيسكو وفورتينت الأصلي' },
    ],
    chips: ['Cisco Catalyst', 'Fortinet FortiGate', 'UniFi Wi-Fi 6', 'PoE+ Switches'],
  },
  scanner: {
    titleEn: 'High-Speed Document Scanners',
    titleAr: 'الماسحات الضوئية وأرشفة المستندات',
    subtitleEn:
      'Heavy-duty sheetfed scanners by Canon & Fujitsu for rapid paperless archiving, banking transactions, and records.',
    subtitleAr:
      'ماسحات ضوئية عالية الدقة والسرعة من كانون وفوجيتسو لأرشفة المستندات الورقية للبنوك والمؤسسات بدقة 600 DPI.',
    badgeEn: 'DOCUMENT DIGITIZATION',
    badgeAr: 'أرشفة رقمية ومسح ضوئي عالي السرعة',
    pillColor: 'bg-teal-500/20 text-teal-300 border-teal-400/40',
    bannerImage: '/images/banners/cat_scanners.jpg',
    perks: [
      { en: 'Up to 70 ppm Duplex ADF', ar: 'سرعة مسح تصل لـ 70 ورقة/دقيقة' },
      { en: '600 DPI Optical Clarity', ar: 'دقة بصرية فائقة 600 DPI' },
      { en: 'Official Canon & Fujitsu', ar: 'وكيل معتمد كانون وفوجيتسو' },
    ],
    chips: ['Canon imageFORMULA', 'Fujitsu fi-Series', 'Duplex Sheetfed', 'Heavy Duty'],
  },
  accessories: {
    titleEn: 'Workspace Accessories & Docks',
    titleAr: 'الإكسسوارات وقواعد التوصيل الاحترافية',
    subtitleEn:
      'Dell Thunderbolt 4 docking stations, Logitech MX Master precision mice, and premium enterprise workspace gear.',
    subtitleAr:
      'قواعد توصيل ديل ثندربولت وماوسات لوجيتك اللاسلكية الأصلية المريحة لتجهيز بيئة عمل مكتبية متكاملة.',
    badgeEn: 'PRO WORKSPACE GEAR',
    badgeAr: 'ملحقات وبيئة عمل متطورة',
    pillColor: 'bg-purple-500/20 text-purple-300 border-purple-400/40',
    bannerImage: '/images/banners/cat_accessories.jpg',
    perks: [
      { en: '100% Genuine Guaranteed', ar: 'منتجات أصلية 100% مضمونة' },
      { en: 'Thunderbolt 4 Multi-Display', ar: 'دعم توصيل شاشات متعددة 4K' },
      { en: 'Ergonomic Precision Control', ar: 'تصميم مريح لدقة العمل الطويل' },
    ],
    chips: ['Logitech MX Series', 'Dell Docking Stations', 'Thunderbolt 4', 'Type-C Hubs'],
  },
};

export const CategoryBanner: React.FC<CategoryBannerProps> = ({
  slug,
  categoryName,
  categoryNameAr,
  itemCount,
  description,
  descriptionAr,
}) => {
  const { isRtl } = useStore();

  const config = CATEGORY_CONFIGS[slug.toLowerCase()] || {
    titleEn: categoryName,
    titleAr: categoryNameAr || categoryName,
    subtitleEn: description || 'Browse certified enterprise hardware with full official warranty and express delivery.',
    subtitleAr: descriptionAr || description || 'تصفح أحدث الأجهزة التقنية المعتمدة بضمان محلي رسمي وشحن فوري.',
    badgeEn: 'OFFICIAL HARDWARE',
    badgeAr: 'عتاد تقني معتمد',
    pillColor: 'bg-blue-500/20 text-blue-300 border-blue-400/40',
    bannerImage: '/images/banners/cat_laptops.jpg',
    perks: [
      { en: 'Official Local Warranty', ar: 'ضمان محلي رسمي معتمد' },
      { en: 'Express Delivery', ar: 'شحن سريع لكافة المحافظات' },
    ],
    chips: [],
  };

  const title = isRtl ? config.titleAr : config.titleEn;
  const subtitle = isRtl ? config.subtitleAr : config.subtitleEn;
  const badge = isRtl ? config.badgeAr : config.badgeEn;

  return (
    <div
      className="relative rounded-2xl sm:rounded-3xl overflow-hidden border border-slate-800 shadow-xl bg-gradient-to-br from-[#0a1528] via-[#0d203f] to-[#060d19] text-white p-5 sm:p-7 md:p-9 mb-6"
    >
      {/* Ambient background glow accents */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div
          className={`absolute -top-20 ${
            isRtl ? '-left-20' : '-right-20'
          } w-80 h-80 rounded-full bg-blue-600/15 blur-3xl opacity-60`}
        />
      </div>

      <div className="relative z-10 flex flex-col lg:flex-row items-center justify-between gap-6 lg:gap-8">
        {/* Text Content Column */}
        <div className="flex-1 max-w-2xl text-left rtl:text-right w-full">
          {/* Badge & Item Count */}
          <div className="flex flex-wrap items-center gap-2 mb-3">
            <span
              className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold border backdrop-blur-md ${config.pillColor}`}
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>{badge}</span>
            </span>

            <span className="px-3 py-1 rounded-full bg-white/10 backdrop-blur-md border border-white/15 text-slate-200 text-[11px] font-semibold">
              {itemCount} {isRtl ? 'منتج متوفر' : 'Products Available'}
            </span>
          </div>

          {/* Title */}
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-black tracking-tight leading-tight mb-2.5 text-white drop-shadow-sm">
            {title}
          </h1>

          {/* Subtitle */}
          <p className="text-xs sm:text-sm text-slate-300 font-normal leading-relaxed mb-4 max-w-xl">
            {subtitle}
          </p>

          {/* Perks Bar */}
          <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-xs text-slate-300 mb-4">
            {config.perks.map((perk, i) => (
              <div key={i} className="flex items-center gap-1.5 font-medium">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                <span>{isRtl ? perk.ar : perk.en}</span>
              </div>
            ))}
          </div>

          {/* Popular Tag Chips */}
          {config.chips.length > 0 && (
            <div className="flex flex-wrap items-center gap-1.5 pt-1">
              <span className="text-[11px] font-bold text-slate-400 me-1">
                {isRtl ? 'الفئات الأكثر طلباً:' : 'Popular:'}
              </span>
              {config.chips.map((chip, idx) => (
                <span
                  key={idx}
                  className="px-2.5 py-1 rounded-lg bg-white/10 backdrop-blur-md border border-white/15 text-[11px] font-medium text-slate-200 hover:bg-white/20 transition-colors"
                >
                  {chip}
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Dedicated Uncropped Photographic Banner Image (Exact 16:9 Aspect Ratio) */}
        <div className="shrink-0 w-full sm:w-[320px] md:w-[380px] lg:w-[440px] aspect-[16/9] relative rounded-2xl overflow-hidden shadow-2xl border border-slate-700/60 bg-slate-950">
          <Image
            src={config.bannerImage}
            alt={title}
            fill
            priority
            className="object-contain sm:object-cover object-center w-full h-full"
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 380px, 440px"
          />
        </div>
      </div>
    </div>
  );
};
