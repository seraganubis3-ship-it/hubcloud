'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useStore } from '@/context/StoreContext';
import {
  Globe,
  Plus,
  Edit2,
  Trash2,
  ExternalLink,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Save,
  X,
  Eye,
  EyeOff,
  Layers
} from 'lucide-react';

interface BannerItem {
  id: string;
  title: string;
  titleAr: string;
  primaryHref: string;
  image: string;
  isActive: boolean;
  displayOrder: number;
  createdAt?: string;
  updatedAt?: string;
}

const PRESET_IMAGES = [
  { label: 'لابتوبات ومحطات عمل', url: '/images/banners/hero_laptops.jpg' },
  { label: 'كمبيوتر وشاشات', url: '/images/banners/hero_desktops.jpg' },
  { label: 'سويتشات وشبكات', url: '/images/banners/hero_network.jpg' },
  { label: 'أنظمة أمنية وسحابية', url: '/images/banners/hubcloud-solutions-banner.png' },
];

export default function AdminBannersPage() {
  const { isRtl, showToast } = useStore();
  const [banners, setBanners] = useState<BannerItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form State
  const [currentId, setCurrentId] = useState<string | null>(null);
  const [title, setTitle] = useState('');
  const [titleAr, setTitleAr] = useState('');
  const [primaryHref, setPrimaryHref] = useState('/products');
  const [image, setImage] = useState('/images/banners/hero_laptops.jpg');
  const [isActive, setIsActive] = useState(true);
  const [displayOrder, setDisplayOrder] = useState(1);

  // Fetch Banners
  const fetchBanners = async () => {
    try {
      setIsLoading(true);
      const res = await fetch('/api/admin/banners');
      const data = await res.json();
      if (data.success && Array.isArray(data.banners)) {
        setBanners(data.banners);
      }
    } catch (e) {
      showToast(isRtl ? 'فشل تحميل البانرات' : 'Failed to load banners', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchBanners();
  }, []);

  const openAddModal = () => {
    setIsEditing(false);
    setCurrentId(null);
    setTitle('');
    setTitleAr('');
    setPrimaryHref('/products');
    setImage('/images/banners/hero_laptops.jpg');
    setIsActive(true);
    setDisplayOrder(banners.length + 1);
    setIsModalOpen(true);
  };

  const openEditModal = (b: BannerItem) => {
    setIsEditing(true);
    setCurrentId(b.id);
    setTitle(b.title);
    setTitleAr(b.titleAr);
    setPrimaryHref(b.primaryHref);
    setImage(b.image);
    setIsActive(b.isActive);
    setDisplayOrder(b.displayOrder);
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !titleAr || !image) {
      showToast(isRtl ? 'يرجى ملء كافة الحقول المطلوبة' : 'Please fill all required fields', 'error');
      return;
    }

    setIsSubmitting(true);
    try {
      const url = '/api/admin/banners';
      const method = isEditing ? 'PUT' : 'POST';
      const body = isEditing
        ? { id: currentId, title, titleAr, primaryHref, image, isActive, displayOrder }
        : { title, titleAr, primaryHref, image, isActive, displayOrder };

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to save banner');
      }

      showToast(
        isRtl
          ? isEditing ? 'تم تحديث البانر بنجاح' : 'تمت إضافة البانر بنجاح'
          : isEditing ? 'Banner updated successfully' : 'Banner created successfully',
        'success'
      );
      setIsModalOpen(false);
      fetchBanners();
    } catch (err: any) {
      showToast(err.message || 'Error saving banner', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleToggleActive = async (b: BannerItem) => {
    try {
      const res = await fetch('/api/admin/banners', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: b.id, isActive: !b.isActive }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.error);

      setBanners((prev) =>
        prev.map((item) => (item.id === b.id ? { ...item, isActive: !item.isActive } : item))
      );
      showToast(
        isRtl
          ? !b.isActive ? 'تم تفعيل البانر' : 'تم إخفاء البانر'
          : !b.isActive ? 'Banner activated' : 'Banner deactivated',
        'info'
      );
    } catch (err: any) {
      showToast(err.message || 'Error updating status', 'error');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm(isRtl ? 'هل أنت متأكد من حذف هذا البانر نهائياً؟' : 'Are you sure you want to permanently delete this banner?')) {
      return;
    }

    try {
      const res = await fetch(`/api/admin/banners?id=${id}`, {
        method: 'DELETE',
      });
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.error);

      setBanners((prev) => prev.filter((item) => item.id !== id));
      showToast(isRtl ? 'تم حذف البانر بنجاح' : 'Banner deleted successfully', 'success');
    } catch (err: any) {
      showToast(err.message || 'Error deleting banner', 'error');
    }
  };

  return (
    <div className="space-y-6 max-w-7xl">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 pb-6 border-b border-slate-800">
        <div>
          <h1 className="text-2xl font-black text-white tracking-tight flex items-center gap-2.5">
            <Globe className="w-6 h-6 text-blue-400" />
            <span>{isRtl ? 'بانرات الصفحة الرئيسية (Hero Banners)' : 'Homepage Hero Banners'}</span>
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            {isRtl
              ? 'إدارة السلايدر الرئيسي للمتجر، رفع وتعديل وترتيب العروض الترويجية وربطها بالأقسام مباشرة.'
              : 'Manage main homepage carousel slider, upload promotional banners, set priority order and targets.'}
          </p>
        </div>

        <button
          onClick={openAddModal}
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white text-[13px] font-bold px-4 py-2.5 rounded-xl transition-all shadow-md shadow-blue-600/20 active:scale-95"
        >
          <Plus className="w-4 h-4" />
          <span>{isRtl ? 'إضافة بانر جديد' : 'Add New Banner'}</span>
        </button>
      </div>

      {/* Loading State */}
      {isLoading ? (
        <div className="py-16 text-center text-slate-400 text-sm space-y-2">
          <div className="inline-block w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
          <p>{isRtl ? 'جاري تحميل البانرات...' : 'Loading banners...'}</p>
        </div>
      ) : banners.length === 0 ? (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-12 text-center space-y-3">
          <Layers className="w-12 h-12 text-slate-600 mx-auto" />
          <h3 className="text-white font-bold text-base">{isRtl ? 'لا توجد بانرات مسجلة' : 'No banners found'}</h3>
          <p className="text-xs text-slate-400">{isRtl ? 'اضغط على زر إضافة بانر جديد للبدء' : 'Click Add New Banner to create one'}</p>
        </div>
      ) : (
        /* Banners Grid */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {banners.map((b) => (
            <div
              key={b.id}
              className={`group relative bg-slate-900 border rounded-2xl overflow-hidden shadow-lg transition-all flex flex-col justify-between ${
                b.isActive ? 'border-slate-800 hover:border-slate-700' : 'border-slate-800/40 opacity-60'
              }`}
            >
              {/* Image Preview */}
              <div className="relative w-full aspect-[16/8] bg-slate-950 overflow-hidden border-b border-slate-800">
                <Image
                  src={b.image}
                  alt={b.title}
                  fill
                  className="object-cover object-center group-hover:scale-105 transition-transform duration-500"
                />
                {/* Active Badge */}
                <div className="absolute top-3 start-3">
                  <span
                    className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold backdrop-blur-md border ${
                      b.isActive
                        ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
                        : 'bg-rose-500/20 text-rose-300 border-rose-500/30'
                    }`}
                  >
                    {b.isActive ? (
                      <>
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                        <span>{isRtl ? 'مفعّل في المتجر' : 'Active'}</span>
                      </>
                    ) : (
                      <>
                        <span className="w-1.5 h-1.5 rounded-full bg-rose-400" />
                        <span>{isRtl ? 'مخفي' : 'Inactive'}</span>
                      </>
                    )}
                  </span>
                </div>

                {/* Display Order Badge */}
                <div className="absolute top-3 end-3">
                  <span className="bg-slate-900/80 backdrop-blur-md text-slate-300 border border-slate-700 px-2.5 py-1 rounded-lg text-[11px] font-mono font-bold">
                    #{b.displayOrder}
                  </span>
                </div>
              </div>

              {/* Card Body */}
              <div className="p-5 space-y-3 flex-1 flex flex-col justify-between">
                <div className="space-y-1.5">
                  <h3 className="text-white font-bold text-sm line-clamp-1 leading-snug">
                    {isRtl ? b.titleAr : b.title}
                  </h3>
                  <p className="text-slate-400 text-xs line-clamp-1">
                    {isRtl ? b.title : b.titleAr}
                  </p>
                  <div className="pt-1">
                    <Link
                      href={b.primaryHref}
                      target="_blank"
                      className="inline-flex items-center gap-1.5 text-[11px] font-mono text-blue-400 hover:text-blue-300 truncate max-w-full"
                    >
                      <ExternalLink className="w-3 h-3 shrink-0" />
                      <span className="truncate">{b.primaryHref}</span>
                    </Link>
                  </div>
                </div>

                {/* Action Bar */}
                <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between gap-2">
                  <button
                    onClick={() => handleToggleActive(b)}
                    className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                      b.isActive
                        ? 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                        : 'bg-emerald-950/50 text-emerald-400 border border-emerald-800/40 hover:bg-emerald-900/50'
                    }`}
                  >
                    {b.isActive ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                    <span>{b.isActive ? (isRtl ? 'إخفاء' : 'Deactivate') : (isRtl ? 'تفعيل' : 'Activate')}</span>
                  </button>

                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => openEditModal(b)}
                      className="p-2 rounded-lg bg-blue-500/10 text-blue-400 hover:bg-blue-500/20 transition-colors"
                      title={isRtl ? 'تعديل' : 'Edit'}
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => handleDelete(b.id)}
                      className="p-2 rounded-lg bg-rose-500/10 text-rose-400 hover:bg-rose-500/20 transition-colors"
                      title={isRtl ? 'حذف' : 'Delete'}
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add / Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xs">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800">
              <h3 className="font-bold text-white text-base flex items-center gap-2">
                <Globe className="w-5 h-5 text-blue-400" />
                <span>{isEditing ? (isRtl ? 'تعديل البانر' : 'Edit Banner') : (isRtl ? 'إضافة بانر جديد' : 'New Hero Banner')}</span>
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">
                  {isRtl ? 'العنوان الرئيسي (بالعربية)' : 'Title (Arabic)'} *
                </label>
                <input
                  type="text"
                  required
                  value={titleAr}
                  onChange={(e) => setTitleAr(e.target.value)}
                  placeholder={isRtl ? 'مثال: لابتوبات ومحطات عمل احترافية فائقة الأداء' : 'e.g. Arabic title'}
                  className="w-full px-3.5 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">
                  {isRtl ? 'العنوان بالإنجليزية' : 'Title (English)'} *
                </label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. High-End Laptops and Workstations"
                  className="w-full px-3.5 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">
                  {isRtl ? 'رابط الصورة (Image URL)' : 'Banner Image Path / URL'} *
                </label>
                <input
                  type="text"
                  required
                  value={image}
                  onChange={(e) => setImage(e.target.value)}
                  placeholder="/images/banners/hero_laptops.jpg"
                  className="w-full px-3.5 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white font-mono focus:outline-none focus:border-blue-500"
                />

                {/* Quick Presets */}
                <div className="flex flex-wrap gap-1.5 pt-2">
                  <span className="text-[10px] text-slate-500 self-center">{isRtl ? 'نماذج جاهزة:' : 'Presets:'}</span>
                  {PRESET_IMAGES.map((p, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setImage(p.url)}
                      className="text-[10px] px-2 py-0.5 rounded-md bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
                    >
                      {p.label}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">
                  {isRtl ? 'الرابط المستهدف عند النقر (Destination URL)' : 'Target Link'} *
                </label>
                <input
                  type="text"
                  required
                  value={primaryHref}
                  onChange={(e) => setPrimaryHref(e.target.value)}
                  placeholder="/category/laptops"
                  className="w-full px-3.5 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white font-mono focus:outline-none focus:border-blue-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">
                    {isRtl ? 'ترتيب الظهور' : 'Display Order'}
                  </label>
                  <input
                    type="number"
                    required
                    min="1"
                    value={displayOrder}
                    onChange={(e) => setDisplayOrder(Number(e.target.value))}
                    className="w-full px-3.5 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white font-mono focus:outline-none focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">
                    {isRtl ? 'حالة البانر' : 'Status'}
                  </label>
                  <button
                    type="button"
                    onClick={() => setIsActive(!isActive)}
                    className={`w-full px-3.5 py-2 rounded-xl text-xs font-bold border transition-all flex items-center justify-center gap-2 ${
                      isActive
                        ? 'bg-emerald-950/40 text-emerald-300 border-emerald-800/60'
                        : 'bg-rose-950/40 text-rose-300 border-rose-800/60'
                    }`}
                  >
                    {isActive ? <CheckCircle2 className="w-4 h-4 text-emerald-400" /> : <XCircle className="w-4 h-4 text-rose-400" />}
                    <span>{isActive ? (isRtl ? 'مفعّل في المتجر' : 'Active') : (isRtl ? 'معطّل' : 'Inactive')}</span>
                  </button>
                </div>
              </div>

              {/* Preview */}
              {image && (
                <div className="space-y-1 pt-1">
                  <span className="text-[11px] text-slate-400 block">{isRtl ? 'معاينة البانر:' : 'Banner Preview:'}</span>
                  <div className="relative w-full aspect-[16/7] rounded-xl overflow-hidden bg-slate-950 border border-slate-800">
                    <Image src={image} alt="Preview" fill className="object-cover" />
                  </div>
                </div>
              )}

              <div className="pt-4 border-t border-slate-800 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold transition-colors"
                >
                  {isRtl ? 'إلغاء' : 'Cancel'}
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex items-center gap-2 px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold transition-all shadow-md shadow-blue-600/20 disabled:opacity-50"
                >
                  <Save className="w-3.5 h-3.5" />
                  <span>{isSubmitting ? (isRtl ? 'جاري الحفظ...' : 'Saving...') : (isRtl ? 'حفظ البانر' : 'Save Banner')}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
