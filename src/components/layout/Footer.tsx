'use client';

import React from 'react';
import Link from 'next/link';
import { Logo } from './Logo';
import { useStore } from '@/context/StoreContext';
import {
  MapPin,
  Phone,
  Mail,
  Clock,
  Facebook,
  Instagram,
  Youtube,
  Linkedin
} from 'lucide-react';
import {
  InstaPayBadge,
  VodafoneCashBadge,
  VisaBadge,
  MastercardBadge,
  MeezaBadge,
  ValuBadge
} from '@/components/ui/PaymentBadges';

const TikTokIcon: React.FC<{ className?: string }> = ({ className = 'w-3.5 h-3.5' }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-2.88 2.5 2.89 2.89 0 0 1-2.89-2.89 2.89 2.89 0 0 1 2.89-2.89c.31 0 .61.05.88.13V8.9a6.43 6.43 0 0 0-.88-.06 6.34 6.34 0 0 0-6.34 6.34 6.34 6.34 0 0 0 6.34-6.34V8.75a8.16 8.16 0 0 0 3.76.92V6.69z" />
  </svg>
);

const WhatsAppIcon: React.FC<{ className?: string }> = ({ className = 'w-4 h-4' }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
  </svg>
);

export const Footer: React.FC = () => {
  const { isRtl, socialLinks } = useStore();

  const enabledSocials = (socialLinks || []).filter(s => s.enabled);

  return (
    <footer
      dir={isRtl ? 'rtl' : 'ltr'}
      className="bg-[#003882] text-white pt-6 pb-20 sm:pt-12 sm:pb-8 relative z-20 text-start"
    >
      <div className="max-w-[1536px] mx-auto px-4 sm:px-6">

        {/* Main Footer Grid - Responsive 4 Columns (2 Columns for links on mobile) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 sm:gap-10 pb-5 sm:pb-10 border-b border-white/15">

          {/* Col 1: Brand Info & Socials */}
          <div className="space-y-3 sm:space-y-4">
            <div className="flex items-center rtl:justify-start ltr:justify-start">
              <Logo variant="white" size="md" />
            </div>
            <p className="text-[12.5px] sm:text-[13px] text-blue-100/90 leading-relaxed font-normal max-w-sm">
              {isRtl
                ? 'شريكك التكنولوجي المعتمد في مصر. أجهزة لابتوب، كمبيوتر مكتبي، ومعدات شبكات أصلية 100% بضمان محلي ودعم فني متخصص.'
                : 'Your trusted IT partner in Egypt. Genuine laptops, enterprise hardware, and networking solutions with official warranty and expert support.'}
            </p>

            {/* Social Media Icons (Controlled via Admin) */}
            <div className="flex flex-wrap items-center gap-1.5 sm:gap-2 pt-0.5 sm:pt-1">
              {enabledSocials.map((social) => {
                if (social.id === 'whatsapp') {
                  const href = social.url.startsWith('http')
                    ? social.url
                    : `https://wa.me/${social.url.replace(/[^0-9]/g, '')}`;
                  return (
                    <a
                      key={social.id}
                      href={href}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label="WhatsApp"
                      title={isRtl ? 'واتساب' : 'WhatsApp'}
                      className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-[#25D366] hover:opacity-90 flex items-center justify-center text-white transition-transform hover:scale-105 shadow-sm"
                    >
                      <WhatsAppIcon className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                    </a>
                  );
                }

                if (social.id === 'facebook') {
                  return (
                    <a
                      key={social.id}
                      href={social.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label="Facebook"
                      title={isRtl ? 'فيسبوك' : 'Facebook'}
                      className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-[#1877F2] hover:opacity-90 flex items-center justify-center text-white transition-transform hover:scale-105 shadow-sm"
                    >
                      <Facebook className="w-3.5 h-3.5 sm:w-4 sm:h-4 fill-white" />
                    </a>
                  );
                }

                if (social.id === 'instagram') {
                  return (
                    <a
                      key={social.id}
                      href={social.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label="Instagram"
                      title={isRtl ? 'إنستجرام' : 'Instagram'}
                      className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-gradient-to-tr from-[#f09433] via-[#dc2743] to-[#bc1888] hover:opacity-90 flex items-center justify-center text-white transition-transform hover:scale-105 shadow-sm"
                    >
                      <Instagram className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                    </a>
                  );
                }

                if (social.id === 'youtube') {
                  return (
                    <a
                      key={social.id}
                      href={social.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label="YouTube"
                      title={isRtl ? 'يوتيوب' : 'YouTube'}
                      className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-[#FF0000] hover:opacity-90 flex items-center justify-center text-white transition-transform hover:scale-105 shadow-sm"
                    >
                      <Youtube className="w-3.5 h-3.5 sm:w-4 sm:h-4 fill-white" />
                    </a>
                  );
                }

                if (social.id === 'linkedin') {
                  return (
                    <a
                      key={social.id}
                      href={social.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label="LinkedIn"
                      title={isRtl ? 'لينكد إن' : 'LinkedIn'}
                      className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-[#0A66C2] hover:opacity-90 flex items-center justify-center text-white transition-transform hover:scale-105 shadow-sm"
                    >
                      <Linkedin className="w-3.5 h-3.5 sm:w-4 sm:h-4 fill-white" />
                    </a>
                  );
                }

                if (social.id === 'tiktok') {
                  return (
                    <a
                      key={social.id}
                      href={social.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label="TikTok"
                      title={isRtl ? 'تيك توك' : 'TikTok'}
                      className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-black hover:opacity-90 flex items-center justify-center text-white transition-transform hover:scale-105 shadow-sm"
                    >
                      <TikTokIcon className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                    </a>
                  );
                }

                return null;
              })}
            </div>
          </div>

          {/* Wrapper for 2-column side-by-side links on mobile, spreading into standard columns on sm+ */}
          <div className="grid grid-cols-2 sm:contents gap-4 sm:gap-10">
            {/* Col 2: Shop Categories */}
            <div className="space-y-2.5 sm:space-y-3.5">
              <h4 className="text-white font-bold text-[14px] sm:text-[15px] tracking-wide">
                {isRtl ? 'أقسام المتجر' : 'Shop Categories'}
              </h4>
              <ul className="space-y-2 sm:space-y-2.5 text-[12.5px] sm:text-[13px] text-blue-100/90 font-normal">
                <li>
                  <Link href="/products" className="hover:text-white transition-colors inline-block">
                    {isRtl ? 'جميع المنتجات' : 'All Products'}
                  </Link>
                </li>
                <li>
                  <Link href="/category/laptops" className="hover:text-white transition-colors inline-block">
                    {isRtl ? 'أجهزة اللابتوب' : 'Laptops & Notebooks'}
                  </Link>
                </li>
                <li>
                  <Link href="/category/desktops" className="hover:text-white transition-colors inline-block">
                    {isRtl ? 'الكمبيوتر المكتبي' : 'Desktops'}
                  </Link>
                </li>
                <li>
                  <Link href="/category/network-device" className="hover:text-white transition-colors inline-block">
                    {isRtl ? 'أجهزة الشبكات' : 'Network Devices'}
                  </Link>
                </li>
                <li>
                  <Link href="/deals" className="hover:text-white transition-colors inline-block">
                    {isRtl ? 'أقوى العروض' : 'Deals & Offers'}
                  </Link>
                </li>
              </ul>
            </div>

            {/* Col 3: Customer Care & Policies */}
            <div className="space-y-2.5 sm:space-y-3.5">
              <h4 className="text-white font-bold text-[14px] sm:text-[15px] tracking-wide">
                {isRtl ? 'خدمة العملاء' : 'Customer Care'}
              </h4>
              <ul className="space-y-2 sm:space-y-2.5 text-[12.5px] sm:text-[13px] text-blue-100/90 font-normal">
                <li>
                  <Link href="/about" className="hover:text-white transition-colors inline-block">
                    {isRtl ? 'عن HUB CLOUD' : 'About HUB CLOUD'}
                  </Link>
                </li>
                <li>
                  <Link href="/warranty" className="hover:text-white transition-colors inline-block">
                    {isRtl ? 'الضمان المعتمد' : 'Warranty Policy'}
                  </Link>
                </li>
                <li>
                  <Link href="/shipping" className="hover:text-white transition-colors inline-block">
                    {isRtl ? 'الشحن والتوصيل' : 'Shipping & Delivery'}
                  </Link>
                </li>
                <li>
                  <Link href="/returns" className="hover:text-white transition-colors inline-block">
                    {isRtl ? 'الاستبدال والاسترجاع' : 'Returns & Refunds'}
                  </Link>
                </li>
                <li>
                  <Link href="/faq" className="hover:text-white transition-colors inline-block">
                    {isRtl ? 'الأسئلة الشائعة' : 'FAQ'}
                  </Link>
                </li>
              </ul>
            </div>
          </div>

          {/* Col 4: Contact Us */}
          <div className="space-y-2.5 sm:space-y-3.5">
            <h4 className="text-white font-bold text-[14px] sm:text-[15px] tracking-wide">
              {isRtl ? 'تواصل معنا' : 'Contact Us'}
            </h4>
            <div className="space-y-2 sm:space-y-3 text-[12.5px] sm:text-[13px] text-blue-100/90 font-normal">
              <div className="flex items-start gap-2.5">
                <MapPin className="w-4 h-4 text-blue-300 flex-shrink-0 mt-0.5" />
                <span className="leading-snug sm:leading-relaxed">
                  {isRtl
                    ? '181 شارع السودان - الدور التاسع - المهندسين، الجيزة، مصر'
                    : '181 Al Sudan St., 9th Floor, Mohandseen, Giza, Egypt'}
                </span>
              </div>
              <div className="flex items-center gap-2.5">
                <Phone className="w-4 h-4 text-blue-300 flex-shrink-0" />
                <a
                  href="tel:+2001060777895"
                  className="hover:text-white transition-colors font-mono inline-block text-start"
                  dir="ltr"
                >
                  <span dir="ltr" className="inline-block font-mono">010 60 777 895 (+20)</span>
                </a>
              </div>
              <div className="flex items-center gap-2.5">
                <Mail className="w-4 h-4 text-blue-300 flex-shrink-0" />
                <a
                  href="mailto:sales@hubcloud-eg.com"
                  className="hover:text-white transition-colors font-mono inline-block text-start"
                  dir="ltr"
                >
                  <span dir="ltr" className="inline-block font-mono">sales@hubcloud-eg.com</span>
                </a>
              </div>
              <div className="flex items-center gap-2.5">
                <Clock className="w-4 h-4 text-blue-300 flex-shrink-0" />
                <span>
                  {isRtl ? 'السبت - الخميس: 9:00 ص - 9:00 م' : 'Sat - Thu: 9:00 AM - 9:00 PM'}
                </span>
              </div>
            </div>
          </div>

        </div>

        {/* Bottom Sub-bar */}
        <div className="pt-4 sm:pt-6 flex flex-col md:flex-row items-center justify-between gap-3 sm:gap-4 text-[11px] sm:text-[12px] text-blue-100/80">
          <p className="font-normal text-center sm:text-start" dir="ltr">
            © {new Date().getFullYear()} HUB CLOUD IT Solutions. {isRtl ? 'جميع الحقوق محفوظة.' : 'All Rights Reserved.'}
          </p>

          <div className="flex flex-wrap items-center justify-center sm:justify-end gap-2">
            <span className="text-white/90 font-medium text-[11px] sm:text-[12px] shrink-0">
              {isRtl ? 'طرق الدفع المعتمدة:' : 'Payment Methods:'}
            </span>
            <div className="flex flex-wrap items-center gap-1.5">
              <VisaBadge size="sm" />
              <MastercardBadge size="sm" />
              <MeezaBadge size="sm" />
              <ValuBadge size="sm" />
              <InstaPayBadge size="sm" variant="white" />
              <VodafoneCashBadge size="sm" variant="white" />
            </div>
          </div>
        </div>

      </div>
    </footer>
  );
};
