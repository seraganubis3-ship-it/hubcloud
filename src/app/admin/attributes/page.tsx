'use client';

import React, { useState, useEffect } from 'react';
import { useStore } from '@/context/StoreContext';
import { CatalogNavTabs } from '@/components/admin/CatalogNavTabs';
import {
  SlidersHorizontal,
  Plus,
  Edit2,
  Trash2,
  Search,
  RefreshCw,
  X,
  Tag,
  Cpu,
  HardDrive,
  Monitor,
  Zap,
  FolderPlus,
  Sparkles,
  Package,
  AlertTriangle
} from 'lucide-react';

interface AttributeGroup {
  id: string;
  name: string;
  nameAr: string;
  displayOrder: number;
  _count?: { attributes: number };
}

interface Attribute {
  id: string;
  groupId: string;
  name: string;
  nameAr: string;
  slug: string;
  type: string;
  unit: string | null;
  options: string[] | string | null;
  group?: { id: string; name: string; nameAr: string };
  assignedCategoriesCount?: number;
  productsUsingCount?: number;
  _count?: { categoryAssignments: number; productValues: number };
}


export default function AdminAttributesPage() {
  const { isRtl, showToast } = useStore();

  const [attributes, setAttributes] = useState<Attribute[]>([]);
  const [groups, setGroups] = useState<AttributeGroup[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedGroupFilter, setSelectedGroupFilter] = useState('all');

  // Attribute Modal
  const [isAttrModalOpen, setIsAttrModalOpen] = useState(false);
  const [editingAttr, setEditingAttr] = useState<Attribute | null>(null);

  // Group Modal & Deletion State
  const [isGroupModalOpen, setIsGroupModalOpen] = useState(false);
  const [editingGroup, setEditingGroup] = useState<AttributeGroup | null>(null);
  const [groupForm, setGroupForm] = useState({ name: '', nameAr: '', displayOrder: 0 });
  const [groupToDelete, setGroupToDelete] = useState<{ id: string; name: string; nameAr: string; count: number } | null>(null);
  const [isDeletingGroup, setIsDeletingGroup] = useState(false);

  // Easy Attribute Form State
  const [attrForm, setAttrForm] = useState({
    name: '',
    nameAr: '',
    groupId: '',
    unit: '',
    optionsList: [] as string[],
    newOptionInput: '',
  });

  const fetchData = async () => {
    setLoading(true);
    try {
      const [attrRes, grpRes] = await Promise.all([
        fetch('/api/admin/attributes'),
        fetch('/api/admin/attribute-groups'),
      ]);
      const attrData = await attrRes.json();
      const grpData = await grpRes.json();

      if (attrData.success && attrData.attributes) {
        setAttributes(attrData.attributes);
      }
      if (grpData.success && grpData.groups) {
        setGroups(grpData.groups);
        if (grpData.groups.length > 0 && !attrForm.groupId) {
          setAttrForm((prev) => ({ ...prev, groupId: grpData.groups[0].id }));
        }
      }
    } catch (err) {
      console.warn('Failed to load attributes data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Helper to parse options into string array
  const getOptionsArray = (options: any): string[] => {
    if (!options) return [];
    if (Array.isArray(options)) return options;
    if (typeof options === 'string') {
      try {
        const parsed = JSON.parse(options);
        return Array.isArray(parsed) ? parsed : [];
      } catch {
        return options.split(',').map((s) => s.trim()).filter(Boolean);
      }
    }
    return [];
  };

  // Open Modal to Create New Attribute
  const openNewAttrModal = (preselectedGroupId?: string) => {
    setEditingAttr(null);
    setAttrForm({
      name: '',
      nameAr: '',
      groupId: preselectedGroupId || groups[0]?.id || '',
      unit: '',
      optionsList: [],
      newOptionInput: '',
    });
    setIsAttrModalOpen(true);
  };

  // Open Modal to Edit Attribute
  const openEditAttrModal = (attr: Attribute) => {
    setEditingAttr(attr);
    setAttrForm({
      name: attr.name,
      nameAr: attr.nameAr,
      groupId: attr.groupId,
      unit: attr.unit || '',
      optionsList: getOptionsArray(attr.options),
      newOptionInput: '',
    });
    setIsAttrModalOpen(true);
  };

  // Add Option Chip to Form (No commas required!)
  const handleAddOption = (val?: string) => {
    const optionToAdd = (val ?? attrForm.newOptionInput).trim();
    if (!optionToAdd) return;

    if (attrForm.optionsList.includes(optionToAdd)) {
      showToast(isRtl ? 'هذا الخيار موجود بالفعل' : 'Option already exists', 'info');
      return;
    }

    setAttrForm((prev) => ({
      ...prev,
      optionsList: [...prev.optionsList, optionToAdd],
      newOptionInput: '',
    }));
  };

  // Remove Option Chip
  const handleRemoveOption = (indexToRemove: number) => {
    setAttrForm((prev) => ({
      ...prev,
      optionsList: prev.optionsList.filter((_, idx) => idx !== indexToRemove),
    }));
  };

  // Save Attribute (Create or Edit)
  const handleSaveAttribute = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!attrForm.name || !attrForm.groupId) {
      showToast(isRtl ? 'يرجى إدخال اسم المواصفة واختيار القسم' : 'Name and Group are required', 'error');
      return;
    }

    // Auto-generate clean slug from English name
    const autoSlug = attrForm.name.toLowerCase().trim().replace(/[^a-z0-9]+/g, '_');

    const payload = {
      name: attrForm.name.trim(),
      nameAr: attrForm.nameAr.trim() || attrForm.name.trim(),
      slug: editingAttr ? editingAttr.slug : autoSlug,
      groupId: attrForm.groupId,
      unit: attrForm.unit.trim() || null,
      type: attrForm.optionsList.length > 0 ? 'select' : 'text',
      options: attrForm.optionsList.length > 0 ? attrForm.optionsList : null,
    };

    try {
      const url = editingAttr
        ? `/api/admin/attributes/${editingAttr.id}`
        : '/api/admin/attributes';
      const method = editingAttr ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const data = await res.json();

      if (data.success) {
        showToast(
          editingAttr
            ? (isRtl ? 'تم تحديث المواصفة بنجاح' : 'Specification updated')
            : (isRtl ? 'تم إضافة المواصفة بنجاح' : 'Specification added'),
          'success'
        );
        setIsAttrModalOpen(false);
        fetchData();
      } else {
        showToast(data.error || 'Failed to save specification', 'error');
      }
    } catch (err: any) {
      showToast(err.message, 'error');
    }
  };

  // Delete Attribute
  const handleDeleteAttribute = async (id: string, name: string) => {
    const confirmMsg = isRtl
      ? `هل أنت متأكد من حذف مواصفة "${name}"؟`
      : `Are you sure you want to delete "${name}"?`;
    if (!confirm(confirmMsg)) return;

    try {
      const res = await fetch(`/api/admin/attributes/${id}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.success) {
        showToast(isRtl ? 'تم حذف المواصفة' : 'Specification deleted', 'info');
        fetchData();
      } else {
        showToast(data.error || 'Could not delete specification', 'error');
      }
    } catch (err: any) {
      showToast(err.message, 'error');
    }
  };

  // Open Edit Group Modal
  const openEditGroupModal = (g: AttributeGroup) => {
    setEditingGroup(g);
    setGroupForm({
      name: g.name,
      nameAr: g.nameAr || '',
      displayOrder: g.displayOrder || 0,
    });
    setIsGroupModalOpen(true);
  };

  // Save Group (Create or Edit)
  const handleSaveGroup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!groupForm.name.trim()) return;

    try {
      const url = editingGroup
        ? `/api/admin/attribute-groups/${editingGroup.id}`
        : '/api/admin/attribute-groups';
      const method = editingGroup ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(groupForm),
      });
      const data = await res.json();
      if (data.success) {
        showToast(
          editingGroup
            ? (isRtl ? 'تم تحديث القسم بنجاح' : 'Group updated successfully')
            : (isRtl ? 'تم إضافة القسم بنجاح' : 'Group created successfully'),
          'success'
        );
        setIsGroupModalOpen(false);
        setEditingGroup(null);
        setGroupForm({ name: '', nameAr: '', displayOrder: 0 });
        fetchData();
      } else {
        showToast(data.error || 'Failed to save group', 'error');
      }
    } catch (err: any) {
      showToast(err.message, 'error');
    }
  };

  // Delete Group Action
  const handleDeleteGroupConfirm = async () => {
    if (!groupToDelete) return;
    setIsDeletingGroup(true);
    try {
      const res = await fetch(`/api/admin/attribute-groups/${groupToDelete.id}`, {
        method: 'DELETE',
      });
      const data = await res.json();
      if (data.success) {
        showToast(isRtl ? 'تم حذف القسم وجميع مواصفاته بنجاح' : 'Group and its specifications deleted successfully', 'success');
        setGroupToDelete(null);
        fetchData();
      } else {
        showToast(data.error || 'Failed to delete group', 'error');
      }
    } catch (err: any) {
      showToast(err.message, 'error');
    } finally {
      setIsDeletingGroup(false);
    }
  };

  // Filter attributes by search and selected group
  const filteredAttributes = attributes.filter((a) => {
    const matchesSearch =
      a.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (a.nameAr && a.nameAr.includes(searchQuery)) ||
      (Array.isArray(a.options) && a.options.some((opt) => opt.toLowerCase().includes(searchQuery.toLowerCase())));
    const matchesGroup = selectedGroupFilter === 'all' || a.groupId === selectedGroupFilter;
    return matchesSearch && matchesGroup;
  });

  // Group attributes by their group for intuitive card display
  const groupedAttributes = groups
    .filter((g) => selectedGroupFilter === 'all' || g.id === selectedGroupFilter)
    .map((g) => {
      const groupAttrs = filteredAttributes.filter((a) => a.groupId === g.id);
      return {
        ...g,
        attributes: groupAttrs,
      };
    })
    .filter((g) => selectedGroupFilter !== 'all' || g.attributes.length > 0 || searchQuery === '');

  // Get appropriate icon for group
  const getGroupIcon = (name: string) => {
    const lower = name.toLowerCase();
    if (lower.includes('perform') || lower.includes('cpu') || lower.includes('أداء')) {
      return <Cpu className="w-5 h-5 text-amber-400" />;
    }
    if (lower.includes('memor') || lower.includes('stor') || lower.includes('ذاكرة') || lower.includes('تخزين')) {
      return <HardDrive className="w-5 h-5 text-emerald-400" />;
    }
    if (lower.includes('display') || lower.includes('screen') || lower.includes('شاشة')) {
      return <Monitor className="w-5 h-5 text-blue-400" />;
    }
    return <Zap className="w-5 h-5 text-purple-400" />;
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Catalog Hub Sub-Navigation */}
      <CatalogNavTabs />

      {/* Clean Header */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 backdrop-blur-md shadow-xl flex flex-wrap items-center justify-between gap-6">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-bold">
            <Sparkles className="w-3.5 h-3.5" />
            <span>{isRtl ? 'إدارة مواصفات الأجهزة' : 'Hardware Specifications'}</span>
          </div>
          <h1 className="text-2xl font-black text-white tracking-tight flex items-center gap-2.5">
            <SlidersHorizontal className="w-6 h-6 text-blue-400" />
            <span>{isRtl ? 'مواصفات وفلاتر المنتجات' : 'Product Specifications & Filters'}</span>
          </h1>
          <p className="text-xs text-slate-400 max-w-2xl">
            {isRtl
              ? 'تحكم في مواصفات الأجهزة (الرام، المعالج، كارت الشاشة، التخزين) والخيارات المتاحة لكل مواصفة لتسهيل بحث وفلترة العملاء.'
              : 'Easily manage hardware specs (RAM, CPU, GPU, Storage) and their preset options for smooth customer filtering.'}
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={fetchData}
            className="p-2.5 rounded-2xl bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors border border-slate-700/50"
            title={isRtl ? 'تحديث البيانات' : 'Refresh'}
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>

          <button
            onClick={() => {
              setGroupForm({ name: '', nameAr: '', displayOrder: groups.length + 1 });
              setIsGroupModalOpen(true);
            }}
            className="flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold transition-all border border-slate-700/80 shadow-xs"
          >
            <FolderPlus className="w-4 h-4 text-blue-400" />
            <span>{isRtl ? '+ قسم جديد' : '+ New Group'}</span>
          </button>

          <button
            onClick={() => openNewAttrModal()}
            className="flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white text-xs font-bold transition-all shadow-lg shadow-blue-500/20 active:scale-95"
          >
            <Plus className="w-4 h-4" />
            <span>{isRtl ? '+ إضافة مواصفة' : '+ Add Specification'}</span>
          </button>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="bg-slate-900/60 border border-slate-800/80 rounded-2xl p-4 flex flex-wrap items-center justify-between gap-4">
        {/* Search */}
        <div className="relative flex-1 min-w-[260px] max-w-md">
          <Search className={`w-4 h-4 absolute ${isRtl ? 'right-3.5' : 'left-3.5'} top-1/2 -translate-y-1/2 text-slate-500`} />
          <input
            type="text"
            placeholder={isRtl ? 'ابحث عن مواصفة (مثال: رام، معالج، 16GB)...' : 'Search specifications or options (e.g. RAM, i7, 16GB)...'}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className={`w-full bg-slate-950 border border-slate-800 rounded-xl ${isRtl ? 'pr-10 pl-4 text-right' : 'pl-10 pr-4'} py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 transition-colors`}
          />
        </div>

        {/* Group Selector Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 max-w-full">
          <button
            onClick={() => setSelectedGroupFilter('all')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
              selectedGroupFilter === 'all'
                ? 'bg-blue-600 text-white shadow-md'
                : 'bg-slate-950 text-slate-400 hover:text-white border border-slate-800'
            }`}
          >
            {isRtl ? 'كل الأقسام' : 'All Groups'} ({attributes.length})
          </button>
          {groups.map((g) => {
            const count = attributes.filter((a) => a.groupId === g.id).length;
            return (
              <button
                key={g.id}
                onClick={() => setSelectedGroupFilter(g.id)}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
                  selectedGroupFilter === g.id
                    ? 'bg-blue-600 text-white shadow-md'
                    : 'bg-slate-950 text-slate-400 hover:text-white border border-slate-800'
                }`}
              >
                {isRtl ? g.nameAr || g.name : g.name} ({count})
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Content: Grouped Specifications Cards */}
      {loading ? (
        <div className="p-16 text-center text-slate-500 flex flex-col items-center justify-center gap-3">
          <RefreshCw className="w-6 h-6 animate-spin text-blue-500" />
          <span className="text-xs">{isRtl ? 'جارٍ تحميل المواصفات...' : 'Loading specifications...'}</span>
        </div>
      ) : groupedAttributes.length === 0 ? (
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-12 text-center text-slate-400 space-y-4">
          <SlidersHorizontal className="w-10 h-10 text-slate-600 mx-auto" />
          <div>
            <h3 className="text-base font-bold text-white">{isRtl ? 'لم يتم العثور على مواصفات' : 'No specifications found'}</h3>
            <p className="text-xs text-slate-500 mt-1">
              {searchQuery
                ? (isRtl ? 'جرب البحث بكلمة أخرى' : 'Try searching with another term')
                : (isRtl ? 'ابدأ بإضافة أول مواصفة لمنتجاتك' : 'Start by adding your first specification')}
            </p>
          </div>
          <button
            onClick={() => openNewAttrModal()}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold"
          >
            <Plus className="w-4 h-4" />
            <span>{isRtl ? 'إضافة مواصفة جديدة' : 'Add New Specification'}</span>
          </button>
        </div>
      ) : (
        <div className="space-y-6">
          {groupedAttributes.map((group) => (
            <div
              key={group.id}
              className="bg-slate-900/80 border border-slate-800/90 rounded-3xl p-5 shadow-lg space-y-4 transition-all hover:border-slate-700/80"
            >
              {/* Group Header */}
              <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-800/80">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 rounded-2xl bg-slate-950 border border-slate-800 shadow-inner">
                    {getGroupIcon(group.name)}
                  </div>
                  <div>
                    <h2 className="text-base font-black text-white flex items-center gap-2">
                      <span>{isRtl ? group.nameAr || group.name : group.name}</span>
                      {group.nameAr && !isRtl && (
                        <span className="text-xs text-slate-400 font-normal">({group.nameAr})</span>
                      )}
                    </h2>
                    <span className="text-[11px] font-bold text-slate-400">
                      {group.attributes.length}{' '}
                      {isRtl ? 'مواصفات مسجلة' : 'specifications'}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => openNewAttrModal(group.id)}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800/90 hover:bg-slate-700 text-blue-400 hover:text-blue-300 text-xs font-bold transition-all border border-slate-700/50"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>{isRtl ? 'إضافة مواصفة' : 'Add Spec'}</span>
                  </button>
                  <button
                    onClick={() => openEditGroupModal(group)}
                    className="p-1.5 rounded-xl bg-slate-800/70 hover:bg-slate-700 text-slate-300 hover:text-white transition-all border border-slate-700/50"
                    title={isRtl ? 'تعديل القسم' : 'Edit Group'}
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => setGroupToDelete({ id: group.id, name: group.name, nameAr: group.nameAr, count: group.attributes.length })}
                    className="p-1.5 rounded-xl bg-red-950/40 hover:bg-red-900/60 text-red-400 hover:text-red-200 transition-all border border-red-800/40"
                    title={isRtl ? 'حذف القسم' : 'Delete Group'}
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* Group Specifications List / Grid */}
              {group.attributes.length === 0 ? (
                <div className="py-6 text-center text-xs text-slate-500">
                  {isRtl ? 'لا توجد مواصفات في هذا القسم بعد.' : 'No specifications in this group yet.'}
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                  {group.attributes.map((attr) => {
                    const optionsList = getOptionsArray(attr.options);
                    return (
                      <div
                        key={attr.id}
                        className="bg-slate-950/70 border border-slate-800/90 rounded-2xl p-4 flex flex-col justify-between gap-3 hover:border-blue-500/40 transition-all group"
                      >
                        <div className="space-y-2">
                          {/* Top row: Name & Actions */}
                          <div className="flex items-start justify-between gap-2">
                            <div>
                              <h3 className="font-bold text-white text-sm flex items-center gap-2">
                                <span>{isRtl ? attr.nameAr || attr.name : attr.name}</span>
                                {attr.unit && (
                                  <span className="px-2 py-0.5 rounded-md bg-blue-500/10 text-blue-400 font-mono text-[10px] font-bold border border-blue-500/20">
                                    {attr.unit}
                                  </span>
                                )}
                              </h3>
                              <div className="text-[11px] text-slate-400 mt-0.5">
                                {isRtl ? attr.name : attr.nameAr}
                              </div>
                            </div>

                            <div className="flex items-center gap-1 opacity-80 group-hover:opacity-100 transition-opacity">
                              <button
                                onClick={() => openEditAttrModal(attr)}
                                className="p-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white transition-colors border border-slate-800"
                                title={isRtl ? 'تعديل المواصفة والخيارات' : 'Edit Spec & Options'}
                              >
                                <Edit2 className="w-3.5 h-3.5 text-blue-400" />
                              </button>
                              <button
                                onClick={() => handleDeleteAttribute(attr.id, attr.name)}
                                className="p-1.5 rounded-xl bg-slate-900 hover:bg-red-950/60 text-slate-400 hover:text-red-400 transition-colors border border-slate-800"
                                title={isRtl ? 'حذف' : 'Delete'}
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </div>

                          {/* Options Badges */}
                          <div>
                            <div className="text-[10px] uppercase tracking-wider font-bold text-slate-500 mb-1.5 flex items-center gap-1">
                              <Tag className="w-3 h-3" />
                              <span>{isRtl ? 'الخيارات المتاحة (Options):' : 'Available Options:'}</span>
                            </div>

                            {optionsList.length === 0 ? (
                              <div className="text-[11px] text-slate-500 italic">
                                {isRtl ? 'نص حر (يدخله مدير المنتج)' : 'Free text (entered by merchant)'}
                              </div>
                            ) : (
                              <div className="flex flex-wrap gap-1.5">
                                {optionsList.slice(0, 10).map((opt, i) => (
                                  <span
                                    key={i}
                                    className="px-2.5 py-1 rounded-lg bg-slate-900 text-slate-200 border border-slate-800 text-xs font-semibold"
                                  >
                                    {opt}
                                  </span>
                                ))}
                                {optionsList.length > 10 && (
                                  <span className="px-2 py-1 rounded-lg bg-slate-900/60 text-slate-400 text-[10px] font-bold border border-slate-800">
                                    +{optionsList.length - 10} {isRtl ? 'إضافية' : 'more'}
                                  </span>
                                )}
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Footer info: usage */}
                        <div className="pt-2 border-t border-slate-900 flex items-center justify-between text-[10px] text-slate-500">
                          <span className="flex items-center gap-1 font-mono">
                            <Package className="w-3 h-3 text-slate-500" />
                            <span>
                              {attr._count?.productValues ?? attr.productsUsingCount ?? 0}{' '}
                              {isRtl ? 'منتج يستخدمها' : 'products'}
                            </span>
                          </span>

                          <button
                            onClick={() => openEditAttrModal(attr)}
                            className="text-blue-400 hover:text-blue-300 font-bold flex items-center gap-1"
                          >
                            <span>{isRtl ? 'إدارة الخيارات' : 'Manage Options'}</span>
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* ========================================================================= */}
      {/* ATTRIBUTE CREATE / EDIT MODAL (SUPER SIMPLE & EASY)                      */}
      {/* ========================================================================= */}
      {isAttrModalOpen && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-xl p-6 space-y-5 shadow-2xl animate-in fade-in zoom-in-95 duration-150 max-h-[92vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-4 border-b border-slate-800">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-blue-500/10 text-blue-400 border border-blue-500/20">
                  <SlidersHorizontal className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-base font-black text-white">
                    {editingAttr
                      ? (isRtl ? 'تعديل المواصفة والخيارات' : 'Edit Specification')
                      : (isRtl ? 'إضافة مواصفة جديدة' : 'New Specification')}
                  </h2>
                  <p className="text-[11px] text-slate-400">
                    {isRtl ? 'أدخل اسم المواصفة والخيارات التابعة لها بسهولة' : 'Enter spec name and add options with 1-click'}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsAttrModalOpen(false)}
                className="p-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveAttribute} className="space-y-4 text-xs">
              {/* 1. Group Selector */}
              <div>
                <label className="block text-slate-300 font-bold mb-1.5">
                  {isRtl ? 'قسم المواصفة (Group) *' : 'Specification Group *'}
                </label>
                <select
                  value={attrForm.groupId}
                  onChange={(e) => setAttrForm({ ...attrForm, groupId: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-white font-semibold focus:outline-none focus:border-blue-500"
                >
                  {groups.map((g) => (
                    <option key={g.id} value={g.id}>
                      {g.name} — {g.nameAr}
                    </option>
                  ))}
                </select>
              </div>

              {/* 2. Names (EN & AR) */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label className="block text-slate-300 font-bold mb-1.5">
                    {isRtl ? 'الاسم بالإنجليزية *' : 'Name (English) *'}
                  </label>
                  <input
                    type="text"
                    required
                    value={attrForm.name}
                    onChange={(e) => setAttrForm({ ...attrForm, name: e.target.value })}
                    placeholder="e.g. RAM Capacity"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-white placeholder-slate-600 focus:outline-none focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-bold mb-1.5">
                    {isRtl ? 'الاسم بالعربية *' : 'Name (Arabic) *'}
                  </label>
                  <input
                    type="text"
                    required
                    dir="rtl"
                    value={attrForm.nameAr}
                    onChange={(e) => setAttrForm({ ...attrForm, nameAr: e.target.value })}
                    placeholder="مثال: سعة الرام"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-white placeholder-slate-600 focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              {/* 3. Unit (Optional) */}
              <div>
                <label className="block text-slate-300 font-bold mb-1">
                  {isRtl ? 'وحدة القياس (اختياري)' : 'Unit of Measurement (Optional)'}
                </label>
                <input
                  type="text"
                  value={attrForm.unit}
                  onChange={(e) => setAttrForm({ ...attrForm, unit: e.target.value })}
                  placeholder="e.g. GB, GHz, W, inch"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-white placeholder-slate-600 focus:outline-none focus:border-blue-500"
                />
              </div>

              {/* 4. EASY TAGS/CHIPS INPUT (NO COMMAS NEEDED!) */}
              <div className="bg-slate-950/90 border border-slate-800 rounded-2xl p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <label className="block text-white font-bold text-xs">
                    {isRtl ? 'الخيارات المتاحة (Options)' : 'Available Options'}
                  </label>
                  <span className="text-[11px] text-slate-400 font-normal">
                    {attrForm.optionsList.length} {isRtl ? 'خيارات مضافة' : 'options added'}
                  </span>
                </div>

                {/* Input Box: Type & Press Enter or Click Add */}
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={attrForm.newOptionInput}
                    onChange={(e) => setAttrForm({ ...attrForm, newOptionInput: e.target.value })}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleAddOption();
                      }
                    }}
                    placeholder={
                      isRtl
                        ? 'اكتب الخيار ثم اضغط Enter (مثال: 16GB)'
                        : 'Type option and press Enter (e.g. 16GB)'
                    }
                    className="flex-1 bg-slate-900 border border-slate-700/80 rounded-xl px-3.5 py-2 text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 text-xs"
                  />
                  <button
                    type="button"
                    onClick={() => handleAddOption()}
                    className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs transition-colors flex items-center gap-1 active:scale-95"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>{isRtl ? 'إضافة' : 'Add'}</span>
                  </button>
                </div>

                {/* Display Current Added Options as Clickable Chips */}
                {attrForm.optionsList.length > 0 ? (
                  <div className="flex flex-wrap gap-2 pt-1">
                    {attrForm.optionsList.map((opt, idx) => (
                      <span
                        key={idx}
                        className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-gradient-to-r from-blue-900/60 to-indigo-900/60 text-blue-200 border border-blue-500/30 text-xs font-semibold shadow-xs"
                      >
                        <span>{opt}</span>
                        <button
                          type="button"
                          onClick={() => handleRemoveOption(idx)}
                          className="w-4 h-4 rounded-full bg-blue-950 hover:bg-red-500 text-slate-300 hover:text-white flex items-center justify-center transition-colors"
                          title={isRtl ? 'حذف' : 'Remove'}
                        >
                          <X className="w-2.5 h-2.5" />
                        </button>
                      </span>
                    ))}
                  </div>
                ) : (
                  <p className="text-[11px] text-slate-500 italic">
                    {isRtl
                      ? 'لم تضف خيارات بعد. اكتب الخيار في الحقل أعلاه واضغط Enter أو زر إضافة.'
                      : 'No options added yet. Type an option above and press Enter or click Add.'}
                  </p>
                )}
              </div>

              {/* Submit Buttons */}
              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsAttrModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold"
                >
                  {isRtl ? 'إلغاء' : 'Cancel'}
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold shadow-md shadow-blue-500/20 active:scale-95"
                >
                  {editingAttr
                    ? (isRtl ? 'حفظ التعديلات' : 'Save Changes')
                    : (isRtl ? 'إنشاء المواصفة' : 'Create Specification')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* GROUP CREATE MODAL (SUPER SIMPLE)                                         */}
      {/* ========================================================================= */}
      {isGroupModalOpen && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-md p-6 space-y-5 shadow-2xl">
            <div className="flex items-center justify-between pb-4 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <FolderPlus className="w-5 h-5 text-blue-400" />
                <h2 className="text-base font-black text-white">
                  {editingGroup
                    ? (isRtl ? 'تعديل قسم المواصفات' : 'Edit Specification Group')
                    : (isRtl ? 'إضافة قسم مواصفات جديد' : 'New Specification Group')}
                </h2>
              </div>
              <button
                onClick={() => {
                  setIsGroupModalOpen(false);
                  setEditingGroup(null);
                  setGroupForm({ name: '', nameAr: '', displayOrder: 0 });
                }}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveGroup} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-300 font-bold mb-1">
                  {isRtl ? 'اسم القسم (بالإنجليزية) *' : 'Group Name (English) *'}
                </label>
                <input
                  type="text"
                  required
                  value={groupForm.name}
                  onChange={(e) => setGroupForm({ ...groupForm, name: e.target.value })}
                  placeholder="e.g. Graphics & Gaming"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-white focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-bold mb-1">
                  {isRtl ? 'اسم القسم (بالعربية) *' : 'Group Name (Arabic) *'}
                </label>
                <input
                  type="text"
                  required
                  dir="rtl"
                  value={groupForm.nameAr}
                  onChange={(e) => setGroupForm({ ...groupForm, nameAr: e.target.value })}
                  placeholder="مثال: كروت الشاشة والألعاب"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-white focus:outline-none focus:border-blue-500"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => {
                    setIsGroupModalOpen(false);
                    setEditingGroup(null);
                    setGroupForm({ name: '', nameAr: '', displayOrder: 0 });
                  }}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold"
                >
                  {isRtl ? 'إلغاء' : 'Cancel'}
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold shadow-md"
                >
                  {editingGroup
                    ? (isRtl ? 'حفظ التعديلات' : 'Save Changes')
                    : (isRtl ? 'حفظ القسم' : 'Save Group')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* GROUP DELETE CONFIRMATION MODAL                                           */}
      {/* ========================================================================= */}
      {groupToDelete && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-xs flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
          <div className="bg-slate-900 border border-red-500/30 rounded-3xl w-full max-w-md p-6 space-y-5 shadow-2xl">
            <div className="flex items-center gap-3 text-red-400">
              <div className="p-3 rounded-2xl bg-red-950/60 border border-red-800/50">
                <AlertTriangle className="w-6 h-6 text-red-400" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white">
                  {isRtl ? 'حذف قسم المواصفات' : 'Delete Specification Group'}
                </h3>
                <p className="text-xs text-red-400/80">
                  {isRtl ? 'تحذير: هذا الإجراء لا يمكن التراجع عنه' : 'Warning: This action cannot be undone'}
                </p>
              </div>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed">
              {isRtl ? (
                <>
                  هل أنت متأكد من رغبتك في حذف قسم <strong className="text-white font-bold">&quot;{groupToDelete.nameAr || groupToDelete.name}&quot;</strong>؟
                  سيتم أيضاً حذف جميع المواصفات ({attributes.filter((a) => a.groupId === groupToDelete.id).length} مواصفة) المرتبطة بهذا القسم تلقائياً.
                </>
              ) : (
                <>
                  Are you sure you want to delete the group <strong className="text-white font-bold">&quot;{groupToDelete.name}&quot;</strong>?
                  All {attributes.filter((a) => a.groupId === groupToDelete.id).length} specifications belonging to this group will also be permanently deleted.
                </>
              )}
            </p>

            <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
              <button
                type="button"
                onClick={() => setGroupToDelete(null)}
                disabled={isDeletingGroup}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs"
              >
                {isRtl ? 'إلغاء' : 'Cancel'}
              </button>
              <button
                type="button"
                onClick={handleDeleteGroupConfirm}
                disabled={isDeletingGroup}
                className="px-5 py-2 rounded-xl bg-red-600 hover:bg-red-500 text-white font-bold text-xs shadow-md shadow-red-600/30 flex items-center gap-2"
              >
                {isDeletingGroup ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    <span>{isRtl ? 'جارٍ الحذف...' : 'Deleting...'}</span>
                  </>
                ) : (
                  <>
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>{isRtl ? 'تأكيد الحذف' : 'Confirm Delete'}</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
