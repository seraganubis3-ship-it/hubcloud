'use client';

import React from 'react';
import Link from 'next/link';
import { useStore } from '@/context/StoreContext';
import { Home, Package } from 'lucide-react';

export default function NotFound() {
  const { isRtl } = useStore();

  return (
    <div className="min-h-[70vh] flex items-center justify-center py-16 px-4">
      <div className="max-w-md w-full text-center space-y-6">
        <div className="w-20 h-20 rounded-3xl bg-blue-50 text-blue-600 flex items-center justify-center mx-auto shadow-sm border border-blue-100">
          <span className="text-3xl font-black font-mono">404</span>
        </div>

        <div className="space-y-2">
          <h1 className="text-2xl sm:text-3xl font-black text-gray-900 tracking-tight">
            {isRtl ? 'الصفحة غير موجودة' : 'Page Not Found'}
          </h1>
          <p className="text-sm text-gray-500 leading-relaxed">
            {isRtl
              ? 'عذراً، لم نتمكن من العثور على الصفحة التي تبحث عنها. ربما تم نقلها أو حذفها.'
              : "Sorry, the page you are looking for doesn't exist or has been moved."}
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
          <Link
            href="/"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm px-6 py-3 rounded-xl transition-all shadow-md"
          >
            <Home className="w-4 h-4" />
            <span>{isRtl ? 'الرئيسية' : 'Return Home'}</span>
          </Link>

          <Link
            href="/products"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-white hover:bg-gray-50 text-gray-800 border border-gray-300 font-bold text-sm px-6 py-3 rounded-xl transition-all"
          >
            <Package className="w-4 h-4" />
            <span>{isRtl ? 'تصفح المنتجات' : 'Browse Catalog'}</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
