'use client';

import React, { useState, useMemo, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { ProductCard } from '@/components/product/ProductCard';
import { ProductDetailSkeleton } from '@/components/product/ProductDetailSkeleton';
import { TrustBadgesRow } from '@/components/home/TrustBadgesRow';
import { DeliveryEstimator } from '@/components/product/DeliveryEstimator';
import { StickyAddToCart } from '@/components/product/StickyAddToCart';
import { generateProductJsonLd, generateBreadcrumbJsonLd } from '@/lib/seo';
import { useStore } from '@/context/StoreContext';
import { Product } from '@/types';
import {
  ChevronRight,
  ShieldCheck,
  RotateCcw,
  Truck,
  Lock,
  Heart,
  Shuffle,
  ShoppingCart,
  Plus,
  Minus,
  CheckCircle2,
  FileText,
  Printer
} from 'lucide-react';

export default function ProductDetailPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const { id } = params;

  const {
    language,
    isRtl,
    formatPrice,
    addToCart,
    toggleWishlist,
    isInWishlist,
    toggleCompare,
    isInCompare,
    showToast,
    products
  } = useStore();

  const [dbProduct, setDbProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/products/${id}`)
      .then(res => res.json())
      .then(data => {
        if (data.success && data.product) {
          setDbProduct(data.product);
        }
      })
      .catch(err => console.warn(err))
      .finally(() => setLoading(false));
  }, [id]);

  const product = dbProduct || products.find(p => p.id === id);

  if (loading && !product) {
    return <ProductDetailSkeleton />;
  }

  if (!product) {
    return (
      <div className="max-w-[1536px] mx-auto px-4 py-16 text-center">
        <h2 className="text-xl font-bold text-gray-800 mb-2">
          {isRtl ? 'المنتج غير موجود' : 'Product Not Found'}
        </h2>
        <Link href="/products" className="text-hub-blue hover:underline text-sm font-semibold">
          {isRtl ? 'العودة للمنتجات' : 'Back to products'}
        </Link>
      </div>
    );
  }

  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [selectedRam, setSelectedRam] = useState('16GB');
  const [selectedStorage, setSelectedStorage] = useState('512GB SSD');
  const [selectedWarranty, setSelectedWarranty] = useState('1 Year');
  const [quantity, setQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState<'desc' | 'specs' | 'shipping'>('desc');

  // Dynamic Product Variants
  const [selectedVariantId, setSelectedVariantId] = useState<string | null>(null);
  const variantsList: any[] = (product as any)?.variants || [];
  const currentVariant = variantsList.find((v: any) => v.id === selectedVariantId) || (variantsList.length > 0 ? variantsList[0] : null);

  // Dynamic Price
  const calculatedUnitPrice = useMemo(() => {
    let price = currentVariant ? currentVariant.price : product.price;
    const ramOpt = product.ramOptions?.find(r => r.label === selectedRam);
    if (ramOpt) price += ramOpt.priceDelta;
    const storageOpt = product.storageOptions?.find(s => s.label === selectedStorage);
    if (storageOpt) price += storageOpt.priceDelta;
    const warrantyOpt = product.warrantyOptions?.find(w => w.label === selectedWarranty);
    if (warrantyOpt) price += warrantyOpt.priceDelta;
    return price;
  }, [product, currentVariant, selectedRam, selectedStorage, selectedWarranty]);

  // Grouped specifications by Attribute Group
  const groupedSpecs = useMemo(() => {
    const groups: Record<
      string,
      {
        groupName: string;
        groupNameAr: string;
        displayOrder: number;
        items: { name: string; nameAr: string; value: string; unit?: string | null }[];
      }
    > = {};

    const attrVals = (product as any)?.attributeValues;
    if (Array.isArray(attrVals) && attrVals.length > 0) {
      attrVals.forEach((av: any) => {
        const group = av.attribute?.group;
        const gName = group?.name || 'General Specifications';
        const gNameAr = group?.nameAr || 'المواصفات العامة';
        const gOrder = group?.displayOrder ?? 99;

        if (!groups[gName]) {
          groups[gName] = { groupName: gName, groupNameAr: gNameAr, displayOrder: gOrder, items: [] };
        }

        const val =
          av.textValue ||
          (av.numberValue !== null && av.numberValue !== undefined ? String(av.numberValue) : null) ||
          (av.booleanValue !== null && av.booleanValue !== undefined ? (av.booleanValue ? 'Yes' : 'No') : null);

        if (val) {
          groups[gName].items.push({
            name: av.attribute?.name || 'Specification',
            nameAr: av.attribute?.nameAr || av.attribute?.name || 'المواصفة',
            value: val,
            unit: av.attribute?.unit,
          });
        }
      });
    }

    // Fallback: If legacy specs exists, add non-duplicated fields to General
    const legacySpecs = isRtl && product.specsAr ? product.specsAr : product.specs;
    if (legacySpecs && Object.keys(legacySpecs).length > 0) {
      const generalKey = 'General Specifications';
      if (!groups[generalKey]) {
        groups[generalKey] = {
          groupName: generalKey,
          groupNameAr: 'المواصفات العامة',
          displayOrder: 100,
          items: [],
        };
      }
      Object.entries(legacySpecs).forEach(([key, val]) => {
        const alreadyInAnyGroup = Object.values(groups).some((g) =>
          g.items.some((i) => i.name.toLowerCase() === key.toLowerCase() || i.nameAr === key)
        );
        if (!alreadyInAnyGroup && val) {
          groups[generalKey].items.push({
            name: key,
            nameAr: key,
            value: String(val),
          });
        }
      });
      if (groups[generalKey].items.length === 0) {
        delete groups[generalKey];
      }
    }

    return Object.values(groups).sort((a, b) => a.displayOrder - b.displayOrder);
  }, [product, isRtl]);

  const handleAddToCart = () => {
    addToCart(product, quantity, {
      ram: selectedRam,
      storage: selectedStorage,
      warranty: selectedWarranty,
      unitPrice: calculatedUnitPrice
    });
  };

  const handleBuyNow = () => {
    addToCart(product, quantity, {
      ram: selectedRam,
      storage: selectedStorage,
      warranty: selectedWarranty,
      unitPrice: calculatedUnitPrice
    });
    router.push('/checkout');
  };

  const isWishlisted = isInWishlist(product.id);
  const isCompared = isInCompare(product.id);
  const relatedProducts = products.filter(p => p.id !== product.id).slice(0, 5);

  const title = isRtl ? (product.nameAr || product.name) : product.name;
  const description = isRtl ? (product.descriptionAr || product.description) : product.description;

  // Single-level category breadcrumb
  const categorySlug = product.categorySlug || 'laptops';
  const categoryName = isRtl ? ((product as any).categoryNameAr || product.category) : product.category;
  const productJsonLd = generateProductJsonLd(product);
  const breadcrumbsJsonLd = generateBreadcrumbJsonLd([
    { name: 'Home', url: '/' },
    { name: product.category, url: `/category/${categorySlug}` },
    { name: product.name, url: `/products/${product.id}` },
  ]);

  return (
    <div className="py-4">
      {/* Schema.org Structured Data for Google Rich Snippets */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(productJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbsJsonLd) }}
      />

      <div className="max-w-[1536px] mx-auto px-4 sm:px-6 space-y-6">
        {/* Breadcrumbs - Strictly Single Level: Home > Category > Product */}
        <div className="flex items-center gap-2 text-[12px] text-gray-500 overflow-x-auto scrollbar-none">
          <Link href="/" className="hover:text-hub-blue">{isRtl ? 'الرئيسية' : 'Home'}</Link>
          <ChevronRight className="w-3 h-3 rtl:rotate-180 text-gray-400" />
          <Link href={`/category/${categorySlug}`} className="hover:text-hub-blue font-medium">
            {categoryName}
          </Link>
          <ChevronRight className="w-3 h-3 rtl:rotate-180 text-gray-400" />
          <span className="font-semibold text-gray-900 truncate">{title}</span>
        </div>

        {/* Main Product Presentation */}
        <div className="bg-white rounded-2xl border border-gray-200 p-5 sm:p-8 shadow-sm grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Image Gallery (6 Cols) */}
          <div className="lg:col-span-6 flex flex-col-reverse sm:flex-row gap-4">
            {/* Thumbnails */}
            <div className="flex sm:flex-col gap-2 overflow-x-auto sm:overflow-y-auto max-h-96 scroll-smooth touch-pan-x [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden flex-shrink-0 py-1">
              {product.images.map((img, i) => (
                <button
                  key={i}
                  onClick={() => setSelectedImageIndex(i)}
                  className={`w-14 h-14 sm:w-20 sm:h-20 rounded-xl border-2 p-1 relative overflow-hidden bg-white flex-shrink-0 transition-all active:scale-95 ${
                    selectedImageIndex === i ? 'border-hub-blue shadow-sm' : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <Image src={img} alt={`Thumb ${i}`} fill className="object-contain p-1 mix-blend-multiply" />
                </button>
              ))}
            </div>

            {/* Active Big Image */}
            <div className="flex-1 aspect-square bg-white rounded-2xl border border-gray-200 relative overflow-hidden p-6 flex items-center justify-center group">
              {product.discountPercentage && (
                <div className="absolute top-4 left-4 rtl:left-auto rtl:right-4 bg-hub-red text-white text-[12px] font-black px-2.5 py-1 rounded shadow">
                  -{product.discountPercentage}% OFF
                </div>
              )}

              <Image
                src={product.images[selectedImageIndex] || product.thumbnail}
                alt={title}
                fill
                priority
                className="object-contain p-4 mix-blend-multiply group-hover:scale-105 transition-transform duration-300"
              />
            </div>
          </div>

          {/* Right Column: Info, Variants, Delivery & Actions (6 Cols) */}
          <div className="lg:col-span-6 space-y-5">
            <div>
              <div className="flex items-center justify-between gap-2 mb-1.5">
                <span className="inline-block bg-hub-blue text-white text-[11px] font-black px-3 py-0.5 rounded uppercase tracking-wider">
                  {product.brand}
                </span>
                <span className="text-[12px] font-mono text-gray-400">
                  SKU: {currentVariant?.sku || product.sku}
                </span>
              </div>

              <h1 className="text-xl sm:text-2xl font-black text-gray-900 leading-snug">
                {title}
              </h1>

              {/* Stock */}
              <div className="flex flex-wrap items-center gap-4 mt-2 text-[12px]">

                <div className="flex items-center gap-1.5 text-emerald-600 font-bold">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                  <span>
                    {(currentVariant ? currentVariant.stockCount > 0 : product.inStock)
                      ? (isRtl ? 'متوفر في المخزن • شحن سريع' : 'In Stock • Fast Delivery')
                      : (isRtl ? 'غير متوفر حالياً' : 'Out of Stock')}
                  </span>
                </div>
              </div>
            </div>

            {/* Pricing Box */}
            <div className="bg-blue-50/50 rounded-2xl p-4 border border-blue-100 space-y-1">
              <div className="flex items-baseline gap-3">
                <span className="text-2xl sm:text-3xl font-black text-hub-blue font-mono">
                  {formatPrice(calculatedUnitPrice)}
                </span>
                {product.oldPrice && (
                  <span className="text-[14px] text-gray-400 line-through font-medium">
                    {formatPrice(product.oldPrice)}
                  </span>
                )}
                {product.oldPrice && product.oldPrice > calculatedUnitPrice && (
                  <span className="text-[11px] font-bold text-hub-red bg-red-100 px-2 py-0.5 rounded">
                    {isRtl ? `وفر ${formatPrice(product.oldPrice - calculatedUnitPrice)}` : `Save ${formatPrice(product.oldPrice - calculatedUnitPrice)}`}
                  </span>
                )}
              </div>
              <span className="text-[11px] text-emerald-600 font-bold block">
                {isRtl ? '✓ منتج أصلي 100% بضمان محلي معتمد وفاتورة رسمية' : '✓ Genuine hardware with official local warranty and receipt'}
              </span>
            </div>

            {/* Dynamic Product Variants Selector */}
            {variantsList.length > 0 && (
              <div className="space-y-2 border-b border-gray-100 pb-3">
                <label className="text-[13px] font-bold text-gray-800 block">
                  {isRtl ? 'الخيارات المتاحة:' : 'Available Configurations:'}
                </label>
                <div className="flex flex-wrap gap-2">
                  {variantsList.map((v) => {
                    const isSelected = (currentVariant?.id || variantsList[0]?.id) === v.id;
                    const optLabels = Object.entries(v.options || {})
                      .map(([k, val]) => `${val}`)
                      .join(' / ') || v.sku;

                    return (
                      <button
                        key={v.id}
                        type="button"
                        onClick={() => setSelectedVariantId(v.id)}
                        className={`px-3.5 py-2 rounded-xl text-[12px] font-bold border transition-all ${
                          isSelected
                            ? 'bg-hub-blue text-white border-hub-blue shadow-xs'
                            : 'bg-white text-gray-700 border-gray-200 hover:border-hub-blue'
                        }`}
                      >
                        <span>{optLabels}</span>
                        {v.price !== product.price && (
                          <span className="text-[10px] ml-1.5 opacity-80 font-mono">
                            ({formatPrice(v.price)})
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* RAM Options (fallback if no dynamic variants) */}
            {variantsList.length === 0 && product.ramOptions && (
              <div className="space-y-1.5">
                <label className="text-[13px] font-bold text-gray-800 block">
                  {isRtl ? 'الذاكرة العشوائية (RAM):' : 'RAM:'}
                </label>
                <div className="flex flex-wrap gap-2">
                  {product.ramOptions.map(r => (
                    <button
                      key={r.label}
                      type="button"
                      onClick={() => setSelectedRam(r.label)}
                      className={`px-4 py-2 rounded-xl text-[12px] font-bold border transition-all ${
                        selectedRam === r.label
                          ? 'bg-hub-blue text-white border-hub-blue shadow-sm'
                          : 'bg-white text-gray-700 border-gray-200 hover:border-hub-blue'
                      }`}
                    >
                      {r.label}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Storage Options (fallback if no dynamic variants) */}
            {variantsList.length === 0 && product.storageOptions && (
              <div className="space-y-1.5">
                <label className="text-[13px] font-bold text-gray-800 block">
                  {isRtl ? 'سعة التخزين (Storage):' : 'Storage:'}
                </label>
                <div className="flex flex-wrap gap-2">
                  {product.storageOptions.map(s => (
                    <button
                      key={s.label}
                      type="button"
                      onClick={() => setSelectedStorage(s.label)}
                      className={`px-4 py-2 rounded-xl text-[12px] font-bold border transition-all ${
                        selectedStorage === s.label
                          ? 'bg-hub-blue text-white border-hub-blue shadow-sm'
                          : 'bg-white text-gray-700 border-gray-200 hover:border-hub-blue'
                      }`}
                    >
                      {s.label}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Delivery Estimator Widget */}
            <DeliveryEstimator />

            {/* Purchase CTA Buttons */}
            <div className="space-y-3 pt-2">
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 sm:gap-3">
                <div className="flex items-center justify-between sm:justify-center border border-gray-300 rounded-xl bg-white p-1 shrink-0">
                  <button
                    type="button"
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="p-2 hover:bg-gray-100 text-gray-600 rounded-lg transition-colors"
                  >
                    <Minus className="w-4 h-4" />
                  </button>
                  <span className="w-12 text-center font-bold text-[14px] text-gray-900 font-mono">
                    {quantity}
                  </span>
                  <button
                    type="button"
                    onClick={() => setQuantity(quantity + 1)}
                    className="p-2 hover:bg-gray-100 text-gray-600 rounded-lg transition-colors"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>

                <div className="flex items-center gap-2 flex-1">
                  <button
                    type="button"
                    onClick={handleAddToCart}
                    className="flex-1 border-2 border-hub-blue text-hub-blue hover:bg-blue-50 font-bold text-xs sm:text-[14px] py-3 px-3 sm:px-4 rounded-xl flex items-center justify-center gap-1.5 sm:gap-2 transition-all active:scale-95 whitespace-nowrap"
                  >
                    <ShoppingCart className="w-4 h-4 shrink-0" />
                    <span>{isRtl ? 'أضف للسلة' : 'Add to Cart'}</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleBuyNow}
                    className="flex-1 bg-hub-blue hover:bg-hub-blue-dark text-white font-bold text-xs sm:text-[14px] py-3 px-3 sm:px-4 rounded-xl shadow-md flex items-center justify-center gap-1.5 sm:gap-2 transition-all active:scale-95 whitespace-nowrap"
                  >
                    <span>{isRtl ? 'اشتري الآن' : 'Buy Now'}</span>
                  </button>
                </div>
              </div>

              {/* Wishlist / Compare */}
              <div className="flex items-center gap-4 text-[12px] text-gray-600 pt-1">
                <button
                  onClick={() => toggleWishlist(product.id)}
                  className={`flex items-center gap-1.5 hover:text-red-500 transition-colors ${isWishlisted ? 'text-red-500 font-bold' : ''}`}
                >
                  <Heart className={`w-4 h-4 ${isWishlisted ? 'fill-red-500' : ''}`} />
                  <span>{isWishlisted ? (isRtl ? 'في المفضلة' : 'In Wishlist') : (isRtl ? 'إضافة للمفضلة' : 'Add to Wishlist')}</span>
                </button>

                <span className="text-gray-300">•</span>

                <button
                  onClick={() => toggleCompare(product.id)}
                  className={`flex items-center gap-1.5 hover:text-hub-blue transition-colors ${isCompared ? 'text-hub-blue font-bold' : ''}`}
                >
                  <Shuffle className="w-4 h-4" />
                  <span>{isCompared ? (isRtl ? 'في المقارنة' : 'In Compare') : (isRtl ? 'إضافة للمقارنة' : 'Compare')}</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Technical Specs & Description Tabs */}
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
          <div className="flex border-b border-gray-200 bg-gray-50/70 overflow-x-auto scrollbar-none">
            <button
              onClick={() => setActiveTab('desc')}
              className={`px-6 py-3.5 text-[14px] font-bold border-b-2 whitespace-nowrap transition-colors ${
                activeTab === 'desc' ? 'border-hub-blue text-hub-blue bg-white' : 'border-transparent text-gray-600 hover:text-gray-900'
              }`}
            >
              {isRtl ? 'الوصف' : 'Description'}
            </button>
            <button
              onClick={() => setActiveTab('specs')}
              className={`px-6 py-3.5 text-[14px] font-bold border-b-2 whitespace-nowrap transition-colors ${
                activeTab === 'specs' ? 'border-hub-blue text-hub-blue bg-white' : 'border-transparent text-gray-600 hover:text-gray-900'
              }`}
            >
              {isRtl ? 'المواصفات التقنية' : 'Technical Datasheet'}
            </button>
          </div>

          <div className="p-6 sm:p-8">
            {activeTab === 'desc' && (
              <div className="space-y-4 max-w-3xl">
                <p className="text-[14px] text-gray-700 leading-relaxed whitespace-pre-line">{description}</p>
              </div>
            )}

            {activeTab === 'specs' && (
              <div className="space-y-6">
                <div className="flex items-center justify-between pb-2 border-b border-gray-200">
                  <h3 className="font-bold text-gray-900 text-[15px]">
                    {isRtl ? 'جدول المواصفات التقنية' : 'Technical Specifications Matrix'}
                  </h3>
                  <button
                    onClick={() => window.print()}
                    className="inline-flex items-center gap-1.5 text-[12px] font-bold text-hub-blue hover:underline"
                  >
                    <Printer className="w-4 h-4" />
                    <span>{isRtl ? 'طباعة المواصفات' : 'Print Datasheet'}</span>
                  </button>
                </div>

                {groupedSpecs.length > 0 ? (
                  <div className="space-y-5">
                    {groupedSpecs.map((group) => (
                      <div
                        key={group.groupName}
                        className="border border-gray-200 rounded-2xl overflow-hidden bg-white shadow-2xs"
                      >
                        <div className="bg-slate-50 px-4 py-2.5 border-b border-gray-200 flex items-center justify-between">
                          <h4 className="font-bold text-[13px] text-slate-800 tracking-wide uppercase">
                            {isRtl ? group.groupNameAr : group.groupName}
                          </h4>
                          <span className="text-[11px] font-bold text-hub-blue font-mono bg-blue-50 px-2 py-0.5 rounded">
                            {group.items.length} {isRtl ? 'خاصية' : 'specs'}
                          </span>
                        </div>
                        <div className="overflow-x-auto">
                          <table className="w-full text-[13px] min-w-[280px]">
                            <tbody>
                              {group.items.map((item, idx) => (
                                <tr
                                  key={item.name}
                                  className={idx % 2 === 0 ? 'bg-white' : 'bg-slate-50/50'}
                                >
                                  <td className="py-2.5 px-4 font-bold text-gray-600 w-1/3 border-b border-gray-100 whitespace-nowrap">
                                    {isRtl ? item.nameAr : item.name}
                                  </td>
                                  <td className="py-2.5 px-4 text-gray-900 font-medium border-b border-gray-100 font-mono">
                                    {item.value}{' '}
                                    {item.unit ? (
                                      <span className="text-slate-500 text-xs">({item.unit})</span>
                                    ) : (
                                      ''
                                    )}
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="border border-gray-200 rounded-xl p-6 text-center text-slate-500 text-sm">
                    {isRtl ? 'لا توجد مواصفات فنية إضافية مسجلة' : 'No technical specifications recorded'}
                  </div>
                )}
              </div>
            )}

          </div>
        </div>

        {/* Related Products Carousel */}
        <div className="space-y-4 pt-4">
          <h3 className="text-xl font-bold text-gray-900">{isRtl ? 'منتجات ذات صلة قد تهمك' : 'Related Hardware Products'}</h3>
          <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4">
            {relatedProducts.map(prod => (
              <ProductCard key={prod.id} product={prod} />
            ))}
          </div>
        </div>

        <TrustBadgesRow />
      </div>

      {/* Sticky Add to Cart Bottom Bar */}
      <StickyAddToCart
        product={product}
        selectedRam={selectedRam}
        selectedStorage={selectedStorage}
        selectedWarranty={selectedWarranty}
        unitPrice={calculatedUnitPrice}
      />
    </div>
  );
}
