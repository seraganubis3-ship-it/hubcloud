'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useStore } from '@/context/StoreContext';
import { CatalogNavTabs } from '@/components/admin/CatalogNavTabs';
import {
  Layers,
  Plus,
  Edit2,
  Trash2,
  ExternalLink,
  RefreshCw,
  Search,
  CheckCircle2,
  AlertTriangle,
  X,
  Boxes,
  ShieldCheck,
  FolderTree,
  SlidersHorizontal,
  Check,
  Eye,
  Settings2
} from 'lucide-react';

interface CategoryItem {
  id: string;
  name: string;
  nameAr: string;
  slug: string;
  itemCount: number;
  image: string;
  banner?: string | null;
  iconName?: string | null;
  description?: string | null;
  descriptionAr?: string | null;
  displayOrder?: number;
  isActive?: boolean;
  isFeatured?: boolean;
  seoTitle?: string | null;
  seoDescription?: string | null;
  seoKeywords?: string | null;
}

interface AssignedAttribute {
  id: string;
  categoryId: string;
  attributeId: string;
  isRequired: boolean;
  displayOrder: number;
  isFilterable: boolean;
  isSearchable: boolean;
  isComparable: boolean;
  isVariantOption: boolean;
  attribute: {
    id: string;
    name: string;
    nameAr: string;
    slug: string;
    type: string;
    unit: string | null;
    group: {
      id: string;
      name: string;
      nameAr: string;
    };
  };
}

export default function AdminCategoriesPage() {
  const { isRtl, showToast } = useStore();

  const [categories, setCategories] = useState<CategoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  // Category Modals
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<CategoryItem | null>(null);

  // Category Attributes Drawer State
  const [activeCategoryForAttrs, setActiveCategoryForAttrs] = useState<CategoryItem | null>(null);
  const [assignedAttrs, setAssignedAttrs] = useState<AssignedAttribute[]>([]);
  const [availableAttrs, setAvailableAttrs] = useState<any[]>([]);
  const [isAttrsLoading, setIsAttrsLoading] = useState(false);

  // Category Form State
  const [formData, setFormData] = useState({
    name: '',
    nameAr: '',
    slug: '',
    image: '/images/category_laptops.jpg',
    banner: '',
    iconName: 'Laptop',
    description: '',
    descriptionAr: '',
    displayOrder: 0,
    isActive: true,
    isFeatured: false,
    seoTitle: '',
    seoDescription: '',
    seoKeywords: '',
  });

  const fetchCategories = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/categories');
      const data = await res.json();
      if (data.success && data.categories) {
        setCategories(data.categories);
      }
    } catch (err) {
      console.warn('Failed to fetch categories:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const openCreateModal = () => {
    setFormData({
      name: '',
      nameAr: '',
      slug: '',
      image: '/images/category_laptops.jpg',
      banner: '',
      iconName: 'Laptop',
      description: '',
      descriptionAr: '',
      displayOrder: categories.length + 1,
      isActive: true,
      isFeatured: false,
      seoTitle: '',
      seoDescription: '',
      seoKeywords: '',
    });
    setIsAddModalOpen(true);
  };

  const openEditModal = (cat: CategoryItem) => {
    setEditingCategory(cat);
    setFormData({
      name: cat.name,
      nameAr: cat.nameAr || '',
      slug: cat.slug,
      image: cat.image || '/images/category_laptops.jpg',
      banner: cat.banner || '',
      iconName: cat.iconName || 'Laptop',
      description: cat.description || '',
      descriptionAr: cat.descriptionAr || '',
      displayOrder: cat.displayOrder ?? 0,
      isActive: cat.isActive ?? true,
      isFeatured: cat.isFeatured ?? false,
      seoTitle: cat.seoTitle || '',
      seoDescription: cat.seoDescription || '',
      seoKeywords: cat.seoKeywords || '',
    });
  };

  const handleSaveCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.slug) return;

    try {
      const url = editingCategory ? `/api/categories/${editingCategory.id}` : '/api/categories';
      const method = editingCategory ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      const data = await res.json();

      if (data.success) {
        showToast(
          editingCategory ? 'Category updated successfully' : 'Category created successfully',
          'success'
        );
        setIsAddModalOpen(false);
        setEditingCategory(null);
        fetchCategories();
      } else {
        showToast(data.error || 'Failed to save category', 'error');
      }
    } catch (err: any) {
      showToast(err.message, 'error');
    }
  };

  const handleDeleteCategory = async (id: string, name: string) => {
    if (!confirm(`Are you sure you want to delete category "${name}"?`)) return;

    try {
      const res = await fetch(`/api/categories/${id}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.success) {
        showToast('Category deleted successfully', 'info');
        fetchCategories();
      } else {
        showToast(data.error || 'Could not delete category', 'error');
      }
    } catch (err: any) {
      showToast(err.message, 'error');
    }
  };

  // Attributes Management Drawer Handlers
  const openAttributesDrawer = async (cat: CategoryItem) => {
    setActiveCategoryForAttrs(cat);
    setIsAttrsLoading(true);
    try {
      const res = await fetch(`/api/categories/${cat.id}/attributes`);
      const data = await res.json();
      if (data.success) {
        setAssignedAttrs(data.assignedAttributes || []);
        setAvailableAttrs(data.availableAttributes || []);
      }
    } catch (err) {
      console.warn('Could not load category attributes:', err);
    } finally {
      setIsAttrsLoading(false);
    }
  };

  const handleAssignAttribute = async (attributeId: string) => {
    if (!activeCategoryForAttrs) return;
    try {
      const res = await fetch(`/api/categories/${activeCategoryForAttrs.id}/attributes`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          assignments: [
            {
              attributeId,
              isRequired: false,
              isFilterable: true,
              isVariantOption: false,
              displayOrder: assignedAttrs.length + 1,
            },
          ],
        }),
      });
      const data = await res.json();
      if (data.success) {
        showToast('Attribute assigned to category', 'success');
        openAttributesDrawer(activeCategoryForAttrs);
      } else {
        showToast(data.error || 'Failed to assign attribute', 'error');
      }
    } catch (err: any) {
      showToast(err.message, 'error');
    }
  };

  const handleToggleAttrOption = async (
    attrId: string,
    key: 'isRequired' | 'isFilterable' | 'isVariantOption',
    val: boolean
  ) => {
    if (!activeCategoryForAttrs) return;
    const existing = assignedAttrs.find((a) => a.attributeId === attrId);
    if (!existing) return;

    try {
      const res = await fetch(`/api/categories/${activeCategoryForAttrs.id}/attributes`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          assignments: [
            {
              attributeId: attrId,
              isRequired: key === 'isRequired' ? val : existing.isRequired,
              isFilterable: key === 'isFilterable' ? val : existing.isFilterable,
              isVariantOption: key === 'isVariantOption' ? val : existing.isVariantOption,
              displayOrder: existing.displayOrder,
            },
          ],
        }),
      });
      const data = await res.json();
      if (data.success) {
        setAssignedAttrs((prev) =>
          prev.map((a) => (a.attributeId === attrId ? { ...a, [key]: val } : a))
        );
      }
    } catch (err: any) {
      showToast(err.message, 'error');
    }
  };

  const handleUnassignAttribute = async (attributeId: string) => {
    if (!activeCategoryForAttrs) return;
    try {
      const res = await fetch(
        `/api/categories/${activeCategoryForAttrs.id}/attributes?attributeId=${attributeId}`,
        { method: 'DELETE' }
      );
      const data = await res.json();
      if (data.success) {
        showToast('Attribute unassigned', 'info');
        openAttributesDrawer(activeCategoryForAttrs);
      } else {
        showToast(data.error || 'Failed to unassign', 'error');
      }
    } catch (err: any) {
      showToast(err.message, 'error');
    }
  };

  const filteredCategories = categories.filter(
    (c) =>
      c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.nameAr.includes(searchQuery) ||
      c.slug.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Header Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 pb-6 border-b border-slate-800">
        <div>
          <h1 className="text-2xl font-black text-white tracking-tight flex items-center gap-2.5">
            <Layers className="w-6 h-6 text-blue-400" />
            <span>{isRtl ? 'إدارة الأقسام والتصنيفات' : 'Single-Level Category Architecture'}</span>
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            {isRtl
              ? 'إدارة أقسام وتصنيفات المتجر مع ربط المواصفات الفنية المتقدمة وإعدادات محركات البحث SEO.'
              : 'Production-ready category management with dynamic specification bindings and SEO controls.'}
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={fetchCategories}
            className="p-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors"
            title={isRtl ? 'تحديث' : 'Refresh'}
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>

          <button
            onClick={openCreateModal}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold transition-all shadow-md active:scale-95"
          >
            <Plus className="w-4 h-4" />
            <span>{isRtl ? '+ إضافة قسم جديد' : '+ Add New Category'}</span>
          </button>
        </div>
      </div>

      {/* Catalog Hub Sub-Navigation */}
      <CatalogNavTabs />

      {/* Search Filter */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="relative flex-1 min-w-[260px] max-w-md">
          <Search className={`w-4 h-4 absolute ${isRtl ? 'right-3' : 'left-3'} top-1/2 -translate-y-1/2 text-slate-500`} />
          <input
            type="text"
            placeholder={isRtl ? 'البحث عن قسم بالاسم أو الرابط...' : 'Search categories by name or slug...'}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className={`w-full bg-slate-900 border border-slate-800 rounded-xl ${isRtl ? 'pr-9 pl-4 text-right' : 'pl-9 pr-4 text-left'} py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 transition-colors`}
          />
        </div>
        <div className="text-xs text-slate-400 font-medium">
          {isRtl ? 'إجمالي الأقسام:' : 'Total Categories:'} <span className="font-bold text-white">{categories.length}</span>
        </div>
      </div>

      {/* Categories Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredCategories.map((cat) => (
          <div
            key={cat.id}
            className="bg-slate-900 border border-slate-800 hover:border-slate-700 rounded-2xl p-4 sm:p-5 flex flex-col justify-between space-y-4 shadow-lg transition-all group"
          >
            <div className="flex items-start gap-4">
              <div className="w-16 h-16 sm:w-20 sm:h-20 bg-white rounded-xl p-2 relative flex-shrink-0 flex items-center justify-center border border-slate-800">
                <Image
                  src={cat.image || '/images/category_laptops.jpg'}
                  alt={cat.name}
                  fill
                  className="object-contain p-1 mix-blend-multiply"
                />
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-1">
                  <span className="px-2 py-0.5 rounded-md text-[10px] font-mono font-bold bg-blue-500/10 text-blue-400 border border-blue-500/20">
                    /{cat.slug}
                  </span>
                  <span className="text-[11px] font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-md flex items-center gap-1 border border-emerald-500/20">
                    <Boxes className="w-3 h-3" />
                    <span>{cat.itemCount} {isRtl ? 'منتج' : 'items'}</span>
                  </span>
                </div>

                <h3 className="font-bold text-white text-sm mt-2 truncate">
                  {isRtl && cat.nameAr ? cat.nameAr : cat.name}
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  {isRtl ? cat.name : cat.nameAr}
                </p>

                {cat.description && (
                  <p className="text-[11px] text-slate-500 mt-1 line-clamp-2">
                    {isRtl && cat.descriptionAr ? cat.descriptionAr : cat.description}
                  </p>
                )}
              </div>
            </div>

            {/* Actions Bar */}
            <div className="flex items-center justify-between pt-3 border-t border-slate-800/80 text-xs">
              <div className="flex items-center gap-2">
                <Link
                  href={`/category/${cat.slug}`}
                  target="_blank"
                  className="flex items-center gap-1 text-slate-400 hover:text-blue-400 font-bold transition-colors text-[11px]"
                >
                  <span>{isRtl ? 'معاينة' : 'Preview'}</span>
                  <ExternalLink className="w-3 h-3" />
                </Link>

                <button
                  onClick={() => openAttributesDrawer(cat)}
                  className="flex items-center gap-1 px-2 py-1 rounded-lg bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-300 font-bold text-[11px] border border-indigo-500/20 transition-colors"
                  title={isRtl ? 'تخصيص المواصفات الفنية لهذا القسم' : 'Configure Dynamic Specs for this Category'}
                >
                  <SlidersHorizontal className="w-3 h-3" />
                  <span>{isRtl ? 'المواصفات' : 'Specs'}</span>
                </button>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => openEditModal(cat)}
                  className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors"
                  title={isRtl ? 'تعديل القسم' : 'Edit Category'}
                >
                  <Edit2 className="w-3.5 h-3.5" />
                </button>

                <button
                  onClick={() => handleDeleteCategory(cat.id, cat.name)}
                  className="p-1.5 rounded-lg bg-slate-800 hover:bg-red-900/50 text-slate-400 hover:text-red-400 transition-colors"
                  title={isRtl ? 'حذف القسم' : 'Delete Category'}
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Category Create / Edit Modal */}
      {(isAddModalOpen || editingCategory) && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-xs flex items-center justify-center z-50 p-2 sm:p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-xl p-4 sm:p-6 space-y-4 sm:space-y-5 shadow-2xl animate-in fade-in zoom-in-95 duration-150 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-4 border-b border-slate-800">
              <h2 className="text-base font-black text-white flex items-center gap-2">
                <FolderTree className="w-5 h-5 text-blue-400" />
                <span>{editingCategory ? 'Edit Category' : 'Create Single-Level Category'}</span>
              </h2>
              <button
                onClick={() => {
                  setIsAddModalOpen(false);
                  setEditingCategory(null);
                }}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveCategory} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-300 font-bold mb-1">Name (English) *</label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => {
                      const val = e.target.value;
                      setFormData((prev) => ({
                        ...prev,
                        name: val,
                        slug: prev.slug || val.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
                      }));
                    }}
                    placeholder="e.g. Workstations"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-bold mb-1">Name (Arabic) *</label>
                  <input
                    type="text"
                    required
                    dir="rtl"
                    value={formData.nameAr}
                    onChange={(e) => setFormData({ ...formData, nameAr: e.target.value })}
                    placeholder="مثال: محطات العمل"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-300 font-bold mb-1">Slug URL *</label>
                  <input
                    type="text"
                    required
                    value={formData.slug}
                    onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                    placeholder="workstations"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white font-mono focus:outline-none focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-bold mb-1">Display Order</label>
                  <input
                    type="number"
                    value={formData.displayOrder}
                    onChange={(e) =>
                      setFormData({ ...formData, displayOrder: Number(e.target.value) })
                    }
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-300 font-bold mb-1">Image Thumbnail Path</label>
                <input
                  type="text"
                  value={formData.image}
                  onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                  placeholder="/images/category_laptops.jpg"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-blue-500"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-300 font-bold mb-1">Description (English)</label>
                  <textarea
                    rows={2}
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-bold mb-1">Description (Arabic)</label>
                  <textarea
                    rows={2}
                    dir="rtl"
                    value={formData.descriptionAr}
                    onChange={(e) => setFormData({ ...formData, descriptionAr: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              {/* Status Toggles */}
              <div className="flex items-center gap-6 p-3 bg-slate-950 rounded-xl border border-slate-800">
                <label className="flex items-center gap-2 text-slate-300 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.isActive}
                    onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                    className="rounded text-blue-600 focus:ring-blue-500 w-4 h-4 border-slate-800"
                  />
                  <span className="font-bold">Active in Storefront</span>
                </label>
                <label className="flex items-center gap-2 text-slate-300 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.isFeatured}
                    onChange={(e) => setFormData({ ...formData, isFeatured: e.target.checked })}
                    className="rounded text-blue-600 focus:ring-blue-500 w-4 h-4 border-slate-800"
                  />
                  <span className="font-bold">Featured on Homepage</span>
                </label>
              </div>

              {/* SEO Meta Fields */}
              <div className="space-y-2 pt-2 border-t border-slate-800">
                <span className="text-[11px] uppercase tracking-wider font-bold text-slate-400">
                  SEO Search Engine Metadata
                </span>
                <div>
                  <input
                    type="text"
                    value={formData.seoTitle}
                    onChange={(e) => setFormData({ ...formData, seoTitle: e.target.value })}
                    placeholder="SEO Title (e.g. Enterprise Business Laptops & Servers in Egypt)"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-blue-500"
                  />
                </div>
                <div>
                  <textarea
                    rows={2}
                    value={formData.seoDescription}
                    onChange={(e) =>
                      setFormData({ ...formData, seoDescription: e.target.value })
                    }
                    placeholder="Meta Description for Google..."
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => {
                    setIsAddModalOpen(false);
                    setEditingCategory(null);
                  }}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold shadow-md"
                >
                  {editingCategory ? 'Save Changes' : 'Create Category'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Category Attributes Drawer Modal */}
      {activeCategoryForAttrs && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-2xl p-6 space-y-5 shadow-2xl animate-in fade-in zoom-in-95 duration-150 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-4 border-b border-slate-800">
              <div>
                <h2 className="text-base font-black text-white flex items-center gap-2">
                  <SlidersHorizontal className="w-5 h-5 text-indigo-400" />
                  <span>Category Specifications: {activeCategoryForAttrs.name}</span>
                </h2>
                <p className="text-xs text-slate-400 mt-0.5">
                  Assign dynamic attributes to control input forms, product page specs, and storefront filters.
                </p>
              </div>
              <button
                onClick={() => setActiveCategoryForAttrs(null)}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {isAttrsLoading ? (
              <div className="py-12 text-center text-slate-400">Loading attributes...</div>
            ) : (
              <div className="space-y-6 text-xs">
                {/* Assigned Attributes List */}
                <div className="space-y-3">
                  <h3 className="font-bold text-white text-xs uppercase tracking-wider flex items-center justify-between">
                    <span>Assigned Specifications ({assignedAttrs.length})</span>
                    <span className="text-slate-400 font-normal">
                      Toggle filterable or variant capability
                    </span>
                  </h3>

                  {assignedAttrs.length === 0 ? (
                    <div className="p-4 bg-slate-950 rounded-xl border border-slate-800 text-slate-500 text-center">
                      No attributes assigned yet. Pick from the available pool below.
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {assignedAttrs.map((ca) => (
                        <div
                          key={ca.id}
                          className="bg-slate-950 border border-slate-800 rounded-xl p-3.5 flex items-center justify-between gap-4"
                        >
                          <div>
                            <div className="font-bold text-white text-sm">
                              {ca.attribute.name}
                              <span className="text-slate-400 text-xs font-normal ml-2">
                                ({ca.attribute.group?.name || 'General'})
                              </span>
                            </div>
                            <div className="text-[11px] text-slate-500 font-mono">
                              Type: {ca.attribute.type} {ca.attribute.unit ? `(${ca.attribute.unit})` : ''}
                            </div>
                          </div>

                          <div className="flex items-center gap-4">
                            <label className="flex items-center gap-1.5 cursor-pointer text-slate-300">
                              <input
                                type="checkbox"
                                checked={ca.isFilterable}
                                onChange={(e) =>
                                  handleToggleAttrOption(
                                    ca.attributeId,
                                    'isFilterable',
                                    e.target.checked
                                  )
                                }
                                className="rounded text-blue-600 focus:ring-blue-500 w-3.5 h-3.5 border-slate-800"
                              />
                              <span className="text-[11px] font-bold">Filterable</span>
                            </label>

                            <label className="flex items-center gap-1.5 cursor-pointer text-slate-300">
                              <input
                                type="checkbox"
                                checked={ca.isVariantOption}
                                onChange={(e) =>
                                  handleToggleAttrOption(
                                    ca.attributeId,
                                    'isVariantOption',
                                    e.target.checked
                                  )
                                }
                                className="rounded text-blue-600 focus:ring-blue-500 w-3.5 h-3.5 border-slate-800"
                              />
                              <span className="text-[11px] font-bold">Variant</span>
                            </label>

                            <button
                              onClick={() => handleUnassignAttribute(ca.attributeId)}
                              className="p-1 rounded bg-slate-900 hover:bg-red-900/50 text-slate-400 hover:text-red-400 transition-colors ml-2"
                              title="Unassign Attribute"
                            >
                              <X className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Available Pool of Attributes */}
                {availableAttrs.length > 0 && (
                  <div className="space-y-3 pt-4 border-t border-slate-800">
                    <h3 className="font-bold text-white text-xs uppercase tracking-wider">
                      Available Attributes Pool ({availableAttrs.length})
                    </h3>
                    <div className="flex flex-wrap gap-2">
                      {availableAttrs.map((attr) => (
                        <button
                          key={attr.id}
                          onClick={() => handleAssignAttribute(attr.id)}
                          className="px-3 py-1.5 bg-slate-950 hover:bg-blue-600/20 text-slate-300 hover:text-blue-400 border border-slate-800 hover:border-blue-500/40 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5"
                        >
                          <Plus className="w-3 h-3 text-blue-400" />
                          <span>{attr.name}</span>
                          <span className="text-[10px] text-slate-500">
                            ({attr.group?.name})
                          </span>
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            <div className="flex items-center justify-end pt-3 border-t border-slate-800">
              <button
                type="button"
                onClick={() => setActiveCategoryForAttrs(null)}
                className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
