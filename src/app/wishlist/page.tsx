'use client';

import React from 'react';
import Link from 'next/link';
import { ProductCard } from '@/components/product/ProductCard';
import { useStore } from '@/context/StoreContext';
import { Heart, ChevronRight, ShoppingCart } from 'lucide-react';

export default function WishlistPage() {
  const { language, isRtl, wishlist, products } = useStore();
  const wishlistedProducts = products.filter(p => wishlist.includes(p.id));

  return (
    <div className="py-6">
      <div className="max-w-7xl mx-auto px-4 space-y-6">
        {/* Breadcrumbs */}
        <div className="flex items-center gap-2 text-[12px] text-gray-500">
          <Link href="/" className="hover:text-hub-blue">{isRtl ? 'الرئيسية' : 'Home'}</Link>
          <ChevronRight className="w-3 h-3 rtl:rotate-180 text-gray-400" />
          <span className="font-semibold text-gray-900">{isRtl ? 'قائمة المفضلة' : 'Wishlist'}</span>
        </div>

        <div className="flex items-center justify-between pb-3 border-b border-gray-200">
          <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 flex items-center gap-2">
            <Heart className="w-7 h-7 text-red-500 fill-red-500" />
            <span>{isRtl ? `قائمة المفضلة (${wishlistedProducts.length})` : `My Wishlist (${wishlistedProducts.length})`}</span>
          </h1>
        </div>

        {wishlistedProducts.length === 0 ? (
          <div className="bg-white rounded-2xl border border-gray-200 p-12 text-center space-y-4">
            <div className="w-16 h-16 bg-red-50 text-red-500 rounded-full flex items-center justify-center mx-auto">
              <Heart className="w-8 h-8" />
            </div>
            <h3 className="text-lg font-bold text-gray-900">{isRtl ? 'لا توجد منتجات في المفضلة' : 'Your Wishlist is Empty'}</h3>
            <p className="text-[13px] text-gray-500 max-w-sm mx-auto">
              {isRtl ? 'اضغط على أيقونة القلب على أي منتج لحفظه والرجوع إليه لاحقاً.' : 'Click the heart icon on any product to save it and view it anytime.'}
            </p>
            <Link
              href="/products"
              className="inline-block bg-hub-blue text-white font-bold text-[13px] px-6 py-2.5 rounded-xl hover:bg-hub-blue-dark transition-colors"
            >
              {isRtl ? 'استكشف المنتجات' : 'Browse Catalog'}
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
            {wishlistedProducts.map(p => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
