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
  ExternalLink,
  Wallet
} from 'lucide-react';
import { SocialLinkConfig } from '@/types';
import {
  WhatsAppIcon,
  FacebookIcon,
  InstagramIcon,
  YouTubeIcon,
  LinkedInIcon,
  TikTokIcon
} from '@/components/ui/SocialIcons';

export default function AdminSettingsPage() {
  const { showToast, isRtl, socialLinks, updateSocialLinks } = useStore();
  const [localSocialLinks, setLocalSocialLinks] = useState<SocialLinkConfig[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  const [storeName, setStoreName] = useState('HUB CLOUD IT Solutions');
  const [supportPhone, setSupportPhone] = useState('01019569891');
  const [supportEmail, setSupportEmail] = useState('s@hubcloud.info');
  const [showroomAddress, setShowroomAddress] = useState('181 شارع السودان - الدور التاسع - المهندسين، الجيزة');

  const [commercialRegistry, setCommercialRegistry] = useState('142083');
  const [officialWarrantyPartner, setOfficialWarrantyPartner] = useState('موزع وشريك معتمد لتجهيزات الشبكات ومحطات العمل');
  const [workingHours, setWorkingHours] = useState('السبت إلى الخميس: 9:00 ص - 9:00 م (الجمعة عطلة أسبوعية)');

  const [freeShippingThreshold, setFreeShippingThreshold] = useState(5000);
  const [standardDeliveryFee, setStandardDeliveryFee] = useState(75);
  const [dispatchCutoff, setDispatchCutoff] = useState('16:00');

  const [vodafoneCashWallet, setVodafoneCashWallet] = useState('01019569891');
  const [instapayIpa, setInstapayIpa] = useState('hubcloud@instapay');
  const [instapayPhone, setInstapayPhone] = useState('01019569891');

  useEffect(() => {
    async function loadSettings() {
      try {
        const res = await fetch('/api/admin/settings');
        const data = await res.json();
        if (data.success && data.settings) {
          const s = data.settings;
          if (s.storeName) setStoreName(s.storeName);
          if (s.supportPhone) setSupportPhone(s.supportPhone);
          if (s.supportEmail) setSupportEmail(s.supportEmail);
          if (s.showroomAddress) setShowroomAddress(s.showroomAddress);
          if (s.commercialRegistry) setCommercialRegistry(s.commercialRegistry);
          if (s.officialWarrantyPartner) setOfficialWarrantyPartner(s.officialWarrantyPartner);
          if (s.workingHours) setWorkingHours(s.workingHours);
          if (s.freeShippingThreshold !== undefined) setFreeShippingThreshold(Number(s.freeShippingThreshold));
          if (s.standardDeliveryFee !== undefined) setStandardDeliveryFee(Number(s.standardDeliveryFee));
          if (s.dispatchCutoff) setDispatchCutoff(s.dispatchCutoff);
          if (s.vodafoneCashWallet) setVodafoneCashWallet(s.vodafoneCashWallet);
          if (s.instapayIpa) setInstapayIpa(s.instapayIpa);
          if (s.instapayPhone) setInstapayPhone(s.instapayPhone);
          if (s.socialLinks && Array.isArray(s.socialLinks)) {
            setLocalSocialLinks(s.socialLinks);
          }
        }
      } catch (e) {
        console.error('Error fetching settings:', e);
      } finally {
        setIsLoading(false);
      }
    }
    loadSettings();
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

  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
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
      dispatchCutoff,
      vodafoneCashWallet,
      instapayIpa,
      instapayPhone,
      socialLinks: localSocialLinks,
    };

    try {
      const res = await fetch('/api/admin/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to save settings');
      }

      if (localSocialLinks.length > 0) {
        updateSocialLinks(localSocialLinks);
      }
      showToast(isRtl ? 'تم حفظ إعدادات المتجر في قاعدة البيانات بنجاح' : 'Store settings saved to database successfully', 'success');
    } catch (e: any) {
      showToast(e.message || 'Error saving settings', 'error');
    } finally {
      setIsSaving(false);
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

        {/* Section 4: Electronic Payment Wallets (Vodafone Cash & InstaPay) */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-slate-800">
            <Wallet className="w-5 h-5 text-purple-400" />
            <h3 className="font-bold text-white text-base">
              {isRtl ? 'بيانات محافظ الدفع الإلكتروني (فودافون كاش وإنستاباي)' : 'Electronic Payment Wallets (Vodafone Cash & InstaPay)'}
            </h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1">
                {isRtl ? 'رقم محفظة فودافون كاش' : 'Vodafone Cash Wallet Number'}
              </label>
              <input
                type="text"
                required
                value={vodafoneCashWallet}
                onChange={(e) => setVodafoneCashWallet(e.target.value)}
                className="w-full px-3.5 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white font-mono focus:outline-none focus:border-blue-500"
              />
              <span className="text-[10px] text-slate-500 mt-1 block">
                {isRtl ? 'يظهر للعميل في صفحة الدفع لتحويل المبلغ' : 'Displayed in checkout for wallet transfer'}
              </span>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1">
                {isRtl ? 'معرّف إنستاباي (InstaPay IPA)' : 'InstaPay IPA Address'}
              </label>
              <input
                type="text"
                required
                value={instapayIpa}
                onChange={(e) => setInstapayIpa(e.target.value)}
                className="w-full px-3.5 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white font-mono focus:outline-none focus:border-blue-500"
              />
              <span className="text-[10px] text-slate-500 mt-1 block">
                {isRtl ? 'مثال: username@instapay' : 'e.g. hubcloud@instapay'}
              </span>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1">
                {isRtl ? 'رقم الهاتف المسجل بإنستاباي' : 'InstaPay Registered Phone'}
              </label>
              <input
                type="text"
                required
                value={instapayPhone}
                onChange={(e) => setInstapayPhone(e.target.value)}
                className="w-full px-3.5 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white font-mono focus:outline-none focus:border-blue-500"
              />
              <span className="text-[10px] text-slate-500 mt-1 block">
                {isRtl ? 'البديل المباشر للتحويل برقم الهاتف' : 'Alternative phone transfer in InstaPay'}
              </span>
            </div>
          </div>
        </div>

        {/* Section 5: Social Media & WhatsApp Channels */}
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
                        <FacebookIcon className="w-4 h-4" />
                      </div>
                    );
                  case 'instagram':
                    return (
                      <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-[#f09433] via-[#dc2743] to-[#bc1888] flex items-center justify-center text-white flex-shrink-0 shadow-sm">
                        <InstagramIcon className="w-4 h-4" />
                      </div>
                    );
                  case 'youtube':
                    return (
                      <div className="w-8 h-8 rounded-full bg-[#FF0000] flex items-center justify-center text-white flex-shrink-0 shadow-sm">
                        <YouTubeIcon className="w-4 h-4" />
                      </div>
                    );
                  case 'linkedin':
                    return (
                      <div className="w-8 h-8 rounded-full bg-[#0A66C2] flex items-center justify-center text-white flex-shrink-0 shadow-sm">
                        <LinkedInIcon className="w-4 h-4" />
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
