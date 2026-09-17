'use client';

import React, { useState, useMemo, useEffect, Suspense } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useSearchParams, useRouter } from 'next/navigation';
import { ProductCard } from '@/components/product/ProductCard';
import { ProductCardSkeleton } from '@/components/product/ProductCardSkeleton';
import { TrustBadgesRow } from '@/components/home/TrustBadgesRow';
import { BrandRow } from '@/components/home/BrandRow';
import { useStore } from '@/context/StoreContext';
import { generateBreadcrumbJsonLd, SITE_CONFIG } from '@/lib/seo';
import {
  ChevronRight,
  LayoutGrid,
  List,
  SlidersHorizontal,
  X,
  Search,
  Laptop,
  Monitor,
  Network,
  Scan,
  Headphones
} from 'lucide-react';

function normalizeSearchText(text: string): string {
  return text
    .toLowerCase()
    .replace(/[أإآ]/g, 'ا')
    .replace(/ة/g, 'ه')
    .replace(/ى/g, 'ي')
    .replace(/[\u064B-\u065F]/g, '') // remove Arabic diacritics
    .trim();
}

function ProductsCatalog() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialCategory = searchParams.get('category') || 'all';
  const queryParam = searchParams.get('q') || '';
  const brandParam = searchParams.get('brand') || '';

  const { language, isRtl, formatPrice, products, categories, isCatalogLoading } = useStore();

  // Filter States
  const [selectedCategory, setSelectedCategory] = useState<string>(initialCategory);
  const [selectedBrands, setSelectedBrands] = useState<string[]>(brandParam ? [brandParam.toLowerCase()] : []);
  const [brandSearch, setBrandSearch] = useState('');
  const [priceMin, setPriceMin] = useState<number>(0);
  const [priceMax, setPriceMax] = useState<number>(120000);
  const [inStockOnly, setInStockOnly] = useState<boolean>(false);
  const [sortBy, setSortBy] = useState<'best' | 'price-asc' | 'price-desc'>('best');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);

  // Sync state when URL searchParams update
  useEffect(() => {
    const cat = searchParams.get('category') || 'all';
    setSelectedCategory(cat);
  }, [searchParams]);

  useEffect(() => {
    const brand = searchParams.get('brand');
    if (brand) {
      setSelectedBrands([brand.toLowerCase()]);
    }
  }, [searchParams]);

  const clearAllFilters = () => {
    setSelectedBrands([]);
    setSelectedCategory('all');
    setPriceMin(0);
    setPriceMax(120000);
    setInStockOnly(false);
  };

  // Dynamic Brands with counts
  const dynamicBrands = useMemo(() => {
    const counts: Record<string, { name: string; count: number }> = {};
    products.forEach(p => {
      if (p.brand) {
        const key = p.brand.toLowerCase();
        if (!counts[key]) {
          counts[key] = { name: p.brand, count: 0 };
        }
        counts[key].count += 1;
      }
    });
    return Object.entries(counts)
      .map(([id, data]) => ({ id, name: data.name, count: data.count }))
      .sort((a, b) => b.count - a.count);
  }, [products]);

  // Dynamic Category counts
  const categoryCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    products.forEach(p => {
      const slug = (p.categorySlug || (p as any).categoryId || '').toLowerCase();
      if (slug) {
        counts[slug] = (counts[slug] || 0) + 1;
      }
    });
    return counts;
  }, [products]);

  // Filter Logic
  const filteredProducts = useMemo(() => {
    const queryTokens = queryParam
      ? normalizeSearchText(queryParam)
          .split(/\s+/)
          .filter(Boolean)
      : [];

    return products.filter(p => {
      // Smart Multi-token Query Filter
      if (queryTokens.length > 0) {
        const specsText = p.specs ? (typeof p.specs === 'string' ? p.specs : Object.values(p.specs).join(' ')) : '';
        const specsArText = p.specsAr ? (typeof p.specsAr === 'string' ? p.specsAr : Object.values(p.specsAr).join(' ')) : '';
        const featuresText = p.features ? (Array.isArray(p.features) ? p.features.join(' ') : String(p.features)) : '';
        const featuresArText = p.featuresAr ? (Array.isArray(p.featuresAr) ? p.featuresAr.join(' ') : String(p.featuresAr)) : '';

        const searchableFields = [
          p.name,
          p.nameAr || '',
          p.brand,
          p.category,
          p.categorySlug,
          p.subCategory || '',
          p.sku,
          p.description,
          p.descriptionAr || '',
          specsText,
          specsArText,
          featuresText,
          featuresArText,
        ].join(' ');

        const normalizedProductData = normalizeSearchText(searchableFields);

        // Every token must match somewhere in the product's attributes
        const isMatch = queryTokens.every(token => normalizedProductData.includes(token));
        if (!isMatch) return false;
      }

      // Category filter
      if (selectedCategory !== 'all') {
        const catMatch =
          p.categorySlug?.toLowerCase() === selectedCategory.toLowerCase() ||
          (p as any).categoryId?.toLowerCase() === selectedCategory.toLowerCase() ||
          (p.category && p.category.toLowerCase() === selectedCategory.toLowerCase());
        if (!catMatch) return false;
      }

      // Brand filter
      if (selectedBrands.length > 0) {
        const brandMatch = selectedBrands.some(b => p.brand.toLowerCase() === b.toLowerCase() || p.brand.toLowerCase().includes(b.toLowerCase()));
        if (!brandMatch) return false;
      }

      // Price filter
      if (p.price < priceMin || p.price > priceMax) return false;

      // Stock filter
      if (inStockOnly && !p.inStock) return false;

      return true;
    }).sort((a, b) => {
      if (sortBy === 'price-asc') return a.price - b.price;
      if (sortBy === 'price-desc') return b.price - a.price;
      return 0;
    });
  }, [products, queryParam, selectedCategory, selectedBrands, priceMin, priceMax, inStockOnly, sortBy]);

  const currentCategoryObj = categories.find(c => c.slug === selectedCategory);
  const currentCategoryTitle = currentCategoryObj
    ? (isRtl ? currentCategoryObj.nameAr : currentCategoryObj.name)
    : (isRtl ? 'جميع المنتجات والأجهزة' : 'All Products & Gear');

  const categoryIcons: Record<string, any> = {
    'laptops': Laptop,
    'desktops': Monitor,
    'network-device': Network,
    'scanner': Scan,
    'accessories': Headphones,
  };

  const breadcrumbItems = [
    { name: 'Home', url: '/' },
    { name: 'Products', url: '/products' },
    ...(selectedCategory !== 'all' && currentCategoryObj ? [{ name: currentCategoryObj.name, url: `/products?category=${currentCategoryObj.slug}` }] : [])
  ];
  const breadcrumbsJsonLd = generateBreadcrumbJsonLd(breadcrumbItems);

  return (
    <div className="bg-[#f8fafc] min-h-screen">
      {/* Dynamic Canonical URL to prevent duplicate content from filter parameter permutations */}
      <link
        rel="canonical"
        href={selectedCategory !== 'all' && currentCategoryObj ? `${SITE_CONFIG.url}/category/${currentCategoryObj.slug}` : `${SITE_CONFIG.url}/products`}
      />

      {/* Schema.org Breadcrumb JSON-LD */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbsJsonLd) }}
      />

      {/* Breadcrumb Navigation */}
      <div className="bg-white border-b border-gray-100 py-3">
        <div className="max-w-[1536px] mx-auto px-4 sm:px-6 flex items-center gap-2 text-[12px] font-medium text-gray-500">
          <Link href="/" className="hover:text-hub-blue">{isRtl ? 'الرئيسية' : 'Home'}</Link>
          <ChevronRight className="w-3.5 h-3.5 rtl:rotate-180 text-gray-400" />
          <Link href="/products" className="hover:text-hub-blue">{isRtl ? 'المنتجات' : 'Products'}</Link>
          {selectedCategory !== 'all' && currentCategoryObj && (
            <>
              <ChevronRight className="w-3.5 h-3.5 rtl:rotate-180 text-gray-400" />
              <span className="text-gray-900 font-bold">{currentCategoryTitle}</span>
            </>
          )}
        </div>
      </div>

      <div className="max-w-[1536px] mx-auto px-4 sm:px-6 py-6 space-y-6">
        {/* Category Header */}
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-gray-900 tracking-tight">
            {currentCategoryTitle}
          </h1>
          <p className="text-xs sm:text-[13px] text-gray-500 mt-1">
            {isRtl
              ? `عرض ${filteredProducts.length} جهاز معتمد بأفضل الأسعار الرسمية في مصر`
              : `Showing ${filteredProducts.length} certified tech hardware items available for fast dispatch`}
          </p>
        </div>

        {/* 5 Category Pills */}
        <div className="flex items-center gap-2.5 overflow-x-auto scrollbar-none pb-2">
          <button
            onClick={() => setSelectedCategory('all')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl border text-[13px] font-bold whitespace-nowrap transition-all ${
              selectedCategory === 'all'
                ? 'bg-hub-blue text-white border-hub-blue shadow-sm'
                : 'bg-white text-gray-700 border-gray-200 hover:border-hub-blue hover:text-hub-blue'
            }`}
          >
            <span>{isRtl ? 'جميع الأجهزة' : 'All Gear'}</span>
            <span className={`text-[11px] px-1.5 py-0.5 rounded-md font-mono ${
              selectedCategory === 'all' ? 'bg-white/20 text-white' : 'bg-gray-100 text-gray-600'
            }`}>
              {products.length}
            </span>
          </button>

          {categories.map(cat => {
            const Icon = categoryIcons[cat.slug] || Laptop;
            const isSelected = selectedCategory.toLowerCase() === cat.slug.toLowerCase();
            const count = categoryCounts[cat.slug.toLowerCase()] ?? cat.itemCount ?? 0;
            return (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(isSelected ? 'all' : cat.slug)}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl border text-[13px] font-bold whitespace-nowrap transition-all ${
                  isSelected
                    ? 'bg-hub-blue text-white border-hub-blue shadow-sm'
                    : 'bg-white text-gray-700 border-gray-200 hover:border-hub-blue hover:text-hub-blue'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{isRtl ? cat.nameAr : cat.name}</span>
                <span className={`text-[11px] px-1.5 py-0.5 rounded-md font-mono ${
                  isSelected ? 'bg-white/20 text-white' : 'bg-gray-100 text-gray-600'
                }`}>
                  {count}
                </span>
              </button>
            );
          })}
        </div>

        {/* Main Content Layout: Filters Sidebar + Products Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 items-start">
          {/* Mobile Filter Toggle Button */}
          <div className="lg:hidden flex items-center justify-between bg-white p-3 rounded-2xl border border-gray-200 shadow-2xs">
            <button
              onClick={() => setMobileFilterOpen(true)}
              className="flex items-center gap-2 text-[13px] font-bold text-gray-800"
            >
              <SlidersHorizontal className="w-4 h-4 text-hub-blue" />
              <span>{isRtl ? 'تصفية وفلاتر الأجهزة' : 'Filter Hardware'}</span>
              {(selectedBrands.length > 0 || priceMin > 0 || priceMax < 120000 || inStockOnly) && (
                <span className="w-2 h-2 rounded-full bg-hub-blue"></span>
              )}
            </button>
            <span className="text-[12px] text-gray-500 font-medium">
              {filteredProducts.length} {isRtl ? 'منتج معتمد' : 'items'}
            </span>
          </div>

          {/* Left Sidebar Filters (Desktop) */}
          <aside className="hidden lg:block bg-white rounded-2xl border border-slate-200/90 p-5 space-y-6 shadow-2xs">
            {/* Filter Header */}
            <div className="flex items-center justify-between pb-3 border-b border-gray-100">
              <div className="flex items-center gap-2">
                <SlidersHorizontal className="w-4 h-4 text-hub-blue" />
                <h3 className="font-extrabold text-gray-900 text-[15px]">{isRtl ? 'تصفية النتائج' : 'Filters'}</h3>
              </div>
              {(selectedBrands.length > 0 || selectedCategory !== 'all' || priceMin > 0 || priceMax < 120000 || inStockOnly) && (
                <button
                  onClick={clearAllFilters}
                  className="text-[12px] font-bold text-red-600 hover:underline"
                >
                  {isRtl ? 'إعادة ضبط' : 'Clear All'}
                </button>
              )}
            </div>

            {/* Brand Filter */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="font-bold text-gray-800 text-[13px]">{isRtl ? 'الماركة المصنعة' : 'Brand'}</h4>
                {selectedBrands.length > 0 && (
                  <button
                    onClick={() => setSelectedBrands([])}
                    className="text-[11px] text-hub-blue hover:underline font-semibold"
                  >
                    {isRtl ? 'إلغاء التحديد' : 'Clear'}
                  </button>
                )}
              </div>
              <div className="relative">
                <input
                  type="text"
                  value={brandSearch}
                  onChange={(e) => setBrandSearch(e.target.value)}
                  placeholder={isRtl ? 'ابحث عن علامة تجارية...' : 'Search brand...'}
                  className="w-full px-3 py-1.5 text-[12px] border border-gray-200 rounded-xl focus:outline-none focus:border-hub-blue pr-8 rtl:pr-3 rtl:pl-8"
                />
                <Search className="w-3.5 h-3.5 text-gray-400 absolute right-2.5 rtl:right-auto rtl:left-2.5 top-2.5" />
              </div>
              <div className="space-y-1.5 max-h-52 overflow-y-auto pr-1">
                {dynamicBrands
                  .filter(b => b.name.toLowerCase().includes(brandSearch.toLowerCase()))
                  .map(b => {
                    const isChecked = selectedBrands.includes(b.id.toLowerCase());
                    return (
                      <label
                        key={b.id}
                        className="flex items-center justify-between text-[13px] text-gray-700 hover:text-hub-blue cursor-pointer p-1 rounded-lg hover:bg-slate-50 transition-colors"
                      >
                        <div className="flex items-center gap-2.5">
                          <input
                            type="checkbox"
                            checked={isChecked}
                            onChange={() => {
                              setSelectedBrands(prev =>
                                isChecked ? prev.filter(x => x !== b.id.toLowerCase()) : [...prev, b.id.toLowerCase()]
                              );
                            }}
                            className="rounded text-hub-blue focus:ring-hub-blue w-4 h-4 border-gray-300 cursor-pointer"
                          />
                          <span className="font-medium">{b.name}</span>
                        </div>
                        <span className="text-[11px] text-slate-400 font-mono">({b.count})</span>
                      </label>
                    );
                  })}
              </div>
            </div>

            {/* Price Range Slider & Numeric Inputs */}
            <div className="space-y-3.5 border-t border-gray-100 pt-4">
              <div className="flex items-center justify-between">
                <h4 className="font-bold text-gray-800 text-[13px]">{isRtl ? 'نطاق السعر (ج.م)' : 'Price Range (EGP)'}</h4>
                <span className="text-[11px] font-bold text-hub-blue font-mono">
                  {formatPrice(priceMin)} - {formatPrice(priceMax)}
                </span>
              </div>
              <input
                type="range"
                min={0}
                max={120000}
                step={1000}
                value={priceMax}
                onChange={(e) => setPriceMax(Number(e.target.value))}
                className="w-full accent-hub-blue cursor-pointer"
              />
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[10px] text-gray-400 font-semibold block mb-1">{isRtl ? 'من (ج.م)' : 'Min (EGP)'}</label>
                  <input
                    type="number"
                    value={priceMin}
                    min={0}
                    max={priceMax}
                    step={500}
                    onChange={(e) => setPriceMin(Math.max(0, Number(e.target.value)))}
                    className="w-full px-2.5 py-1.5 text-[12px] font-mono font-bold border border-gray-200 rounded-xl focus:outline-none focus:border-hub-blue"
                  />
                </div>
                <div>
                  <label className="text-[10px] text-gray-400 font-semibold block mb-1">{isRtl ? 'إلى (ج.م)' : 'Max (EGP)'}</label>
                  <input
                    type="number"
                    value={priceMax}
                    min={priceMin}
                    max={150000}
                    step={500}
                    onChange={(e) => setPriceMax(Number(e.target.value))}
                    className="w-full px-2.5 py-1.5 text-[12px] font-mono font-bold border border-gray-200 rounded-xl focus:outline-none focus:border-hub-blue"
                  />
                </div>
              </div>
            </div>

            {/* In Stock Toggle */}
            <div className="border-t border-gray-100 pt-4">
              <label className="flex items-center justify-between text-[13px] font-semibold text-gray-800 cursor-pointer p-1 rounded-lg hover:bg-slate-50 transition-colors">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                  <span>{isRtl ? 'المتوفر في المخزن فقط' : 'In Stock Only'}</span>
                </div>
                <input
                  type="checkbox"
                  checked={inStockOnly}
                  onChange={(e) => setInStockOnly(e.target.checked)}
                  className="rounded text-hub-blue focus:ring-hub-blue w-4 h-4 border-gray-300 cursor-pointer"
                />
              </label>
            </div>
          </aside>

          {/* Mobile Filter Drawer */}
          {mobileFilterOpen && (
            <div className="fixed inset-0 z-50 lg:hidden flex">
              <div
                className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity"
                onClick={() => setMobileFilterOpen(false)}
              />
              <div className="relative w-full max-w-xs sm:max-w-sm bg-white h-full ml-auto rtl:mr-auto rtl:ml-0 flex flex-col shadow-2xl z-10">
                {/* Header */}
                <div className="p-4 border-b border-gray-100 flex items-center justify-between bg-slate-50/50">
                  <div className="flex items-center gap-2">
                    <SlidersHorizontal className="w-4 h-4 text-hub-blue" />
                    <h3 className="font-extrabold text-gray-900 text-[15px]">{isRtl ? 'فلاتر المنتجات' : 'Product Filters'}</h3>
                  </div>
                  <div className="flex items-center gap-3">
                    <button
                      onClick={clearAllFilters}
                      className="text-[12px] font-bold text-hub-blue hover:underline"
                    >
                      {isRtl ? 'إعادة ضبط' : 'Reset'}
                    </button>
                    <button
                      onClick={() => setMobileFilterOpen(false)}
                      className="p-1 text-gray-500 hover:text-gray-900"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>
                </div>

                {/* Body */}
                <div className="p-5 overflow-y-auto space-y-6 flex-1">
                  {/* Brand Filter */}
                  <div className="space-y-3">
                    <h4 className="font-bold text-gray-800 text-[13px]">{isRtl ? 'الماركة المصنعة' : 'Brand'}</h4>
                    <div className="relative">
                      <input
                        type="text"
                        value={brandSearch}
                        onChange={(e) => setBrandSearch(e.target.value)}
                        placeholder={isRtl ? 'ابحث عن علامة تجارية...' : 'Search brand...'}
                        className="w-full px-3 py-2 text-[12px] border border-gray-200 rounded-xl focus:outline-none focus:border-hub-blue pr-8 rtl:pr-3 rtl:pl-8"
                      />
                      <Search className="w-3.5 h-3.5 text-gray-400 absolute right-2.5 rtl:right-auto rtl:left-2.5 top-3" />
                    </div>
                    <div className="space-y-2 max-h-48 overflow-y-auto">
                      {dynamicBrands
                        .filter(b => b.name.toLowerCase().includes(brandSearch.toLowerCase()))
                        .map(b => {
                          const isChecked = selectedBrands.includes(b.id.toLowerCase());
                          return (
                            <label
                              key={b.id}
                              className="flex items-center justify-between text-[13px] text-gray-700 hover:text-hub-blue cursor-pointer"
                            >
                              <div className="flex items-center gap-2.5">
                                <input
                                  type="checkbox"
                                  checked={isChecked}
                                  onChange={() => {
                                    setSelectedBrands(prev =>
                                      isChecked ? prev.filter(x => x !== b.id.toLowerCase()) : [...prev, b.id.toLowerCase()]
                                    );
                                  }}
                                  className="rounded text-hub-blue focus:ring-hub-blue w-4 h-4 border-gray-300"
                                />
                                <span>{b.name}</span>
                              </div>
                              <span className="text-[11px] text-slate-400 font-mono">({b.count})</span>
                            </label>
                          );
                        })}
                    </div>
                  </div>

                  {/* Price Slider & Inputs */}
                  <div className="space-y-3.5 border-t border-gray-100 pt-4">
                    <div className="flex items-center justify-between">
                      <h4 className="font-bold text-gray-800 text-[13px]">{isRtl ? 'نطاق السعر' : 'Price Range'}</h4>
                      <span className="text-[11px] font-bold text-hub-blue font-mono">
                        {formatPrice(priceMin)} - {formatPrice(priceMax)}
                      </span>
                    </div>
                    <input
                      type="range"
                      min={0}
                      max={120000}
                      step={1000}
                      value={priceMax}
                      onChange={(e) => setPriceMax(Number(e.target.value))}
                      className="w-full accent-hub-blue cursor-pointer"
                    />
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="text-[10px] text-gray-400 font-semibold block mb-1">{isRtl ? 'من (ج.م)' : 'Min'}</label>
                        <input
                          type="number"
                          value={priceMin}
                          min={0}
                          max={priceMax}
                          step={500}
                          onChange={(e) => setPriceMin(Math.max(0, Number(e.target.value)))}
                          className="w-full px-2.5 py-1.5 text-[12px] font-mono font-bold border border-gray-200 rounded-xl focus:outline-none focus:border-hub-blue"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] text-gray-400 font-semibold block mb-1">{isRtl ? 'إلى (ج.م)' : 'Max'}</label>
                        <input
                          type="number"
                          value={priceMax}
                          min={priceMin}
                          max={150000}
                          step={500}
                          onChange={(e) => setPriceMax(Number(e.target.value))}
                          className="w-full px-2.5 py-1.5 text-[12px] font-mono font-bold border border-gray-200 rounded-xl focus:outline-none focus:border-hub-blue"
                        />
                      </div>
                    </div>
                  </div>

                  {/* In Stock Toggle */}
                  <div className="border-t border-gray-100 pt-4">
                    <label className="flex items-center justify-between text-[13px] font-semibold text-gray-800 cursor-pointer">
                      <div className="flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                        <span>{isRtl ? 'المتوفر في المخزن فقط' : 'In Stock Only'}</span>
                      </div>
                      <input
                        type="checkbox"
                        checked={inStockOnly}
                        onChange={(e) => setInStockOnly(e.target.checked)}
                        className="rounded text-hub-blue focus:ring-hub-blue w-4 h-4 border-gray-300"
                      />
                    </label>
                  </div>
                </div>

                {/* Footer */}
                <div className="p-4 border-t border-gray-100 bg-slate-50/50">
                  <button
                    onClick={() => setMobileFilterOpen(false)}
                    className="w-full bg-hub-blue hover:bg-blue-700 text-white font-bold text-[13px] py-3 rounded-xl transition-colors shadow-sm"
                  >
                    {isRtl ? `تطبيق الفلاتر (${filteredProducts.length} منتج)` : `Apply Filters (${filteredProducts.length} items)`}
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Right Products Area (Span 3 Cols) */}
          <div className="lg:col-span-3 space-y-4">
            {/* Active Search Notification Banner */}
            {queryParam && (
              <div className="bg-blue-50/90 border border-blue-200/80 rounded-2xl p-3.5 flex items-center justify-between gap-3 shadow-xs">
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="w-8 h-8 rounded-lg bg-blue-600 text-white flex items-center justify-center shrink-0">
                    <Search className="w-4 h-4" />
                  </div>
                  <div className="min-w-0">
                    <div className="text-[13px] text-gray-700 flex items-center gap-1.5 flex-wrap">
                      <span>{isRtl ? 'نتائج البحث عن:' : 'Search results for:'}</span>
                      <span className="font-bold text-blue-700 bg-blue-100/80 px-2 py-0.5 rounded-md text-[13px]">
                        &ldquo;{queryParam}&rdquo;
                      </span>
                    </div>
                    <span className="text-[11px] text-gray-500">
                      {isRtl
                        ? `تم العثور على ${filteredProducts.length} منتج يطابق بحثك`
                        : `Found ${filteredProducts.length} matching products`}
                    </span>
                  </div>
                </div>

                <button
                  onClick={() => {
                    const params = new URLSearchParams(searchParams.toString());
                    params.delete('q');
                    const qs = params.toString();
                    router.push(qs ? `/products?${qs}` : '/products');
                  }}
                  className="shrink-0 flex items-center gap-1.5 text-[12px] font-bold text-blue-700 hover:text-blue-900 bg-white border border-blue-200 hover:bg-blue-50 px-3 py-1.5 rounded-xl transition-colors shadow-2xs"
                >
                  <X className="w-3.5 h-3.5" />
                  <span>{isRtl ? 'إلغاء البحث' : 'Clear Search'}</span>
                </button>
              </div>
            )}

            {/* Active Filter Tags Row */}
            {(selectedCategory !== 'all' || selectedBrands.length > 0 || priceMin > 0 || priceMax < 120000 || inStockOnly) && (
              <div className="flex flex-wrap items-center gap-2 bg-white p-3 rounded-2xl border border-gray-200 shadow-2xs">
                <span className="text-[12px] font-semibold text-gray-500">{isRtl ? 'الفلاتر المطبقة:' : 'Active Filters:'}</span>
                {selectedCategory !== 'all' && currentCategoryObj && (
                  <button
                    onClick={() => setSelectedCategory('all')}
                    className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-blue-50 text-blue-700 text-[11px] font-bold border border-blue-200/70 hover:bg-blue-100 transition-colors"
                  >
                    <span>{isRtl ? currentCategoryObj.nameAr : currentCategoryObj.name}</span>
                    <X className="w-3 h-3" />
                  </button>
                )}
                {selectedBrands.map(bId => {
                  const bObj = dynamicBrands.find(b => b.id.toLowerCase() === bId.toLowerCase());
                  return (
                    <button
                      key={bId}
                      onClick={() => setSelectedBrands(prev => prev.filter(x => x !== bId))}
                      className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-blue-50 text-blue-700 text-[11px] font-bold border border-blue-200/70 hover:bg-blue-100 transition-colors"
                    >
                      <span>{bObj ? bObj.name : bId}</span>
                      <X className="w-3 h-3" />
                    </button>
                  );
                })}
                {(priceMin > 0 || priceMax < 120000) && (
                  <button
                    onClick={() => { setPriceMin(0); setPriceMax(120000); }}
                    className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-blue-50 text-blue-700 text-[11px] font-bold border border-blue-200/70 hover:bg-blue-100 transition-colors"
                  >
                    <span>{formatPrice(priceMin)} - {formatPrice(priceMax)}</span>
                    <X className="w-3 h-3" />
                  </button>
                )}
                {inStockOnly && (
                  <button
                    onClick={() => setInStockOnly(false)}
                    className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-700 text-[11px] font-bold border border-emerald-200/70 hover:bg-emerald-100 transition-colors"
                  >
                    <span>{isRtl ? 'المتوفر بالمخزن' : 'In Stock'}</span>
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

            {/* Sort & Display Toolbar */}
            <div className="bg-white rounded-2xl border border-gray-200 p-3 sm:p-3.5 flex flex-wrap items-center justify-between gap-3 shadow-2xs">
              <div className="flex items-center gap-2">
                {/* Mobile Filter Drawer Trigger */}
                <button
                  type="button"
                  onClick={() => setMobileFilterOpen(true)}
                  className="lg:hidden flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 text-blue-700 rounded-xl text-[12px] font-bold border border-blue-200 hover:bg-blue-100 transition-colors"
                >
                  <SlidersHorizontal className="w-3.5 h-3.5" />
                  <span>{isRtl ? 'الفلاتر' : 'Filters'}</span>
                  {(selectedCategory !== 'all' || selectedBrands.length > 0 || inStockOnly) && (
                    <span className="w-2 h-2 rounded-full bg-blue-600" />
                  )}
                </button>

                <div className="flex items-center gap-1.5">
                  <span className="text-xs sm:text-[13px] font-medium text-gray-500 hidden sm:inline">{isRtl ? 'ترتيب حسب:' : 'Sort by:'}</span>
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value as any)}
                    className="border border-gray-200 rounded-xl px-2.5 sm:px-3 py-1.5 text-xs font-bold text-gray-800 focus:outline-none focus:border-hub-blue cursor-pointer bg-slate-50/50"
                  >
                    <option value="best">{isRtl ? 'الأفضل تطابقاً' : 'Best Match'}</option>
                    <option value="price-asc">{isRtl ? 'السعر: من الأقل للأعلى' : 'Price: Low to High'}</option>
                    <option value="price-desc">{isRtl ? 'السعر: من الأعلى للأقل' : 'Price: High to Low'}</option>
                  </select>
                </div>
              </div>

              <div className="flex items-center gap-1 bg-gray-100 p-1 rounded-lg">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-1.5 rounded-md transition-colors ${
                    viewMode === 'grid' ? 'bg-white text-hub-blue shadow-sm' : 'text-gray-500 hover:text-gray-900'
                  }`}
                  aria-label="Grid View"
                >
                  <LayoutGrid className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`p-1.5 rounded-md transition-colors ${
                    viewMode === 'list' ? 'bg-white text-hub-blue shadow-sm' : 'text-gray-500 hover:text-gray-900'
                  }`}
                  aria-label="List View"
                >
                  <List className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Products Grid */}
            {isCatalogLoading && filteredProducts.length === 0 ? (
              viewMode === 'grid' ? (
                <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4">
                  {[...Array(8)].map((_, i) => (
                    <ProductCardSkeleton key={i} viewMode="grid" />
                  ))}
                </div>
              ) : (
                <div className="space-y-3">
                  {[...Array(6)].map((_, i) => (
                    <ProductCardSkeleton key={i} viewMode="list" />
                  ))}
                </div>
              )
            ) : filteredProducts.length === 0 ? (
              <div className="bg-white rounded-2xl border border-gray-200 p-12 text-center space-y-3">
                <div className="w-16 h-16 bg-blue-50 text-hub-blue rounded-full flex items-center justify-center mx-auto text-2xl font-bold">
                  🔍
                </div>
                <h3 className="text-lg font-bold text-gray-900">
                  {isRtl ? 'لا توجد منتجات مطابقة لخيارات البحث المحددة' : 'No products match your selected filters'}
                </h3>
                <button
                  onClick={() => {
                    clearAllFilters();
                    if (queryParam) {
                      router.push('/products');
                    }
                  }}
                  className="inline-block bg-hub-blue text-white text-[13px] font-bold px-5 py-2.5 rounded-xl hover:bg-hub-blue-dark transition-colors shadow-sm"
                >
                  {isRtl ? 'مسح جميع الفلاتر والبحث' : 'Clear All Filters & Search'}
                </button>
              </div>
            ) : viewMode === 'grid' ? (
              <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4">
                {filteredProducts.map(product => (
                  <ProductCard key={product.id} product={product} viewMode="grid" />
                ))}
              </div>
            ) : (
              <div className="space-y-3">
                {filteredProducts.map(product => (
                  <ProductCard key={product.id} product={product} viewMode="list" />
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Brand Row & Trust Strip */}
        <div className="mt-8 space-y-4">
          <BrandRow />
          <TrustBadgesRow />
        </div>
      </div>
    </div>
  );
}

export default function ProductsPage() {
  return (
    <Suspense
      fallback={
        <div className="max-w-[1536px] mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4">
            {[...Array(8)].map((_, i) => (
              <ProductCardSkeleton key={i} viewMode="grid" />
            ))}
          </div>
        </div>
      }
    >
      <ProductsCatalog />
    </Suspense>
  );
}
