'use client';

import React, { useState, useEffect } from 'react';
import { useStore } from '@/context/StoreContext';
import {
  Settings,
  Store,
  Building2,
  Percent,
  Truck,
  Phone,
  Mail,
  MapPin,
  Save,
  CheckCircle2,
  Clock,
  ShieldCheck,
  AlertCircle,
  Share2,
  Facebook,
  Instagram,
  Youtube,
  Linkedin,
  ExternalLink
} from 'lucide-react';
import { SocialLinkConfig } from '@/types';

const TikTokIcon: React.FC<{ className?: string }> = ({ className = 'w-4 h-4' }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-2.88 2.5 2.89 2.89 0 0 1-2.89-2.89 2.89 2.89 0 0 1 2.89-2.89c.31 0 .61.05.88.13V8.9a6.43 6.43 0 0 0-.88-.06 6.34 6.34 0 0 0-6.34 6.34 6.34 6.34 0 0 0 6.34-6.34V8.75a8.16 8.16 0 0 0 3.76.92V6.69z" />
  </svg>
);

const WhatsAppIcon: React.FC<{ className?: string }> = ({ className = 'w-4 h-4' }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
  </svg>
);

export default function AdminSettingsPage() {
  const { showToast, isRtl, socialLinks, updateSocialLinks } = useStore();
  const [localSocialLinks, setLocalSocialLinks] = useState<SocialLinkConfig[]>([]);

  useEffect(() => {
    if (socialLinks && socialLinks.length > 0) {
      setLocalSocialLinks(socialLinks);
    }
  }, [socialLinks]);

  const [storeName, setStoreName] = useState('HUB CLOUD IT Solutions');
  const [supportPhone, setSupportPhone] = useState('+20 010 60 777 895');
  const [supportEmail, setSupportEmail] = useState('sales@hubcloud.info');
  const [showroomAddress, setShowroomAddress] = useState('181 شارع السودان - الدور التاسع - المهندسين، الجيزة');

  const [commercialRegistry, setCommercialRegistry] = useState('142083');
  const [officialWarrantyPartner, setOfficialWarrantyPartner] = useState('موزع وشريك معتمد لتجهيزات الشبكات ومحطات العمل');
  const [workingHours, setWorkingHours] = useState('السبت إلى الخميس: 9:00 ص - 9:00 م (الجمعة عطلة أسبوعية)');

  const [freeShippingThreshold, setFreeShippingThreshold] = useState(5000);
  const [standardDeliveryFee, setStandardDeliveryFee] = useState(75);
  const [dispatchCutoff, setDispatchCutoff] = useState('16:00');

  useEffect(() => {
    try {
      const saved = localStorage.getItem('hubcloud_store_settings');
      if (saved) {
        const data = JSON.parse(saved);
        if (data.storeName) setStoreName(data.storeName);
        if (data.supportPhone) setSupportPhone(data.supportPhone);
        if (data.supportEmail) setSupportEmail(data.supportEmail);
        if (data.showroomAddress) setShowroomAddress(data.showroomAddress);
        if (data.commercialRegistry) setCommercialRegistry(data.commercialRegistry);
        if (data.officialWarrantyPartner) setOfficialWarrantyPartner(data.officialWarrantyPartner);
        if (data.workingHours) setWorkingHours(data.workingHours);
        if (data.freeShippingThreshold) setFreeShippingThreshold(data.freeShippingThreshold);
        if (data.standardDeliveryFee) setStandardDeliveryFee(data.standardDeliveryFee);
      }
    } catch (e) {}
  }, []);

  const handleToggleSocial = (id: string) => {
    setLocalSocialLinks((prev) =>
      prev.map((item) => (item.id === id ? { ...item, enabled: !item.enabled } : item))
    );
  };

  const handleSocialUrlChange = (id: string, url: string) => {
    setLocalSocialLinks((prev) =>
      prev.map((item) => (item.id === id ? { ...item, url } : item))
    );
  };

  const handleSaveSettings = (e: React.FormEvent) => {
    e.preventDefault();
    const payload = {
      storeName,
      supportPhone,
      supportEmail,
      showroomAddress,
      commercialRegistry,
      officialWarrantyPartner,
      workingHours,
      freeShippingThreshold,
      standardDeliveryFee,
      dispatchCutoff
    };

    try {
      localStorage.setItem('hubcloud_store_settings', JSON.stringify(payload));
      if (localSocialLinks.length > 0) {
        updateSocialLinks(localSocialLinks);
      }
      showToast(isRtl ? 'تم حفظ إعدادات المتجر وقنوات التواصل بنجاح' : 'Store settings & social channels saved successfully', 'success');
    } catch (e) {
      showToast('Error saving settings', 'error');
    }
  };

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 pb-6 border-b border-slate-800">
        <div>
          <h1 className="text-2xl font-black text-white tracking-tight flex items-center gap-2">
            <Settings className="w-6 h-6 text-blue-400" />
            <span>{isRtl ? 'إعدادات المتجر وبيانات التشغيل' : 'Store Operations & Commercial Settings'}</span>
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            {isRtl
              ? 'تخصيص بيانات المتجر الرسمية، أرقام التواصل والدعم، وساعات العمل ومعايير الشحن والتوصيل.'
              : 'Configure official brand identity, contact channels, working hours, and dispatch logistics.'}
          </p>
        </div>

        <button
          onClick={handleSaveSettings}
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white text-[13px] font-bold px-5 py-2.5 rounded-xl transition-all shadow-md shadow-blue-600/20"
        >
          <Save className="w-4 h-4" />
          <span>{isRtl ? 'حفظ التعديلات' : 'Save Changes'}</span>
        </button>
      </div>

      <form onSubmit={handleSaveSettings} className="space-y-6">
        {/* Section 1: Store & Entity Identity */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-slate-800">
            <Store className="w-5 h-5 text-blue-400" />
            <h3 className="font-bold text-white text-base">{isRtl ? 'هوية المتجر وبيانات التواصل' : 'Store Identity & Contact Details'}</h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1">{isRtl ? 'اسم المتجر / العلامة التجارية' : 'Brand Name'}</label>
              <input
                type="text"
                required
                value={storeName}
                onChange={(e) => setStoreName(e.target.value)}
                className="w-full px-3.5 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1">{isRtl ? 'هاتف وواتساب المبيعات الرسمي' : 'Official Sales WhatsApp / Phone'}</label>
              <input
                type="text"
                required
                value={supportPhone}
                onChange={(e) => setSupportPhone(e.target.value)}
                className="w-full px-3.5 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white font-mono focus:outline-none focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1">{isRtl ? 'البريد الإلكتروني للشركات والدعم' : 'Support Email'}</label>
              <input
                type="email"
                required
                value={supportEmail}
                onChange={(e) => setSupportEmail(e.target.value)}
                className="w-full px-3.5 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1">{isRtl ? 'المقر الرئيسي ومركز التوزيع' : 'Showroom & Headquarters'}</label>
              <input
                type="text"
                required
                value={showroomAddress}
                onChange={(e) => setShowroomAddress(e.target.value)}
                className="w-full px-3.5 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-blue-500"
              />
            </div>
          </div>
        </div>

        {/* Section 2: Official Documentation & Warranty */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-slate-800">
            <Building2 className="w-5 h-5 text-emerald-400" />
            <h3 className="font-bold text-white text-base">{isRtl ? 'بيانات السجل التجاري والضمان والعمل' : 'Commercial Registration & Official Warranty'}</h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1">{isRtl ? 'رقم السجل التجاري' : 'Commercial Registry Number'}</label>
              <input
                type="text"
                required
                value={commercialRegistry}
                onChange={(e) => setCommercialRegistry(e.target.value)}
                className="w-full px-3.5 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white font-mono focus:outline-none focus:border-blue-500"
              />
              <span className="text-[10px] text-slate-500 mt-1 block">{isRtl ? 'ترخيص رسمي معتمد بوزارة التجارة المصرية' : 'Official registration license'}</span>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1">{isRtl ? 'صفة الضمان والاعتماد' : 'Warranty & Hardware Partner'}</label>
              <input
                type="text"
                required
                value={officialWarrantyPartner}
                onChange={(e) => setOfficialWarrantyPartner(e.target.value)}
                className="w-full px-3.5 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-blue-500"
              />
              <span className="text-[10px] text-slate-500 mt-1 block">{isRtl ? 'يظهر في إيصالات الشراء وصفحات الدعم' : 'Displayed on order receipts & support'}</span>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1">{isRtl ? 'ساعات وأيام العمل الرسمية' : 'Working Days & Hours'}</label>
              <input
                type="text"
                required
                value={workingHours}
                onChange={(e) => setWorkingHours(e.target.value)}
                className="w-full px-3.5 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-blue-500"
              />
              <span className="text-[10px] text-slate-500 mt-1 block">{isRtl ? 'أوقات الدعم المباشر والشحن الفوري' : 'Direct support & dispatch schedule'}</span>
            </div>
          </div>
        </div>

        {/* Section 3: Delivery & Logistics Thresholds */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-slate-800">
            <Truck className="w-5 h-5 text-indigo-400" />
            <h3 className="font-bold text-white text-base">{isRtl ? 'إعدادات الشحن والتوصيل اللوجستي' : 'Delivery & Logistics Operations'}</h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1">{isRtl ? 'الحد الأدنى للشحن المجاني (جنيه)' : 'Free Shipping Threshold (EGP)'}</label>
              <input
                type="number"
                required
                value={freeShippingThreshold}
                onChange={(e) => setFreeShippingThreshold(Number(e.target.value))}
                className="w-full px-3.5 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white font-mono focus:outline-none focus:border-blue-500"
              />
              <span className="text-[10px] text-slate-500 mt-1 block">{isRtl ? 'يتم منح الشحن المجاني للطلبات الأعلى من هذه القيمة' : 'Free delivery awarded above this amount'}</span>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1">{isRtl ? 'تكلفة الشحن الثابتة (جنيه)' : 'Flat Courier Delivery Fee (EGP)'}</label>
              <input
                type="number"
                required
                value={standardDeliveryFee}
                onChange={(e) => setStandardDeliveryFee(Number(e.target.value))}
                className="w-full px-3.5 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white font-mono focus:outline-none focus:border-blue-500"
              />
              <span className="text-[10px] text-slate-500 mt-1 block">{isRtl ? 'تطبق على الطلبات التي لم تبلغ حد الشحن المجاني' : 'Applies to orders below free shipping threshold'}</span>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1">{isRtl ? 'موعد إغلاق شحن نفس اليوم' : 'Same-Day Dispatch Cutoff'}</label>
              <input
                type="time"
                value={dispatchCutoff}
                onChange={(e) => setDispatchCutoff(e.target.value)}
                className="w-full px-3.5 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white font-mono focus:outline-none focus:border-blue-500"
              />
              <span className="text-[10px] text-slate-500 mt-1 block">{isRtl ? 'أقصى وقت لطلب التوصيل بنفس اليوم داخل القاهرة والجيزة' : 'Cairo & Giza guaranteed dispatch cutoff'}</span>
            </div>
          </div>
        </div>

        {/* Section 4: Social Media & WhatsApp Channels */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-5">
          <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-slate-800">
            <div className="flex items-center gap-2">
              <Share2 className="w-5 h-5 text-sky-400" />
              <div>
                <h3 className="font-bold text-white text-base">
                  {isRtl ? 'قنوات التواصل الاجتماعي وخدمة العملاء' : 'Social Media & Customer Care Channels'}
                </h3>
                <p className="text-[11px] text-slate-400">
                  {isRtl
                    ? 'التحكم في ظهور أو إخفاء الروابط في الفوتر، وتحديث روابط الحسابات وواتساب المبيعات.'
                    : 'Toggle visibility and configure destinations for social channels and WhatsApp.'}
                </p>
              </div>
            </div>
            <span className="text-[11px] bg-blue-500/10 text-blue-400 border border-blue-500/20 px-2.5 py-1 rounded-full font-medium">
              {isRtl
                ? `${localSocialLinks.filter(s => s.enabled).length} قنوات مفعّلة حالياً`
                : `${localSocialLinks.filter(s => s.enabled).length} channels active`}
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {localSocialLinks.map((social) => {
              const getIcon = () => {
                switch (social.id) {
                  case 'whatsapp':
                    return (
                      <div className="w-8 h-8 rounded-full bg-[#25D366] flex items-center justify-center text-white flex-shrink-0 shadow-sm">
                        <WhatsAppIcon className="w-4 h-4" />
                      </div>
                    );
                  case 'facebook':
                    return (
                      <div className="w-8 h-8 rounded-full bg-[#1877F2] flex items-center justify-center text-white flex-shrink-0 shadow-sm">
                        <Facebook className="w-4 h-4 fill-white" />
                      </div>
                    );
                  case 'instagram':
                    return (
                      <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-[#f09433] via-[#dc2743] to-[#bc1888] flex items-center justify-center text-white flex-shrink-0 shadow-sm">
                        <Instagram className="w-4 h-4" />
                      </div>
                    );
                  case 'youtube':
                    return (
                      <div className="w-8 h-8 rounded-full bg-[#FF0000] flex items-center justify-center text-white flex-shrink-0 shadow-sm">
                        <Youtube className="w-4 h-4 fill-white" />
                      </div>
                    );
                  case 'linkedin':
                    return (
                      <div className="w-8 h-8 rounded-full bg-[#0A66C2] flex items-center justify-center text-white flex-shrink-0 shadow-sm">
                        <Linkedin className="w-4 h-4 fill-white" />
                      </div>
                    );
                  case 'tiktok':
                    return (
                      <div className="w-8 h-8 rounded-full bg-black border border-slate-700 flex items-center justify-center text-white flex-shrink-0 shadow-sm">
                        <TikTokIcon className="w-4 h-4" />
                      </div>
                    );
                  default:
                    return null;
                }
              };

              return (
                <div
                  key={social.id}
                  className={`p-4 rounded-xl border transition-all ${
                    social.enabled
                      ? 'bg-slate-950/80 border-slate-700/80'
                      : 'bg-slate-950/30 border-slate-800/40 opacity-70'
                  }`}
                >
                  <div className="flex items-center justify-between gap-3 mb-3">
                    <div className="flex items-center gap-2.5 min-w-0">
                      {getIcon()}
                      <div>
                        <h4 className="text-xs font-bold text-white tracking-wide">
                          {isRtl ? social.nameAr : social.name}
                        </h4>
                        <span className="text-[10px] text-slate-400">
                          {social.id === 'whatsapp'
                            ? (isRtl ? 'رابط محادثة فورية / رقم الهاتف' : 'Instant Chat Link / Phone')
                            : (isRtl ? 'رابط الحساب الرسمي' : 'Official Profile URL')}
                        </span>
                      </div>
                    </div>

                    {/* Active Toggle Switch */}
                    <div className="flex items-center gap-2">
                      <span
                        className={`text-[10px] font-bold ${
                          social.enabled ? 'text-emerald-400' : 'text-slate-500'
                        }`}
                      >
                        {social.enabled ? (isRtl ? 'مفعّل' : 'Active') : (isRtl ? 'معطّل' : 'Off')}
                      </span>
                      <button
                        type="button"
                        onClick={() => handleToggleSocial(social.id)}
                        className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                          social.enabled ? 'bg-emerald-500' : 'bg-slate-700'
                        }`}
                        aria-pressed={social.enabled}
                      >
                        <span
                          className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                            social.enabled
                              ? 'ltr:translate-x-5 rtl:-translate-x-5'
                              : 'translate-x-0'
                          }`}
                        />
                      </button>
                    </div>
                  </div>

                  {/* URL Input */}
                  <div className="flex items-center gap-1.5">
                    <input
                      type="text"
                      value={social.url}
                      onChange={(e) => handleSocialUrlChange(social.id, e.target.value)}
                      placeholder={
                        social.id === 'whatsapp'
                          ? 'https://wa.me/201060777895'
                          : `https://${social.id}.com/...`
                      }
                      className="flex-1 px-3 py-1.5 bg-slate-900 border border-slate-800 rounded-lg text-xs text-white font-mono focus:outline-none focus:border-blue-500"
                    />
                    {social.url && (
                      <a
                        href={social.url.startsWith('http') ? social.url : `https://${social.url}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        title={isRtl ? 'معاينة الرابط' : 'Preview URL'}
                        className="p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white rounded-lg transition-colors"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                      </a>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="flex justify-end pt-2">
          <button
            type="submit"
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold px-6 py-3 rounded-xl transition-all shadow-md shadow-blue-600/20"
          >
            <CheckCircle2 className="w-4 h-4" />
            <span>Save and Apply Settings</span>
          </button>
        </div>
      </form>
    </div>
  );
}
