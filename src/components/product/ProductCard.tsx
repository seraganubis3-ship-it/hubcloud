'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Product } from '@/types';
import { useStore } from '@/context/StoreContext';
import { Heart, Shuffle, ShoppingCart, Eye, Check, ShieldCheck } from 'lucide-react';
import { QuickViewModal } from './QuickViewModal';

interface ProductCardProps {
  product: Product;
  viewMode?: 'grid' | 'list';
}

export const ProductCard: React.FC<ProductCardProps> = ({ product, viewMode = 'grid' }) => {
  const { isRtl, formatPrice, addToCart, toggleWishlist, isInWishlist, toggleCompare, isInCompare } = useStore();
  const [showQuickView, setShowQuickView] = useState(false);
  const [isAdded, setIsAdded] = useState(false);

  const isWishlisted = isInWishlist(product.id);
  const isCompared = isInCompare(product.id);

  const title = isRtl ? (product.nameAr || product.name) : product.name;

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    addToCart(product);
    setIsAdded(true);
    setTimeout(() => {
      setIsAdded(false);
    }, 1600);
  };

  // Extract key hardware spec pills for quick glance
  const specBadges = React.useMemo(() => {
    try {
      const parsedSpecs = typeof product.specs === 'string' ? JSON.parse(product.specs) : product.specs;
      if (!parsedSpecs) return [];
      const badges: string[] = [];
      if (parsedSpecs.Processor) {
        const p = parsedSpecs.Processor.split('(')[0].trim().replace('Intel Core ', '').replace('Apple ', '');
        badges.push(p);
      }
      if (parsedSpecs.RAM) {
        const r = parsedSpecs.RAM.split(' ')[0] + ' RAM';
        badges.push(r);
      }
      if (parsedSpecs.Storage) {
        const s = parsedSpecs.Storage.split(' ')[0] + ' ' + (parsedSpecs.Storage.includes('SSD') ? 'SSD' : '');
        badges.push(s.trim());
      }
      if (parsedSpecs['Wi-Fi Speed']) {
        badges.push(parsedSpecs['Wi-Fi Speed'].split(' ')[0]);
      }
      if (parsedSpecs['Print Speed']) {
        badges.push(parsedSpecs['Print Speed'].replace('Up to ', ''));
      }
      return badges.slice(0, 3);
    } catch {
      return [];
    }
  }, [product.specs]);

  if (viewMode === 'list') {
    return (
      <div className="bg-white rounded-2xl border border-slate-200/90 hover:border-blue-500/80 hover:shadow-md transition-all duration-300 p-4 flex flex-col sm:flex-row items-center gap-5 sm:gap-6 group">
        {/* Thumbnail & Badges */}
        <div className="relative w-full sm:w-52 h-52 flex-shrink-0 bg-slate-50/60 border border-slate-100 rounded-xl overflow-hidden flex items-center justify-center p-4">
          {product.discountPercentage && (
            <span className="absolute top-2.5 left-2.5 rtl:left-auto rtl:right-2.5 bg-hub-red text-white text-[11px] font-black px-2 py-0.5 rounded-md shadow-xs z-10">
              -{product.discountPercentage}%
            </span>
          )}
          {product.isBestSeller && (
            <span className="absolute top-2.5 right-2.5 rtl:right-auto rtl:left-2.5 bg-blue-600 text-white text-[10px] font-bold px-2 py-0.5 rounded-md shadow-xs z-10">
              {isRtl ? 'الأكثر طلباً' : 'Best Seller'}
            </span>
          )}
          <Link href={`/products/${product.id}`} className="w-full h-full relative block">
            <Image
              src={product.thumbnail || product.images[0]}
              alt={title}
              fill
              className="object-contain p-2 mix-blend-multiply group-hover:scale-105 transition-transform duration-300"
            />
          </Link>
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0 space-y-2.5 w-full">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-[11px] font-extrabold text-blue-600 tracking-wider uppercase bg-blue-50 px-2 py-0.5 rounded-md">
              {product.brand}
            </span>
            <span className="text-gray-300">•</span>
            <span className="text-[11px] text-gray-400 font-mono">SKU: {product.sku}</span>
            <span className="text-gray-300">•</span>
            <div className="flex items-center gap-1 text-[11px] text-slate-500 font-medium">
              <ShieldCheck className="w-3.5 h-3.5 text-blue-600" />
              <span>{isRtl ? 'ضمان محلي معتمد' : 'Official Warranty'}</span>
            </div>
          </div>

          <Link href={`/products/${product.id}`}>
            <h3 className="text-[15px] font-bold text-gray-900 group-hover:text-blue-600 transition-colors line-clamp-2 leading-snug">
              {title}
            </h3>
          </Link>

          <p className="text-[12px] text-gray-500 line-clamp-2 leading-relaxed">
            {isRtl ? product.descriptionAr : product.description}
          </p>

          {/* Micro-specs Badges */}
          {specBadges.length > 0 && (
            <div className="flex flex-wrap gap-1.5 pt-0.5">
              {specBadges.map((badge, idx) => (
                <span
                  key={idx}
                  className="px-2 py-0.5 bg-slate-100 text-slate-700 rounded-md text-[10px] font-semibold border border-slate-200/80"
                >
                  {badge}
                </span>
              ))}
            </div>
          )}

          {/* Stock */}
          <div className="flex items-center gap-4 text-[12px] pt-1">

            {product.inStock ? (
              <div className="flex items-center gap-1.5 text-[11px] text-emerald-600 font-semibold">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                <span>{isRtl ? 'متوفر للشحن الفوري' : 'In Stock'}</span>
              </div>
            ) : (
              <div className="flex items-center gap-1.5 text-[11px] text-amber-600 font-semibold">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-500"></span>
                <span>{isRtl ? 'طلب مسبق' : 'Pre-order'}</span>
              </div>
            )}
          </div>
        </div>

        {/* Pricing & CTA */}
        <div className="w-full sm:w-56 flex flex-col justify-between items-end border-t sm:border-t-0 sm:border-l rtl:sm:border-l-0 rtl:sm:border-r border-slate-100 pt-4 sm:pt-0 sm:px-4 space-y-3 shrink-0">
          <div className="text-end w-full">
            {product.oldPrice && (
              <span className="text-[12px] text-gray-400 line-through block font-medium">
                {formatPrice(product.oldPrice)}
              </span>
            )}
            <div className="text-[20px] font-black text-gray-900 tracking-tight">
              {formatPrice(product.price)}
            </div>
          </div>

          <div className="flex items-center gap-2 w-full">
            <button
              onClick={() => toggleWishlist(product.id)}
              title={isWishlisted ? (isRtl ? 'إزالة من المفضلة' : 'Remove from Wishlist') : (isRtl ? 'إضافة للمفضلة' : 'Add to Wishlist')}
              className={`p-2.5 rounded-xl border transition-colors ${
                isWishlisted ? 'border-red-200 bg-red-50 text-red-500' : 'border-slate-200 text-slate-600 hover:border-blue-500'
              }`}
            >
              <Heart className={`w-4 h-4 ${isWishlisted ? 'fill-red-500' : ''}`} />
            </button>

            <button
              onClick={handleAddToCart}
              className={`flex-1 font-bold text-[13px] py-2.5 px-4 rounded-xl flex items-center justify-center gap-2 transition-all shadow-sm active:scale-95 ${
                isAdded
                  ? 'bg-emerald-600 hover:bg-emerald-700 text-white'
                  : 'bg-hub-blue hover:bg-blue-700 text-white'
              }`}
            >
              {isAdded ? (
                <>
                  <Check className="w-4 h-4" />
                  <span>{isRtl ? 'تمت الإضافة ✓' : 'Added ✓'}</span>
                </>
              ) : (
                <>
                  <ShoppingCart className="w-4 h-4" />
                  <span>{isRtl ? 'أضف للسلة' : 'Add to Cart'}</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Grid View
  return (
    <div className="bg-white rounded-2xl border border-slate-200/90 hover:border-blue-500/80 hover:shadow-lg transition-all duration-300 p-2.5 sm:p-4 flex flex-col justify-between group relative">
      {/* Product Image Area - Fixed 1:1 Aspect Ratio with Consistent Framing */}
      <div className="relative w-full aspect-square bg-slate-50/60 rounded-xl border border-slate-100/80 overflow-hidden flex items-center justify-center mb-2.5 sm:mb-3 p-3 sm:p-4">
        {/* Discount Badge */}
        {product.discountPercentage && (
          <span className="absolute top-2 left-2 rtl:left-auto rtl:right-2 bg-hub-red text-white text-[10px] sm:text-[11px] font-black px-1.5 sm:px-2 py-0.5 rounded-md shadow-xs z-10">
            -{product.discountPercentage}%
          </span>
        )}

        {/* Status Badge */}
        {product.isNew && (
          <span className="absolute top-2 right-2 rtl:right-auto rtl:left-2 bg-hub-blue text-white text-[9.5px] sm:text-[10px] font-bold px-1.5 sm:px-2 py-0.5 rounded-md shadow-xs z-10">
            {isRtl ? 'جديد' : 'New'}
          </span>
        )}
        {product.isBestSeller && !product.isNew && (
          <span className="absolute top-2 right-2 rtl:right-auto rtl:left-2 bg-blue-600 text-white text-[9.5px] sm:text-[10px] font-bold px-1.5 sm:px-2 py-0.5 rounded-md shadow-xs z-10">
            {isRtl ? 'الأكثر مبيعاً' : 'Best Seller'}
          </span>
        )}

        {/* Quick Action Overlay Icons (Accessible on touch and desktop hover) */}
        <div className={`absolute top-2 right-2 rtl:right-auto rtl:left-2 flex flex-col gap-1.5 z-20 transition-opacity duration-200 ${
          isWishlisted || isCompared ? 'opacity-100' : 'opacity-80 sm:opacity-0 sm:group-hover:opacity-100'
        }`}>
          <button
            onClick={(e) => {
              e.preventDefault();
              setShowQuickView(true);
            }}
            title={isRtl ? 'معاينة سريعة' : 'Quick View'}
            className="w-7 h-7 rounded-full bg-white shadow-md border border-slate-100 flex items-center justify-center transition-colors text-slate-600 hover:text-blue-600 hover:bg-blue-50 active:scale-90"
          >
            <Eye className="w-3.5 h-3.5" />
          </button>

          <button
            onClick={(e) => {
              e.preventDefault();
              toggleWishlist(product.id);
            }}
            title={isWishlisted ? (isRtl ? 'إزالة من المفضلة' : 'Wishlist') : (isRtl ? 'إضافة للمفضلة' : 'Wishlist')}
            className={`w-7 h-7 rounded-full bg-white shadow-md border border-slate-100 flex items-center justify-center transition-colors ${
              isWishlisted ? 'text-red-500 bg-red-50' : 'text-slate-600 hover:text-red-500'
            }`}
          >
            <Heart className={`w-3.5 h-3.5 ${isWishlisted ? 'fill-red-500' : ''}`} />
          </button>

          <button
            onClick={(e) => {
              e.preventDefault();
              toggleCompare(product.id);
            }}
            title={isRtl ? 'مقارنة' : 'Compare'}
            className={`w-7 h-7 rounded-full bg-white shadow-md border border-slate-100 flex items-center justify-center transition-colors ${
              isCompared ? 'text-blue-600 bg-blue-50' : 'text-slate-600 hover:text-blue-600'
            }`}
          >
            <Shuffle className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Product Image */}
        <Link href={`/products/${product.id}`} className="w-full h-full relative block">
          <Image
            src={product.thumbnail || product.images[0]}
            alt={title}
            fill
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 33vw, 20vw"
            className="object-contain p-1.5 mix-blend-multiply group-hover:scale-105 transition-transform duration-300"
          />
        </Link>
      </div>

      {/* Content */}
      <div className="space-y-2 flex-1 flex flex-col justify-between">
        <div>
          {/* Brand & Stock Pill */}
          <div className="flex items-center justify-between gap-1 mb-1">
            <span className="text-[10px] font-extrabold text-blue-600 uppercase tracking-wider bg-blue-50/80 px-1.5 py-0.5 rounded">
              {product.brand}
            </span>

            {product.inStock ? (
              <span className="inline-flex items-center gap-1 text-[9.5px] text-emerald-600 font-semibold">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                <span>{isRtl ? 'متوفر' : 'In Stock'}</span>
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 text-[9.5px] text-amber-600 font-semibold">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-500"></span>
                <span>{isRtl ? 'طلب مسبق' : 'Pre-order'}</span>
              </span>
            )}
          </div>

          {/* Title */}
          <Link href={`/products/${product.id}`}>
            <h3 className="text-[13px] font-bold text-gray-900 group-hover:text-blue-600 transition-colors line-clamp-2 leading-snug min-h-[36px]">
              {title}
            </h3>
          </Link>

          {/* Micro-specs Badges */}
          {specBadges.length > 0 && (
            <div className="flex flex-wrap gap-1 my-1.5">
              {specBadges.map((badge, idx) => (
                <span
                  key={idx}
                  className="px-1.5 py-0.5 bg-slate-100 text-slate-700 rounded text-[9.5px] font-semibold tracking-tight border border-slate-200/80"
                >
                  {badge}
                </span>
              ))}
            </div>
          )}

          {/* Warranty Tag */}
          <div className="flex items-center justify-end text-[11px] my-1 text-slate-500">
            <div className="flex items-center gap-0.5 text-[9.5px] text-slate-500">
              <ShieldCheck className="w-3 h-3 text-blue-600" />
              <span>{isRtl ? 'ضمان معتمد' : 'Warranty'}</span>
            </div>
          </div>
        </div>

        {/* Price & Action Button */}
        <div className="pt-2 border-t border-slate-100 space-y-2">
          <div>
            {product.oldPrice && (
              <span className="text-[11px] text-gray-400 line-through font-medium block">
                {formatPrice(product.oldPrice)}
              </span>
            )}
            <div className="text-[16px] font-black text-gray-900 tracking-tight">
              {formatPrice(product.price)}
            </div>
          </div>

          <button
            onClick={handleAddToCart}
            className={`w-full font-bold text-xs sm:text-[13px] py-2 sm:py-2.5 px-2 sm:px-3 rounded-xl flex items-center justify-center gap-1.5 transition-all shadow-xs active:scale-95 whitespace-nowrap ${
              isAdded
                ? 'bg-emerald-600 hover:bg-emerald-700 text-white'
                : 'bg-hub-blue hover:bg-blue-700 text-white'
            }`}
          >
            {isAdded ? (
              <>
                <Check className="w-3.5 h-3.5" />
                <span>{isRtl ? 'تمت الإضافة ✓' : 'Added ✓'}</span>
              </>
            ) : (
              <>
                <ShoppingCart className="w-3.5 h-3.5" />
                <span>{isRtl ? 'أضف للسلة' : 'Add to Cart'}</span>
              </>
            )}
          </button>
        </div>
      </div>

      {showQuickView && (
        <QuickViewModal product={product} onClose={() => setShowQuickView(false)} />
      )}
    </div>
  );
};
