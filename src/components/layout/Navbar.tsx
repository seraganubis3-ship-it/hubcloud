'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useStore } from '@/context/StoreContext';
import { Menu, Flame, Sparkles, Laptop, Monitor, Network, Scan, Headphones, ChevronRight, Shield } from 'lucide-react';

export const Navbar: React.FC = () => {
  const pathname = usePathname();
  const { isRtl, currentUser } = useStore();
  const [mobileCategoriesOpen, setMobileCategoriesOpen] = useState(false);
  const [allCategoriesOpen, setAllCategoriesOpen] = useState(false);

  // Exact 5 Approved Categories
  const navLinks = [
    { name: 'Laptops', nameAr: 'اللابتوبات', href: '/category/laptops', icon: Laptop },
    { name: 'Desktops', nameAr: 'الكمبيوتر المكتبي', href: '/category/desktops', icon: Monitor },
    { name: 'Network Device', nameAr: 'أجهزة الشبكات', href: '/category/network-device', icon: Network },
    { name: 'Scanner', nameAr: 'الماسحات الضوئية', href: '/category/scanner', icon: Scan },
    { name: 'Accessories', nameAr: 'الإكسسوارات والملحقات', href: '/category/accessories', icon: Headphones },
  ];

  return (
    <nav className="bg-hub-blue text-white shadow-md relative z-30">
      {/* 1. Mobile Clean Categories Bar (< sm screens) */}
      <div className="sm:hidden w-full px-3 py-2 flex items-center justify-between gap-2.5">
        {/* All Categories Dropdown Trigger */}
        <button
          onClick={() => setMobileCategoriesOpen(!mobileCategoriesOpen)}
          className={`flex-1 flex items-center justify-between px-3.5 py-2 rounded-xl text-xs font-bold transition-all border ${
            mobileCategoriesOpen
              ? 'bg-white text-hub-blue border-white shadow-md'
              : 'bg-white/10 hover:bg-white/20 text-white border-white/15'
          }`}
        >
          <div className="flex items-center gap-2">
            <Menu className="w-4 h-4 shrink-0" />
            <span>{isRtl ? 'جميع الأقسام' : 'All Categories'}</span>
          </div>
          <ChevronRight
            className={`w-4 h-4 transition-transform duration-200 ${
              mobileCategoriesOpen ? 'rotate-90' : isRtl ? 'rotate-180' : ''
            }`}
          />
        </button>

        {/* Deals Red Button */}
        <Link
          href="/deals"
          className="flex items-center gap-1.5 bg-hub-red hover:bg-hub-red-hover text-white font-bold text-xs px-3.5 py-2 rounded-xl shadow-xs shrink-0 active:scale-95"
        >
          <Flame className="w-3.5 h-3.5 text-yellow-300 animate-pulse fill-yellow-300 shrink-0" />
          <span>{isRtl ? 'أقوى العروض' : 'Deals'}</span>
        </Link>
      </div>

      {/* Mobile Categories Dropdown Menu */}
      {mobileCategoriesOpen && (
        <div className="sm:hidden bg-white text-gray-900 shadow-2xl border-t border-gray-100 divide-y divide-gray-100 animate-in fade-in slide-in-from-top-2 duration-150">
          {navLinks.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href || pathname.startsWith(item.href + '/');
            return (
              <Link
                key={item.name}
                href={item.href}
                onClick={() => setMobileCategoriesOpen(false)}
                className={`flex items-center justify-between px-4 py-3 text-xs sm:text-[13px] font-semibold transition-colors ${
                  isActive ? 'bg-blue-50 text-hub-blue' : 'hover:bg-gray-50 text-gray-800'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className={`p-1.5 rounded-lg ${isActive ? 'bg-blue-100 text-hub-blue' : 'bg-gray-100 text-gray-600'}`}>
                    <Icon className="w-4 h-4" />
                  </div>
                  <span>{isRtl ? item.nameAr : item.name}</span>
                </div>
                <ChevronRight className="w-4 h-4 text-gray-400 rtl:rotate-180" />
              </Link>
            );
          })}

          <Link
            href="/products"
            onClick={() => setMobileCategoriesOpen(false)}
            className="flex items-center justify-between px-4 py-3 text-xs font-bold text-hub-blue bg-blue-50/50 hover:bg-blue-50"
          >
            <span>{isRtl ? 'تصفح كافة المنتجات' : 'View All Products'}</span>
            <ChevronRight className="w-4 h-4 rtl:rotate-180" />
          </Link>
        </div>
      )}

      {/* 2. Desktop Navigation View (>= sm screens) */}
      <div className="hidden sm:flex max-w-[1536px] mx-auto px-4 sm:px-6 items-center justify-between">
        {/* Left Links + All Categories Trigger */}
        <div className="flex items-center space-x-1 rtl:space-x-reverse overflow-x-auto scroll-smooth touch-pan-x [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden flex-1 min-w-0 mr-2 rtl:mr-0 rtl:ml-2">
          {/* All Categories Dropdown Trigger */}
          <div className="relative shrink-0">
            <button
              onClick={() => setAllCategoriesOpen(!allCategoriesOpen)}
              className="flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-3.5 py-2.5 sm:py-3 hover:bg-hub-blue-dark transition-colors font-semibold text-[13px] sm:text-[14px] whitespace-nowrap"
            >
              <Menu className="w-4 h-4 sm:w-5 sm:h-5 shrink-0" />
              <span>{isRtl ? 'جميع الأقسام' : 'All Categories'}</span>
            </button>

            {allCategoriesOpen && (
              <div
                className="absolute top-full left-0 rtl:left-auto rtl:right-0 w-64 bg-white text-gray-800 shadow-2xl rounded-b-xl border border-gray-200 py-2 z-50 animate-in fade-in slide-in-from-top-2 duration-150"
                onMouseLeave={() => setAllCategoriesOpen(false)}
              >
                <div className="px-3 py-1.5 text-[11px] font-bold text-gray-400 uppercase tracking-wider">
                  {isRtl ? 'الأقسام الرئيسية الـ 5' : 'Core 5 Categories'}
                </div>
                {navLinks.map((item) => {
                  const Icon = item.icon;
                  return (
                    <Link
                      key={item.name}
                      href={item.href}
                      onClick={() => setAllCategoriesOpen(false)}
                      className="flex items-center justify-between px-4 py-2.5 hover:bg-blue-50 hover:text-hub-blue transition-colors text-[13px] font-medium"
                    >
                      <div className="flex items-center gap-2.5">
                        <Icon className="w-4 h-4 text-hub-blue" />
                        <span>{isRtl ? item.nameAr : item.name}</span>
                      </div>
                      <ChevronRight className="w-3.5 h-3.5 text-gray-400 rtl:rotate-180" />
                    </Link>
                  );
                })}
                {currentUser?.role === 'admin' && (
                  <div className="border-t border-gray-100 my-1 pt-1">
                    <Link
                      href="/admin"
                      onClick={() => setAllCategoriesOpen(false)}
                      className="flex items-center gap-2 px-4 py-2 text-[12px] font-bold text-slate-700 hover:bg-slate-100"
                    >
                      <Shield className="w-4 h-4 text-hub-blue" />
                      <span>{isRtl ? 'لوحة التحكم' : 'Admin Dashboard'}</span>
                    </Link>
                  </div>
                )}
              </div>
            )}
          </div>

          <span className="text-blue-400/60 inline-block px-1">|</span>

          {/* Navigation Items (5 Exact Categories) */}
          {navLinks.map((item) => {
            const isActive = pathname === item.href || pathname.startsWith(item.href + '/');
            return (
              <Link
                key={item.name}
                href={item.href}
                className={`px-3.5 py-3 text-[13px] sm:text-[14px] font-medium whitespace-nowrap transition-colors hover:bg-hub-blue-dark ${
                  isActive ? 'bg-hub-blue-dark font-bold' : ''
                }`}
              >
                {isRtl ? item.nameAr : item.name}
              </Link>
            );
          })}
        </div>

        {/* Right Action: Deals Red Button */}
        <div className="flex items-center gap-2 flex-shrink-0">
          <Link
            href="/deals"
            className="flex items-center gap-1 sm:gap-1.5 bg-hub-red hover:bg-hub-red-hover text-white font-bold text-xs sm:text-[14px] px-2.5 sm:px-4 py-1.5 sm:py-2 rounded shadow-badge transition-transform hover:scale-105 whitespace-nowrap"
          >
            <Flame className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-yellow-300 animate-pulse fill-yellow-300 shrink-0" />
            <span>{isRtl ? 'أقوى العروض' : 'Deals'}</span>
          </Link>
        </div>
      </div>
    </nav>
  );
};
