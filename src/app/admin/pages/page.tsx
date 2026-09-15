'use client';

import React, { useState, useEffect } from 'react';
import { useStore } from '@/context/StoreContext';
import { SiteContent, DEFAULT_SITE_CONTENT } from '@/lib/content';
import {
  FileText,
  Save,
  RefreshCw,
  Info,
  ShieldCheck,
  RotateCcw,
  Truck,
  HelpCircle,
  Phone,
  Plus,
  Trash2,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';

export default function AdminPagesCMS() {
  const { isRtl, showToast } = useStore();
  const [content, setContent] = useState<SiteContent>(DEFAULT_SITE_CONTENT);
  const [activeTab, setActiveTab] = useState<'about' | 'warranty' | 'returns' | 'shipping' | 'faq' | 'contact'>('about');
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  // FAQ Modal / Add state
  const [newFaqQ, setNewFaqQ] = useState('');
  const [newFaqQAr, setNewFaqQAr] = useState('');
  const [newFaqA, setNewFaqA] = useState('');
  const [newFaqAAr, setNewFaqAAr] = useState('');

  const fetchContent = async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/content', { cache: 'no-store' });
      const data = await res.json();
      if (data.success && data.content) {
        setContent(data.content);
      }
    } catch (e) {
      console.warn('Error loading content:', e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchContent();
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      const res = await fetch('/api/content', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(content),
      });
      const data = await res.json();
      if (data.success) {
        showToast(isRtl ? 'تم حفظ وتحديث محتوى الصفحات بنجاح!' : 'Page content updated and published successfully!', 'success');
      } else {
        showToast(data.error || 'Failed to save', 'error');
      }
    } catch (err) {
      showToast(isRtl ? 'حدث خطأ في الاتصال بالخادم' : 'Server connection error', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  const handleAddFaq = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newFaqQ.trim() || !newFaqA.trim()) return;

    const newItem = {
      id: 'faq-' + Date.now(),
      category: 'General',
      question: newFaqQ.trim(),
      questionAr: newFaqQAr.trim() || newFaqQ.trim(),
      answer: newFaqA.trim(),
      answerAr: newFaqAAr.trim() || newFaqA.trim(),
    };

    setContent(prev => ({
      ...prev,
      faq: {
        ...prev.faq,
        items: [...prev.faq.items, newItem],
      },
    }));

    setNewFaqQ('');
    setNewFaqQAr('');
    setNewFaqA('');
    setNewFaqAAr('');
    showToast(isRtl ? 'تم إضافة السؤال للقائمة، اضغط حفظ التعديلات للتثبيت' : 'Question added, click Save Changes to publish', 'info');
  };

  const handleDeleteFaq = (id: string) => {
    setContent(prev => ({
      ...prev,
      faq: {
        ...prev.faq,
        items: prev.faq.items.filter(item => item.id !== id),
      },
    }));
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 pb-6 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-2xl font-black text-white tracking-tight">
              {isRtl ? 'إدارة صفحات ومحتوى المتجر (CMS)' : 'Pages & Content Manager CMS'}
            </h1>
            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-blue-500/20 text-blue-400 border border-blue-500/30">
              Live Editor
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            {isRtl
              ? 'تحكم كامل في نصوص وصفحات المتجر (من نحن، سياسة الضمان، الاسترجاع، الشحن، الأسئلة الشائعة، والعنوان).'
              : 'Edit and customize all storefront static pages, corporate information, policies, and FAQs.'}
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={fetchContent}
            className="p-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors border border-slate-700"
            title="Reload content"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
          </button>

          <button
            type="button"
            onClick={handleSave}
            disabled={isSaving}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-500 disabled:bg-blue-400 text-white font-bold text-[13px] px-5 py-2.5 rounded-xl transition-all shadow-md shadow-blue-600/20"
          >
            <Save className="w-4 h-4" />
            <span>{isSaving ? (isRtl ? 'جاري الحفظ...' : 'Saving...') : (isRtl ? 'حفظ ونشر التعديلات' : 'Save & Publish Changes')}</span>
          </button>
        </div>
      </div>

      {/* Tabs Switcher */}
      <div className="flex flex-wrap gap-2 p-1.5 bg-slate-900 border border-slate-800 rounded-2xl">
        <button
          type="button"
          onClick={() => setActiveTab('about')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all ${
            activeTab === 'about' ? 'bg-blue-600 text-white shadow' : 'text-slate-400 hover:text-white hover:bg-slate-800'
          }`}
        >
          <Info className="w-4 h-4" />
          <span>{isRtl ? 'من نحن (About Us)' : 'About Us'}</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('warranty')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all ${
            activeTab === 'warranty' ? 'bg-blue-600 text-white shadow' : 'text-slate-400 hover:text-white hover:bg-slate-800'
          }`}
        >
          <ShieldCheck className="w-4 h-4" />
          <span>{isRtl ? 'سياسة الضمان' : 'Warranty Policy'}</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('returns')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all ${
            activeTab === 'returns' ? 'bg-blue-600 text-white shadow' : 'text-slate-400 hover:text-white hover:bg-slate-800'
          }`}
        >
          <RotateCcw className="w-4 h-4" />
          <span>{isRtl ? 'الاسترجاع والاستبدال' : 'Returns & Exchange'}</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('shipping')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all ${
            activeTab === 'shipping' ? 'bg-blue-600 text-white shadow' : 'text-slate-400 hover:text-white hover:bg-slate-800'
          }`}
        >
          <Truck className="w-4 h-4" />
          <span>{isRtl ? 'الشحن والتوصيل' : 'Shipping & Delivery'}</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('faq')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all ${
            activeTab === 'faq' ? 'bg-blue-600 text-white shadow' : 'text-slate-400 hover:text-white hover:bg-slate-800'
          }`}
        >
          <HelpCircle className="w-4 h-4" />
          <span>{isRtl ? 'الأسئلة الشائعة (FAQ)' : 'FAQs'}</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('contact')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all ${
            activeTab === 'contact' ? 'bg-blue-600 text-white shadow' : 'text-slate-400 hover:text-white hover:bg-slate-800'
          }`}
        >
          <Phone className="w-4 h-4" />
          <span>{isRtl ? 'بيانات التواصل والمقر' : 'Contact & HQ'}</span>
        </button>
      </div>

      {/* Main CMS Form Content */}
      <form onSubmit={handleSave} className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-6">

        {/* 1. ABOUT US TAB */}
        {activeTab === 'about' && (
          <div className="space-y-6 animate-fadeIn">
            <div className="border-b border-slate-800 pb-3">
              <h3 className="text-base font-black text-white">{isRtl ? 'محتوى صفحة من نحن (About Hub Cloud)' : 'About Us Page Content'}</h3>
              <p className="text-xs text-slate-400 mt-0.5">{isRtl ? 'يمكنك تعديل الرؤية، النص التعريفي، وسنوات الخبرة.' : 'Customize hero banner, vision, and corporate presentation.'}</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              <div>
                <label className="block text-slate-300 font-bold mb-1.5">{isRtl ? 'العنوان الرئيسي (عربي)' : 'Hero Title (Arabic)'}</label>
                <input
                  type="text"
                  value={content.about.heroTitleAr}
                  onChange={(e) => setContent(prev => ({ ...prev, about: { ...prev.about, heroTitleAr: e.target.value } }))}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2.5 text-white focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-bold mb-1.5">{isRtl ? 'العنوان الرئيسي (إنجليزي)' : 'Hero Title (English)'}</label>
                <input
                  type="text"
                  value={content.about.heroTitle}
                  onChange={(e) => setContent(prev => ({ ...prev, about: { ...prev.about, heroTitle: e.target.value } }))}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2.5 text-white focus:outline-none focus:border-blue-500"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-slate-300 font-bold mb-1.5">{isRtl ? 'من نحن - النص التعريفي الكامل (عربي)' : 'Who Are We (Arabic)'}</label>
                <textarea
                  rows={4}
                  value={content.about.whoAreWeAr}
                  onChange={(e) => setContent(prev => ({ ...prev, about: { ...prev.about, whoAreWeAr: e.target.value } }))}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2.5 text-white focus:outline-none focus:border-blue-500 leading-relaxed"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-slate-300 font-bold mb-1.5">{isRtl ? 'من نحن - النص التعريفي الكامل (إنجليزي)' : 'Who Are We (English)'}</label>
                <textarea
                  rows={4}
                  value={content.about.whoAreWe}
                  onChange={(e) => setContent(prev => ({ ...prev, about: { ...prev.about, whoAreWe: e.target.value } }))}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2.5 text-white focus:outline-none focus:border-blue-500 leading-relaxed"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-slate-300 font-bold mb-1.5">{isRtl ? 'رؤيتنا - Our Vision (عربي)' : 'Our Vision (Arabic)'}</label>
                <textarea
                  rows={4}
                  value={content.about.ourVisionAr}
                  onChange={(e) => setContent(prev => ({ ...prev, about: { ...prev.about, ourVisionAr: e.target.value } }))}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2.5 text-white focus:outline-none focus:border-blue-500 leading-relaxed"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-slate-300 font-bold mb-1.5">{isRtl ? 'رؤيتنا - Our Vision (إنجليزي)' : 'Our Vision (English)'}</label>
                <textarea
                  rows={4}
                  value={content.about.ourVision}
                  onChange={(e) => setContent(prev => ({ ...prev, about: { ...prev.about, ourVision: e.target.value } }))}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2.5 text-white focus:outline-none focus:border-blue-500 leading-relaxed"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-bold mb-1.5">{isRtl ? 'سنوات الخبرة' : 'Years of Experience'}</label>
                <input
                  type="number"
                  value={content.about.experienceYears}
                  onChange={(e) => setContent(prev => ({ ...prev, about: { ...prev.about, experienceYears: Number(e.target.value) } }))}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2.5 text-white focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-bold mb-1.5">{isRtl ? 'المشاريع المنفذة' : 'Completed Projects'}</label>
                <input
                  type="text"
                  value={content.about.completedProjects}
                  onChange={(e) => setContent(prev => ({ ...prev, about: { ...prev.about, completedProjects: e.target.value } }))}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2.5 text-white focus:outline-none focus:border-blue-500"
                />
              </div>
            </div>
          </div>
        )}

        {/* 2. WARRANTY POLICY TAB */}
        {activeTab === 'warranty' && (
          <div className="space-y-6 animate-fadeIn">
            <div className="border-b border-slate-800 pb-3">
              <h3 className="text-base font-black text-white">{isRtl ? 'محتوى سياسة الضمان المعتمد' : 'Warranty Policy Content'}</h3>
              <p className="text-xs text-slate-400 mt-0.5">{isRtl ? 'تعديل بنود وفترات الضمان وشروط الصيانة والاستبدال.' : 'Edit warranty terms, duration, and service coverage.'}</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              <div>
                <label className="block text-slate-300 font-bold mb-1.5">{isRtl ? 'عنوان الصفحة (عربي)' : 'Title (Arabic)'}</label>
                <input
                  type="text"
                  value={content.warranty.titleAr}
                  onChange={(e) => setContent(prev => ({ ...prev, warranty: { ...prev.warranty, titleAr: e.target.value } }))}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2.5 text-white focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-bold mb-1.5">{isRtl ? 'العنوان الفرعي (عربي)' : 'Subtitle (Arabic)'}</label>
                <input
                  type="text"
                  value={content.warranty.subtitleAr}
                  onChange={(e) => setContent(prev => ({ ...prev, warranty: { ...prev.warranty, subtitleAr: e.target.value } }))}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2.5 text-white focus:outline-none focus:border-blue-500"
                />
              </div>

              {content.warranty.sections.map((sec, idx) => (
                <div key={idx} className="md:col-span-2 p-4 bg-slate-950/60 rounded-xl border border-slate-800 space-y-2.5">
                  <span className="text-[11px] font-bold text-blue-400 uppercase tracking-wider block">
                    {isRtl ? `البند ${idx + 1}` : `Section ${idx + 1}`}
                  </span>
                  <input
                    type="text"
                    value={sec.headingAr}
                    onChange={(e) => {
                      const updated = [...content.warranty.sections];
                      updated[idx].headingAr = e.target.value;
                      setContent(prev => ({ ...prev, warranty: { ...prev.warranty, sections: updated } }));
                    }}
                    placeholder="عنوان البند بالعربي"
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-white font-bold"
                  />
                  <textarea
                    rows={3}
                    value={sec.contentAr}
                    onChange={(e) => {
                      const updated = [...content.warranty.sections];
                      updated[idx].contentAr = e.target.value;
                      setContent(prev => ({ ...prev, warranty: { ...prev.warranty, sections: updated } }));
                    }}
                    placeholder="تفاصيل البند بالعربي"
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-slate-200"
                  />
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 3. RETURNS TAB */}
        {activeTab === 'returns' && (
          <div className="space-y-6 animate-fadeIn">
            <div className="border-b border-slate-800 pb-3">
              <h3 className="text-base font-black text-white">{isRtl ? 'محتوى سياسة الاسترجاع والاستبدال' : 'Returns & Exchange Policy Content'}</h3>
              <p className="text-xs text-slate-400 mt-0.5">{isRtl ? 'تعديل شروط إرجاع الأجهزة خلال 14 يوماً وفق القانون.' : 'Edit customer return rights and refund channels.'}</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              <div>
                <label className="block text-slate-300 font-bold mb-1.5">{isRtl ? 'عنوان الصفحة (عربي)' : 'Title (Arabic)'}</label>
                <input
                  type="text"
                  value={content.returns.titleAr}
                  onChange={(e) => setContent(prev => ({ ...prev, returns: { ...prev.returns, titleAr: e.target.value } }))}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2.5 text-white focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-bold mb-1.5">{isRtl ? 'العنوان الفرعي (عربي)' : 'Subtitle (Arabic)'}</label>
                <input
                  type="text"
                  value={content.returns.subtitleAr}
                  onChange={(e) => setContent(prev => ({ ...prev, returns: { ...prev.returns, subtitleAr: e.target.value } }))}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2.5 text-white focus:outline-none focus:border-blue-500"
                />
              </div>

              {content.returns.sections.map((sec, idx) => (
                <div key={idx} className="md:col-span-2 p-4 bg-slate-950/60 rounded-xl border border-slate-800 space-y-2.5">
                  <span className="text-[11px] font-bold text-emerald-400 uppercase tracking-wider block">
                    {isRtl ? `البند ${idx + 1}` : `Section ${idx + 1}`}
                  </span>
                  <input
                    type="text"
                    value={sec.headingAr}
                    onChange={(e) => {
                      const updated = [...content.returns.sections];
                      updated[idx].headingAr = e.target.value;
                      setContent(prev => ({ ...prev, returns: { ...prev.returns, sections: updated } }));
                    }}
                    placeholder="عنوان البند بالعربي"
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-white font-bold"
                  />
                  <textarea
                    rows={3}
                    value={sec.contentAr}
                    onChange={(e) => {
                      const updated = [...content.returns.sections];
                      updated[idx].contentAr = e.target.value;
                      setContent(prev => ({ ...prev, returns: { ...prev.returns, sections: updated } }));
                    }}
                    placeholder="تفاصيل البند بالعربي"
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-slate-200"
                  />
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 4. SHIPPING TAB */}
        {activeTab === 'shipping' && (
          <div className="space-y-6 animate-fadeIn">
            <div className="border-b border-slate-800 pb-3">
              <h3 className="text-base font-black text-white">{isRtl ? 'محتوى الشحن والتوصيل لجميع المحافظات' : 'Shipping & Delivery Policy'}</h3>
              <p className="text-xs text-slate-400 mt-0.5">{isRtl ? 'تحديد مواعيد التوصيل للقاهرة والمحافظات وتكاليف الشحن.' : 'Configure shipping duration and courier delivery fees.'}</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              <div>
                <label className="block text-slate-300 font-bold mb-1.5">{isRtl ? 'توصيل القاهرة والجيزة (عربي)' : 'Cairo & Giza Duration (Arabic)'}</label>
                <input
                  type="text"
                  value={content.shipping.cairoDeliveryAr}
                  onChange={(e) => setContent(prev => ({ ...prev, shipping: { ...prev.shipping, cairoDeliveryAr: e.target.value } }))}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2.5 text-white focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-bold mb-1.5">{isRtl ? 'توصيل باقي المحافظات (عربي)' : 'Governorates Duration (Arabic)'}</label>
                <input
                  type="text"
                  value={content.shipping.governoratesDeliveryAr}
                  onChange={(e) => setContent(prev => ({ ...prev, shipping: { ...prev.shipping, governoratesDeliveryAr: e.target.value } }))}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2.5 text-white focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-bold mb-1.5">{isRtl ? 'تكلفة الشحن القياسية (جنيه مصري)' : 'Standard Delivery Fee (EGP)'}</label>
                <input
                  type="number"
                  value={content.shipping.standardFee}
                  onChange={(e) => setContent(prev => ({ ...prev, shipping: { ...prev.shipping, standardFee: Number(e.target.value) } }))}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2.5 text-white focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-bold mb-1.5">{isRtl ? 'حد الشحن المجاني (جنيه مصري)' : 'Free Shipping Threshold (EGP)'}</label>
                <input
                  type="number"
                  value={content.shipping.freeShippingMin}
                  onChange={(e) => setContent(prev => ({ ...prev, shipping: { ...prev.shipping, freeShippingMin: Number(e.target.value) } }))}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2.5 text-white focus:outline-none focus:border-blue-500"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-slate-300 font-bold mb-1.5">{isRtl ? 'ملاحظات التغليف والتأمين (عربي)' : 'Packaging & Insurance Notes (Arabic)'}</label>
                <textarea
                  rows={3}
                  value={content.shipping.notesAr}
                  onChange={(e) => setContent(prev => ({ ...prev, shipping: { ...prev.shipping, notesAr: e.target.value } }))}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2.5 text-white focus:outline-none focus:border-blue-500"
                />
              </div>
            </div>
          </div>
        )}

        {/* 5. FAQ TAB */}
        {activeTab === 'faq' && (
          <div className="space-y-6 animate-fadeIn">
            <div className="border-b border-slate-800 pb-3 flex items-center justify-between">
              <div>
                <h3 className="text-base font-black text-white">{isRtl ? 'الأسئلة الشائعة (FAQ)' : 'Frequently Asked Questions'}</h3>
                <p className="text-xs text-slate-400 mt-0.5">{isRtl ? 'إضافة وتعديل وحذف الأسئلة التي تظهر للعملاء في صفحة الأسئلة.' : 'Manage FAQ accordion questions and answers.'}</p>
              </div>
              <span className="px-2.5 py-1 rounded-lg bg-blue-500/20 text-blue-400 font-bold text-xs">
                {content.faq.items.length} {isRtl ? 'سؤال' : 'Questions'}
              </span>
            </div>

            {/* List Existing FAQs */}
            <div className="space-y-3">
              {content.faq.items.map((item, idx) => (
                <div key={item.id} className="p-4 bg-slate-950/70 border border-slate-800 rounded-xl space-y-2 relative">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-bold text-blue-400 uppercase">
                      {isRtl ? `السؤال #${idx + 1}` : `Question #${idx + 1}`}
                    </span>
                    <button
                      type="button"
                      onClick={() => handleDeleteFaq(item.id)}
                      className="p-1 rounded-lg text-rose-400 hover:text-rose-300 hover:bg-rose-500/20"
                      title="Delete FAQ"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                  <input
                    type="text"
                    value={item.questionAr}
                    onChange={(e) => {
                      const updated = [...content.faq.items];
                      updated[idx].questionAr = e.target.value;
                      setContent(prev => ({ ...prev, faq: { ...prev.faq, items: updated } }));
                    }}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-white font-bold text-xs"
                    placeholder="نص السؤال بالعربي"
                  />
                  <textarea
                    rows={2}
                    value={item.answerAr}
                    onChange={(e) => {
                      const updated = [...content.faq.items];
                      updated[idx].answerAr = e.target.value;
                      setContent(prev => ({ ...prev, faq: { ...prev.faq, items: updated } }));
                    }}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-slate-300 text-xs"
                    placeholder="نص الإجابة بالعربي"
                  />
                </div>
              ))}
            </div>

            {/* Add New FAQ Form */}
            <div className="p-4 rounded-xl border border-dashed border-blue-500/40 bg-blue-500/5 space-y-3">
              <h4 className="font-bold text-white text-xs flex items-center gap-1.5">
                <Plus className="w-4 h-4 text-blue-400" />
                <span>{isRtl ? 'إضافة سؤال جديد لقائمة الأسئلة الشائعة' : 'Add New FAQ Question'}</span>
              </h4>

              <div className="space-y-2 text-xs">
                <input
                  type="text"
                  value={newFaqQAr}
                  onChange={(e) => setNewFaqQAr(e.target.value)}
                  placeholder={isRtl ? 'اكتب السؤال باللغة العربية (مثال: هل يمكن معاينة الأجهزة قبل الشراء؟)' : 'Question in Arabic'}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white"
                />
                <textarea
                  rows={2}
                  value={newFaqAAr}
                  onChange={(e) => setNewFaqAAr(e.target.value)}
                  placeholder={isRtl ? 'اكتب الإجابة المفصلة للسؤال...' : 'Answer in Arabic'}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white"
                />
              </div>

              <button
                type="button"
                onClick={handleAddFaq}
                className="bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs px-4 py-2 rounded-xl transition-all shadow"
              >
                {isRtl ? '+ إضافة السؤال للقائمة' : '+ Add Question to List'}
              </button>
            </div>
          </div>
        )}

        {/* 6. CONTACT TAB */}
        {activeTab === 'contact' && (
          <div className="space-y-6 animate-fadeIn">
            <div className="border-b border-slate-800 pb-3">
              <h3 className="text-base font-black text-white">{isRtl ? 'بيانات التواصل والمقر الرسمي' : 'Official Contact & Headquarters Info'}</h3>
              <p className="text-xs text-slate-400 mt-0.5">{isRtl ? 'تحديث العنوان الرسمي، الهاتف، والبريد المسجل في أسفل الموقع وصفحة اتصل بنا.' : 'Update physical HQ address, customer hotline, and official email.'}</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              <div className="md:col-span-2">
                <label className="block text-slate-300 font-bold mb-1.5">{isRtl ? 'عنوان المقر الرئيسي (عربي)' : 'HQ Address (Arabic)'}</label>
                <input
                  type="text"
                  value={content.contact.addressAr}
                  onChange={(e) => setContent(prev => ({ ...prev, contact: { ...prev.contact, addressAr: e.target.value } }))}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2.5 text-white focus:outline-none focus:border-blue-500"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-slate-300 font-bold mb-1.5">{isRtl ? 'عنوان المقر الرئيسي (إنجليزي)' : 'HQ Address (English)'}</label>
                <input
                  type="text"
                  value={content.contact.address}
                  onChange={(e) => setContent(prev => ({ ...prev, contact: { ...prev.contact, address: e.target.value } }))}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2.5 text-white focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-bold mb-1.5">{isRtl ? 'رقم الهاتف والمبيعات (الهاتف المعتمد)' : 'Phone / Hotline'}</label>
                <input
                  type="text"
                  value={content.contact.phone}
                  onChange={(e) => setContent(prev => ({ ...prev, contact: { ...prev.contact, phone: e.target.value } }))}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2.5 text-white focus:outline-none focus:border-blue-500 font-mono"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-bold mb-1.5">{isRtl ? 'البريد الإلكتروني الرسمي للمبيعات والدعم' : 'Official Sales Email'}</label>
                <input
                  type="email"
                  value={content.contact.email}
                  onChange={(e) => setContent(prev => ({ ...prev, contact: { ...prev.contact, email: e.target.value } }))}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2.5 text-white focus:outline-none focus:border-blue-500 font-mono"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-slate-300 font-bold mb-1.5">{isRtl ? 'ساعات العمل وأيام الاستقبال (عربي)' : 'Working Hours (Arabic)'}</label>
                <input
                  type="text"
                  value={content.contact.workingHoursAr}
                  onChange={(e) => setContent(prev => ({ ...prev, contact: { ...prev.contact, workingHoursAr: e.target.value } }))}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2.5 text-white focus:outline-none focus:border-blue-500"
                />
              </div>
            </div>
          </div>
        )}

        {/* Form Bottom Actions */}
        <div className="pt-4 border-t border-slate-800 flex items-center justify-between">
          <span className="text-xs text-slate-400">
            {isRtl ? 'أي تعديل يتم حفظه ينعكس فوراً على المتجر وصفحات الزوار.' : 'Changes saved here are instantly published to storefront pages.'}
          </span>

          <button
            type="submit"
            disabled={isSaving}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-500 disabled:bg-blue-400 text-white font-bold text-[13px] px-6 py-2.5 rounded-xl transition-all shadow-md shadow-blue-600/20"
          >
            <Save className="w-4 h-4" />
            <span>{isSaving ? (isRtl ? 'جاري الحفظ...' : 'Saving...') : (isRtl ? 'حفظ ونشر التعديلات' : 'Save & Publish Changes')}</span>
          </button>
        </div>

      </form>
    </div>
  );
}
