'use client';

import React, { useState, useMemo, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ProductCard } from '@/components/product/ProductCard';
import { useStore } from '@/context/StoreContext';
import { CategoryFiltersData } from '@/lib/category-filters';
import { generateBreadcrumbJsonLd } from '@/lib/seo';
import { CategoryBanner } from '@/components/category/CategoryBanner';
import {
  ChevronRight,
  ChevronDown,
  SlidersHorizontal,
  X,
  Laptop,
  Monitor,
  Network,
  Scan,
  Headphones,
  Package,
  LayoutGrid,
  List,
  Search,
  CheckCircle2,
  RotateCcw
} from 'lucide-react';

const categoryIcons: Record<string, any> = {
  'laptops': Laptop,
  'desktops': Monitor,
  'network-device': Network,
  'scanner': Scan,
  'accessories': Headphones,
};

interface AttributeFilterOption {
  attributeId: string;
  name: string;
  nameAr: string;
  slug: string;
  type: string;
  unit: string | null;
  groupName: string;
  groupNameAr: string;
  displayOrder: number;
  values: { value: string; count: number }[];
}

// Client-side in-memory cache to make category navigation 0ms instant
const categoryFiltersClientCache = new Map<string, any>();

export default function CategoryClientView({
  slug,
  initialData,
}: {
  slug: string;
  initialData?: CategoryFiltersData | null;
}) {
  const { isRtl, formatPrice, products, categories } = useStore();

  const initialSource = initialData || (typeof window !== 'undefined' ? categoryFiltersClientCache.get(slug) : null);
  const [dbCategory, setDbCategory] = useState<any>(initialSource?.category || null);
  const [dynamicFilters, setDynamicFilters] = useState<AttributeFilterOption[]>(initialSource?.attributeFilters || []);
  const [availableBrands, setAvailableBrands] = useState<{ id: string; name: string; count: number }[]>(initialSource?.brands || []);
  const [priceBounds, setPriceBounds] = useState<{ min: number; max: number }>(initialSource?.priceRange || { min: 0, max: 150000 });
  const [isFiltersLoading, setIsFiltersLoading] = useState(!initialSource);

  // Filter States
  const [selectedBrands, setSelectedBrands] = useState<string[]>([]);
  const [selectedAttributes, setSelectedAttributes] = useState<Record<string, string[]>>({});
  const [openAccordions, setOpenAccordions] = useState<Record<string, boolean>>(() => {
    const acc: Record<string, boolean> = { brands: true, price: true };
    if (initialSource?.attributeFilters) {
      initialSource.attributeFilters.forEach((af: AttributeFilterOption) => {
        acc[af.slug] = true;
      });
    }
    return acc;
  });
  const [brandSearch, setBrandSearch] = useState('');
  const [attrSearches, setAttrSearches] = useState<Record<string, string>>({});
  const [priceMin, setPriceMin] = useState<number>(initialSource?.priceRange ? initialSource.priceRange.min : 0);
  const [priceMax, setPriceMax] = useState<number>(initialSource?.priceRange ? initialSource.priceRange.max : 150000);
  const [inStockOnly, setInStockOnly] = useState<boolean>(false);
  const [sortBy, setSortBy] = useState<'best' | 'price-asc' | 'price-desc'>('best');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);

  // Fetch dynamic filters and category details from API in the background
  useEffect(() => {
    if (initialData && initialData.category && initialData.category.slug.toLowerCase() === slug.toLowerCase()) {
      setIsFiltersLoading(false);
      return;
    }

    const cached = categoryFiltersClientCache.get(slug);
    if (cached) {
      if (cached.category) setDbCategory(cached.category);
      if (cached.attributeFilters) setDynamicFilters(cached.attributeFilters);
      if (cached.brands) setAvailableBrands(cached.brands);
      if (cached.priceRange) {
        setPriceBounds(cached.priceRange);
      }
      setIsFiltersLoading(false);
      return;
    }

    let isCancelled = false;
    fetch(`/api/categories/${slug}/filters`)
      .then((res) => res.json())
      .then((data) => {
        if (isCancelled) return;
        if (data.success) {
          categoryFiltersClientCache.set(slug, data);
          if (data.category) setDbCategory(data.category);
          if (data.attributeFilters && data.attributeFilters.length > 0) {
            setDynamicFilters(data.attributeFilters);
          }
          if (data.brands) setAvailableBrands(data.brands);
          if (data.priceRange) {
            setPriceBounds(data.priceRange);
            setPriceMin((prev) => (prev === 0 ? data.priceRange.min : prev));
            setPriceMax((prev) => (prev === 150000 ? data.priceRange.max : prev));
          }
          if (Array.isArray(data.attributeFilters)) {
            setOpenAccordions((prev) => {
              const updated: Record<string, boolean> = { ...prev, brands: true, price: true };
              data.attributeFilters.forEach((af: AttributeFilterOption) => {
                updated[af.slug] = true;
              });
              return updated;
            });
          }
        }
      })
      .catch((err) => console.warn('Could not fetch category filters:', err))
      .finally(() => {
        if (!isCancelled) setIsFiltersLoading(false);
      });

    return () => {
      isCancelled = true;
    };
  }, [slug]);

  const storeCategory = categories.find((c) => c.slug.toLowerCase() === slug.toLowerCase());
  const category = dbCategory || storeCategory || {
    id: slug,
    name: slug.charAt(0).toUpperCase() + slug.slice(1),
    nameAr: slug,
    slug: slug,
    itemCount: 0,
    image: '/images/category_laptops.jpg',
  };

  // Category products from live store context
  const categoryProducts = useMemo(() => {
    return products.filter((p) => {
      const matchSlug =
        p.categorySlug?.toLowerCase() === category.slug.toLowerCase() ||
        (p as any).categoryId?.toLowerCase() === category.slug.toLowerCase();
      const matchName =
        p.category?.toLowerCase() === category.name.toLowerCase() ||
        p.category?.toLowerCase().includes(category.slug.toLowerCase());
      return matchSlug || matchName;
    });
  }, [products, category]);

  // Derived brands if API brand list hasn't loaded yet
  const brandsList = useMemo(() => {
    if (availableBrands.length > 0) return availableBrands;
    const counts: Record<string, number> = {};
    categoryProducts.forEach((p) => {
      if (p.brand) {
        counts[p.brand] = (counts[p.brand] || 0) + 1;
      }
    });
    return Object.entries(counts)
      .map(([name, count]) => ({ id: name.toLowerCase(), name, count }))
      .sort((a, b) => b.count - a.count);
  }, [availableBrands, categoryProducts]);

  // Filtering Engine
  const filteredProducts = useMemo(() => {
    return categoryProducts
      .filter((p) => {
        // Brand filter (OR between selected brands)
        if (selectedBrands.length > 0) {
          if (!selectedBrands.some((b) => p.brand.toLowerCase() === b.toLowerCase())) {
            return false;
          }
        }

        // Price filter
        if (p.price < priceMin || p.price > priceMax) return false;

        // Stock filter
        if (inStockOnly && !p.inStock) return false;

        // Dynamic Attributes Filters
        // Rule: AND between attributes, OR between values of same attribute
        for (const [attrSlug, selectedValues] of Object.entries(selectedAttributes)) {
          if (selectedValues && selectedValues.length > 0) {
            let matched = false;

            // 1. Check attributeValues relation if available
            const attrVals = (p as any).attributeValues;
            if (Array.isArray(attrVals)) {
              matched = attrVals.some(
                (av: any) =>
                  av.attribute?.slug?.toLowerCase() === attrSlug.toLowerCase() &&
                  selectedValues.some((v) =>
                    (av.textValue || String(av.numberValue || '')).toLowerCase() === v.toLowerCase()
                  )
              );
            }

            // 2. Fallback to specs JSON object
            if (!matched && p.specs) {
              const filterDef = dynamicFilters.find((df) => df.slug === attrSlug);
              const targetKeys = [
                attrSlug,
                attrSlug.toUpperCase(),
                filterDef?.name,
                filterDef?.nameAr,
              ].filter(Boolean) as string[];

              for (const tk of targetKeys) {
                const specVal = (p.specs as any)[tk];
                if (specVal && selectedValues.some((v) => String(specVal).toLowerCase().includes(v.toLowerCase()))) {
                  matched = true;
                  break;
                }
              }
            }

            if (!matched) return false;
          }
        }

        return true;
      })
      .sort((a, b) => {
        if (sortBy === 'price-asc') return a.price - b.price;
        if (sortBy === 'price-desc') return b.price - a.price;
        return 0;
      });
  }, [categoryProducts, selectedBrands, selectedAttributes, priceMin, priceMax, inStockOnly, sortBy, dynamicFilters]);

  // Toggle Handlers
  const toggleBrand = (brandName: string) => {
    setSelectedBrands((prev) =>
      prev.includes(brandName) ? prev.filter((b) => b !== brandName) : [...prev, brandName]
    );
  };

  const toggleAttributeValue = (attrSlug: string, value: string) => {
    setSelectedAttributes((prev) => {
      const current = prev[attrSlug] || [];
      const updated = current.includes(value)
        ? current.filter((v) => v !== value)
        : [...current, value];
      if (updated.length === 0) {
        const copy = { ...prev };
        delete copy[attrSlug];
        return copy;
      }
      return { ...prev, [attrSlug]: updated };
    });
  };

  const toggleAccordion = (key: string) => {
    setOpenAccordions((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const clearAllFilters = () => {
    setSelectedBrands([]);
    setSelectedAttributes({});
    setPriceMin(priceBounds.min);
    setPriceMax(priceBounds.max);
    setInStockOnly(false);
  };

  const activeFiltersCount =
    selectedBrands.length +
    Object.values(selectedAttributes).reduce((sum, vals) => sum + vals.length, 0) +
    (inStockOnly ? 1 : 0) +
    (priceMin > priceBounds.min || priceMax < priceBounds.max ? 1 : 0);

  const title = isRtl ? category.nameAr || category.name : category.name;
  const CategoryIcon = categoryIcons[category.slug.toLowerCase()] || Laptop;

  // Single-Level Breadcrumbs strictly Home > Category Name
  const breadcrumbsJsonLd = generateBreadcrumbJsonLd([
    { name: 'Home', url: '/' },
    { name: category.name, url: `/category/${category.slug}` },
  ]);

  return (
    <div className="py-4 sm:py-6">
      {/* Schema.org Breadcrumb JSON-LD */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbsJsonLd) }}
      />

      <div className="max-w-[1536px] mx-auto px-4 sm:px-6 space-y-6">
        {/* Breadcrumbs - Strictly Single-Level Category */}
        <div className="flex items-center gap-2 text-[12px] text-gray-500">
          <Link href="/" className="hover:text-hub-blue transition-colors">
            {isRtl ? 'الرئيسية' : 'Home'}
          </Link>
          <ChevronRight className="w-3.5 h-3.5 rtl:rotate-180 text-gray-400" />
          <span className="font-bold text-gray-900">{title}</span>
        </div>

        {/* Category Hero Banner */}
        <CategoryBanner
          slug={slug}
          categoryName={category.name}
          categoryNameAr={category.nameAr}
          itemCount={categoryProducts.length}
          description={category.description}
          descriptionAr={category.descriptionAr}
        />

        {/* Catalog Main Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Left Sidebar Filter (Desktop - 3.5 Cols) */}
          <aside className="hidden lg:block lg:col-span-3 space-y-4 bg-white p-5 rounded-2xl border border-slate-200/90 shadow-2xs">
            <div className="flex items-center justify-between pb-3 border-b border-gray-100">
              <h3 className="font-extrabold text-[15px] text-gray-900 flex items-center gap-2">
                <SlidersHorizontal className="w-4 h-4 text-hub-blue" />
                <span>{isRtl ? 'الفلاتر' : 'Filters'}</span>
              </h3>
              {activeFiltersCount > 0 && (
                <button
                  onClick={clearAllFilters}
                  className="text-[11px] font-bold text-red-600 hover:underline flex items-center gap-1"
                >
                  <RotateCcw className="w-3 h-3" />
                  <span>{isRtl ? 'مسح الكل' : 'Reset'}</span>
                </button>
              )}
            </div>

            {/* Brand Filter Accordion */}
            {brandsList.length > 0 && (
              <div className="border-b border-gray-100 pb-3">
                <button
                  type="button"
                  onClick={() => toggleAccordion('brands')}
                  className="w-full flex items-center justify-between py-1 text-[13px] font-bold text-gray-800 hover:text-hub-blue transition-colors"
                >
                  <span>{isRtl ? 'الماركة' : 'Brand'}</span>
                  <ChevronDown
                    className={`w-4 h-4 text-gray-400 transition-transform ${
                      openAccordions.brands ? 'rotate-180' : ''
                    }`}
                  />
                </button>

                {openAccordions.brands && (
                  <div className="space-y-2 mt-2">
                    {brandsList.length > 5 && (
                      <div className="relative mb-2">
                        <input
                          type="text"
                          value={brandSearch}
                          onChange={(e) => setBrandSearch(e.target.value)}
                          placeholder={isRtl ? 'بحث في الماركات...' : 'Search brand...'}
                          className="w-full px-3 py-1.5 text-[11px] border border-gray-200 rounded-xl focus:outline-none focus:border-hub-blue pr-8 rtl:pr-3 rtl:pl-8"
                        />
                        <Search className="w-3.5 h-3.5 text-gray-400 absolute right-2.5 rtl:right-auto rtl:left-2.5 top-2" />
                      </div>
                    )}

                    <div className="space-y-1 max-h-48 overflow-y-auto pr-1">
                      {brandsList
                        .filter((b) => b.name.toLowerCase().includes(brandSearch.toLowerCase()))
                        .map((b) => (
                          <label
                            key={b.name}
                            className="flex items-center justify-between text-[12px] text-gray-700 hover:text-hub-blue cursor-pointer p-1 rounded-lg hover:bg-slate-50 transition-colors"
                          >
                            <div className="flex items-center gap-2.5">
                              <input
                                type="checkbox"
                                checked={selectedBrands.includes(b.name)}
                                onChange={() => toggleBrand(b.name)}
                                className="w-4 h-4 rounded text-hub-blue focus:ring-hub-blue border-gray-300 cursor-pointer"
                              />
                              <span className="font-medium">{b.name}</span>
                            </div>
                            <span className="text-[10px] text-slate-400 font-mono">({b.count})</span>
                          </label>
                        ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Price Filter Accordion */}
            <div className="border-b border-gray-100 pb-3">
              <button
                type="button"
                onClick={() => toggleAccordion('price')}
                className="w-full flex items-center justify-between py-1 text-[13px] font-bold text-gray-800 hover:text-hub-blue transition-colors"
              >
                <span>{isRtl ? 'السعر' : 'Price Range (EGP)'}</span>
                <ChevronDown
                  className={`w-4 h-4 text-gray-400 transition-transform ${
                    openAccordions.price ? 'rotate-180' : ''
                  }`}
                />
              </button>

              {openAccordions.price && (
                <div className="space-y-3 mt-2">
                  <div className="text-[11px] font-bold text-hub-blue font-mono text-center bg-blue-50/60 py-1 rounded-lg border border-blue-100">
                    {formatPrice(priceMin)} - {formatPrice(priceMax)}
                  </div>
                  <input
                    type="range"
                    min={priceBounds.min}
                    max={priceBounds.max}
                    step={1000}
                    value={priceMax}
                    onChange={(e) => setPriceMax(Number(e.target.value))}
                    className="w-full accent-hub-blue cursor-pointer"
                  />
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="text-[10px] text-gray-400 font-semibold block mb-0.5">
                        {isRtl ? 'من' : 'Min'}
                      </label>
                      <input
                        type="number"
                        value={priceMin}
                        min={priceBounds.min}
                        max={priceMax}
                        step={500}
                        onChange={(e) => setPriceMin(Math.max(0, Number(e.target.value)))}
                        className="w-full px-2 py-1 text-[11px] font-mono font-bold border border-gray-200 rounded-lg focus:outline-none focus:border-hub-blue"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] text-gray-400 font-semibold block mb-0.5">
                        {isRtl ? 'إلى' : 'Max'}
                      </label>
                      <input
                        type="number"
                        value={priceMax}
                        min={priceMin}
                        max={priceBounds.max}
                        step={500}
                        onChange={(e) => setPriceMax(Number(e.target.value))}
                        className="w-full px-2 py-1 text-[11px] font-mono font-bold border border-gray-200 rounded-lg focus:outline-none focus:border-hub-blue"
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Dynamic Category Attributes Filter Accordions */}
            {dynamicFilters.map((af) => {
              const isOpen = openAccordions[af.slug] ?? true;
              const selectedValues = selectedAttributes[af.slug] || [];
              const searchVal = attrSearches[af.slug] || '';
              const filteredValues = af.values.filter((v) =>
                v.value.toLowerCase().includes(searchVal.toLowerCase())
              );

              return (
                <div key={af.attributeId} className="border-b border-gray-100 pb-3">
                  <button
                    type="button"
                    onClick={() => toggleAccordion(af.slug)}
                    className="w-full flex items-center justify-between py-1 text-[13px] font-bold text-gray-800 hover:text-hub-blue transition-colors"
                  >
                    <div className="flex items-center gap-1.5 truncate">
                      <span>{isRtl ? af.nameAr || af.name : af.name}</span>
                      {af.unit && <span className="text-[10px] text-gray-400 font-normal">({af.unit})</span>}
                      {selectedValues.length > 0 && (
                        <span className="w-1.5 h-1.5 rounded-full bg-hub-blue" />
                      )}
                    </div>
                    <ChevronDown
                      className={`w-4 h-4 text-gray-400 transition-transform shrink-0 ${
                        isOpen ? 'rotate-180' : ''
                      }`}
                    />
                  </button>

                  {isOpen && (
                    <div className="space-y-1.5 mt-2">
                      {af.values.length > 6 && (
                        <div className="relative mb-1.5">
                          <input
                            type="text"
                            value={searchVal}
                            onChange={(e) =>
                              setAttrSearches((prev) => ({ ...prev, [af.slug]: e.target.value }))
                            }
                            placeholder={isRtl ? `بحث...` : `Search...`}
                            className="w-full px-2.5 py-1 text-[11px] border border-gray-200 rounded-lg focus:outline-none focus:border-hub-blue"
                          />
                        </div>
                      )}

                      <div className="space-y-1 max-h-44 overflow-y-auto pr-1">
                        {filteredValues.map((opt) => {
                          const isChecked = selectedValues.includes(opt.value);
                          return (
                            <label
                              key={opt.value}
                              className="flex items-center justify-between text-[12px] text-gray-700 hover:text-hub-blue cursor-pointer p-1 rounded-lg hover:bg-slate-50 transition-colors"
                            >
                              <div className="flex items-center gap-2">
                                <input
                                  type="checkbox"
                                  checked={isChecked}
                                  onChange={() => toggleAttributeValue(af.slug, opt.value)}
                                  className="w-4 h-4 rounded text-hub-blue focus:ring-hub-blue border-gray-300 cursor-pointer"
                                />
                                <span className={isChecked ? 'font-bold text-hub-blue' : 'font-medium'}>
                                  {opt.value}
                                </span>
                              </div>
                              <span className="text-[10px] text-slate-400 font-mono">({opt.count})</span>
                            </label>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}

            {/* In-Stock Toggle */}
            <div className="pt-2">
              <label className="flex items-center justify-between text-[13px] text-gray-800 font-bold cursor-pointer p-1 rounded-lg hover:bg-slate-50 transition-colors">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-emerald-500" />
                  <span>{isRtl ? 'المتوفر في المخزن فقط' : 'In-Stock Only'}</span>
                </div>
                <input
                  type="checkbox"
                  checked={inStockOnly}
                  onChange={(e) => setInStockOnly(e.target.checked)}
                  className="w-4 h-4 rounded text-hub-blue focus:ring-hub-blue border-gray-300 cursor-pointer"
                />
              </label>
            </div>
          </aside>

          {/* Mobile Filter Drawer Modal */}
          {mobileFilterOpen && (
            <div className="fixed inset-0 z-50 lg:hidden flex">
              <div
                className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity"
                onClick={() => setMobileFilterOpen(false)}
              />
              <div className="relative w-full max-w-xs sm:max-w-sm bg-white h-full ml-auto rtl:mr-auto rtl:ml-0 flex flex-col shadow-2xl z-10">
                {/* Drawer Header */}
                <div className="p-4 border-b border-gray-100 flex items-center justify-between bg-slate-50/50">
                  <div className="flex items-center gap-2">
                    <SlidersHorizontal className="w-4 h-4 text-hub-blue" />
                    <h3 className="font-extrabold text-gray-900 text-[14px]">
                      {isRtl ? 'تصفية مواصفات القسم' : 'Filter Specifications'}
                    </h3>
                  </div>
                  <div className="flex items-center gap-2">
                    {activeFiltersCount > 0 && (
                      <button
                        onClick={clearAllFilters}
                        className="text-[11px] font-bold text-hub-blue hover:underline"
                      >
                        {isRtl ? 'مسح' : 'Reset'}
                      </button>
                    )}
                    <button
                      onClick={() => setMobileFilterOpen(false)}
                      className="p-1 text-gray-500 hover:text-gray-900"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>
                </div>

                {/* Drawer Body */}
                <div className="p-4 overflow-y-auto space-y-4 flex-1">
                  {/* Brands */}
                  {brandsList.length > 0 && (
                    <div className="space-y-2 border-b border-gray-100 pb-3">
                      <h4 className="font-bold text-gray-800 text-[13px]">{isRtl ? 'الماركة' : 'Brand'}</h4>
                      <div className="space-y-1.5 max-h-40 overflow-y-auto">
                        {brandsList.map((b) => (
                          <label
                            key={b.name}
                            className="flex items-center justify-between text-[12px] text-gray-700 hover:text-hub-blue cursor-pointer"
                          >
                            <div className="flex items-center gap-2">
                              <input
                                type="checkbox"
                                checked={selectedBrands.includes(b.name)}
                                onChange={() => toggleBrand(b.name)}
                                className="w-4 h-4 rounded text-hub-blue focus:ring-hub-blue border-gray-300"
                              />
                              <span>{b.name}</span>
                            </div>
                            <span className="text-[10px] text-slate-400 font-mono">({b.count})</span>
                          </label>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Dynamic Attributes in Mobile */}
                  {dynamicFilters.map((af) => (
                    <div key={af.attributeId} className="space-y-2 border-b border-gray-100 pb-3">
                      <h4 className="font-bold text-gray-800 text-[13px]">
                        {isRtl ? af.nameAr || af.name : af.name}
                      </h4>
                      <div className="space-y-1.5 max-h-36 overflow-y-auto">
                        {af.values.map((opt) => (
                          <label
                            key={opt.value}
                            className="flex items-center justify-between text-[12px] text-gray-700 hover:text-hub-blue cursor-pointer"
                          >
                            <div className="flex items-center gap-2">
                              <input
                                type="checkbox"
                                checked={(selectedAttributes[af.slug] || []).includes(opt.value)}
                                onChange={() => toggleAttributeValue(af.slug, opt.value)}
                                className="w-4 h-4 rounded text-hub-blue focus:ring-hub-blue border-gray-300"
                              />
                              <span>{opt.value}</span>
                            </div>
                            <span className="text-[10px] text-slate-400 font-mono">({opt.count})</span>
                          </label>
                        ))}
                      </div>
                    </div>
                  ))}

                  {/* Price */}
                  <div className="space-y-2 border-b border-gray-100 pb-3">
                    <div className="flex items-center justify-between">
                      <h4 className="font-bold text-gray-800 text-[13px]">{isRtl ? 'السعر' : 'Price'}</h4>
                      <span className="text-[10px] font-bold text-hub-blue font-mono">
                        {formatPrice(priceMin)} - {formatPrice(priceMax)}
                      </span>
                    </div>
                    <input
                      type="range"
                      min={priceBounds.min}
                      max={priceBounds.max}
                      step={1000}
                      value={priceMax}
                      onChange={(e) => setPriceMax(Number(e.target.value))}
                      className="w-full accent-hub-blue"
                    />
                  </div>

                  {/* In Stock */}
                  <div>
                    <label className="flex items-center justify-between text-[13px] font-bold text-gray-800 cursor-pointer">
                      <span>{isRtl ? 'المتوفر في المخزن فقط' : 'In Stock Only'}</span>
                      <input
                        type="checkbox"
                        checked={inStockOnly}
                        onChange={(e) => setInStockOnly(e.target.checked)}
                        className="rounded text-hub-blue focus:ring-hub-blue w-4 h-4 border-gray-300"
                      />
                    </label>
                  </div>
                </div>

                {/* Drawer Footer */}
                <div className="p-4 border-t border-gray-100 bg-slate-50/50">
                  <button
                    onClick={() => setMobileFilterOpen(false)}
                    className="w-full bg-hub-blue hover:bg-blue-700 text-white font-bold text-[13px] py-3 rounded-xl transition-colors shadow-sm"
                  >
                    {isRtl
                      ? `عرض النتائج (${filteredProducts.length} منتج)`
                      : `Show Results (${filteredProducts.length} items)`}
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Right Products Area (9 Cols) */}
          <div className="lg:col-span-9 space-y-4">
            {/* Active Filter Pills Bar */}
            {activeFiltersCount > 0 && (
              <div className="flex flex-wrap items-center gap-2 bg-white p-3 rounded-2xl border border-gray-200 shadow-2xs">
                <span className="text-[12px] font-semibold text-gray-500">
                  {isRtl ? 'الفلاتر المحددة:' : 'Active Filters:'}
                </span>

                {selectedBrands.map((bName) => (
                  <button
                    key={bName}
                    onClick={() => toggleBrand(bName)}
                    className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-blue-50 text-blue-700 text-[11px] font-bold border border-blue-200/70 hover:bg-blue-100 transition-colors"
                  >
                    <span>{bName}</span>
                    <X className="w-3 h-3" />
                  </button>
                ))}

                {Object.entries(selectedAttributes).flatMap(([attrSlug, values]) =>
                  values.map((val) => (
                    <button
                      key={`${attrSlug}-${val}`}
                      onClick={() => toggleAttributeValue(attrSlug, val)}
                      className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-indigo-50 text-indigo-700 text-[11px] font-bold border border-indigo-200/70 hover:bg-indigo-100 transition-colors"
                    >
                      <span className="uppercase text-[9px] opacity-75 font-mono">{attrSlug}:</span>
                      <span>{val}</span>
                      <X className="w-3 h-3" />
                    </button>
                  ))
                )}

                {(priceMin > priceBounds.min || priceMax < priceBounds.max) && (
                  <button
                    onClick={() => {
                      setPriceMin(priceBounds.min);
                      setPriceMax(priceBounds.max);
                    }}
                    className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-blue-50 text-blue-700 text-[11px] font-bold border border-blue-200/70 hover:bg-blue-100 transition-colors"
                  >
                    <span>
                      {formatPrice(priceMin)} - {formatPrice(priceMax)}
                    </span>
                    <X className="w-3 h-3" />
                  </button>
                )}

                {inStockOnly && (
                  <button
                    onClick={() => setInStockOnly(false)}
                    className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-700 text-[11px] font-bold border border-emerald-200/70 hover:bg-emerald-100 transition-colors"
                  >
                    <span>{isRtl ? 'متوفر فقط' : 'In Stock'}</span>
                    <X className="w-3 h-3" />
                  </button>
                )}

                <button
                  onClick={clearAllFilters}
                  className="text-[11px] font-bold text-red-600 hover:underline px-1.5 py-0.5"
                >
                  {isRtl ? 'مسح الكل' : 'Clear All'}
                </button>
              </div>
            )}

            {/* Top Toolbar */}
            <div className="bg-white p-3.5 sm:p-4 rounded-2xl border border-gray-200/90 shadow-2xs flex flex-wrap items-center justify-between gap-3">
              <div className="text-[13px] text-gray-600 font-medium">
                {isRtl
                  ? `عرض ${filteredProducts.length} من أصل ${categoryProducts.length} منتج`
                  : `Showing ${filteredProducts.length} of ${categoryProducts.length} items`}
              </div>

              <div className="flex items-center gap-2 sm:gap-3">
                {/* Mobile Filter Trigger */}
                <button
                  onClick={() => setMobileFilterOpen(true)}
                  className="lg:hidden flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 text-gray-800 rounded-xl text-[12px] font-bold hover:bg-slate-200 transition-colors"
                >
                  <SlidersHorizontal className="w-3.5 h-3.5 text-hub-blue" />
                  <span>{isRtl ? 'الفلاتر' : 'Filters'}</span>
                  {activeFiltersCount > 0 && (
                    <span className="w-2 h-2 rounded-full bg-hub-blue" />
                  )}
                </button>

                {/* Sort Dropdown */}
                <select
                  value={sortBy}
                  onChange={(e: any) => setSortBy(e.target.value)}
                  className="bg-slate-50 border border-gray-200 rounded-xl px-3 py-1.5 text-[12px] font-bold text-gray-800 focus:outline-none focus:border-hub-blue cursor-pointer"
                >
                  <option value="best">{isRtl ? 'المقترح' : 'Best Match'}</option>
                  <option value="price-asc">{isRtl ? 'السعر: من الأقل للأعلى' : 'Price: Low to High'}</option>
                  <option value="price-desc">{isRtl ? 'السعر: من الأعلى للأقل' : 'Price: High to Low'}</option>
                </select>

                {/* Grid / List Toggle */}
                <div className="flex items-center gap-1 bg-gray-100 p-1 rounded-xl">
                  <button
                    onClick={() => setViewMode('grid')}
                    className={`p-1.5 rounded-lg transition-colors ${
                      viewMode === 'grid'
                        ? 'bg-white text-hub-blue shadow-xs'
                        : 'text-gray-500 hover:text-gray-900'
                    }`}
                    aria-label="Grid View"
                  >
                    <LayoutGrid className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setViewMode('list')}
                    className={`p-1.5 rounded-lg transition-colors ${
                      viewMode === 'list'
                        ? 'bg-white text-hub-blue shadow-xs'
                        : 'text-gray-500 hover:text-gray-900'
                    }`}
                    aria-label="List View"
                  >
                    <List className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>

            {/* Products Display */}
            {filteredProducts.length === 0 ? (
              <div className="bg-white rounded-2xl border border-gray-200 p-12 text-center space-y-3">
                <Package className="w-12 h-12 text-gray-400 mx-auto" />
                <h3 className="text-lg font-bold text-gray-900">
                  {isRtl ? 'لا توجد منتجات مطابقة للبحث' : 'No products found matching filters'}
                </h3>
                <p className="text-[13px] text-gray-500">
                  {isRtl ? 'جرب تشيل بعض الفلاتر أو مسحها بالكامل' : 'Try clearing filters or changing your selection'}
                </p>
                <button
                  onClick={clearAllFilters}
                  className="px-4 py-2 bg-hub-blue text-white rounded-xl text-[12px] font-bold hover:bg-blue-700 transition-colors shadow-sm"
                >
                  {isRtl ? 'مسح الفلاتر' : 'Reset Filters'}
                </button>
              </div>
            ) : viewMode === 'grid' ? (
              <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 gap-3 sm:gap-4">
                {filteredProducts.map((p) => (
                  <ProductCard key={p.id} product={p} viewMode="grid" />
                ))}
              </div>
            ) : (
              <div className="space-y-3">
                {filteredProducts.map((p) => (
                  <ProductCard key={p.id} product={p} viewMode="list" />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
