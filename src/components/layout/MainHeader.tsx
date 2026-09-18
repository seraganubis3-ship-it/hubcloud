'use client';

import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { Logo } from './Logo';
import { useStore } from '@/context/StoreContext';
import {
  Search,
  Shuffle,
  Heart,
  User,
  ShoppingCart,
  ChevronDown,
  Menu,
  X,
  Shield,
  Laptop,
  Monitor,
  Network,
  Scan,
  Headphones,
  Flame,
  Globe,
  ArrowRight,
  Package,
  LogOut,
  Phone
} from 'lucide-react';
import { AnimatedSearchPlaceholder } from '@/components/ui/AnimatedSearchPlaceholder';

export const MainHeader: React.FC = () => {
  const router = useRouter();
  const pathname = usePathname();
  const {
    language,
    setLanguage,
    isRtl,
    currentUser,
    logout,
    cartCount,
    wishlistCount,
    compareCount,
    searchQuery,
    setSearchQuery,
    activeCategory,
    setActiveCategory,
    subtotal,
    formatPrice
  } = useStore();

  const [mounted, setMounted] = useState(false);
  const [categoryDropdownOpen, setCategoryDropdownOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Close mobile menu on page navigation
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [pathname]);

  // Lock body scrolling when mobile drawer is open
  useEffect(() => {
    if (mobileMenuOpen) {
      document.body.style.overflow = 'hidden';
      document.body.style.touchAction = 'none';
    } else {
      document.body.style.overflow = '';
      document.body.style.touchAction = '';
    }
    return () => {
      document.body.style.overflow = '';
      document.body.style.touchAction = '';
    };
  }, [mobileMenuOpen]);

  // Close drawer on Escape key press
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setMobileMenuOpen(false);
      }
    };
    if (mobileMenuOpen) {
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [mobileMenuOpen]);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 8);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Exact 5 Categories for Search Dropdown
  const categories = [
    { id: 'all', name: 'All Categories', nameAr: 'جميع الأقسام', icon: Menu },
    { id: 'laptops', name: 'Laptops', nameAr: 'اللابتوبات', icon: Laptop },
    { id: 'desktops', name: 'Desktops', nameAr: 'الكمبيوتر المكتبي', icon: Monitor },
    { id: 'network-device', name: 'Network Device', nameAr: 'أجهزة الشبكات', icon: Network },
    { id: 'scanner', name: 'Scanner', nameAr: 'الماسحات الضوئية', icon: Scan },
    { id: 'accessories', name: 'Accessories', nameAr: 'الإكسسوارات والملحقات', icon: Headphones },
  ];

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/products?q=${encodeURIComponent(searchQuery.trim())}`);
    } else {
      router.push('/products');
    }
  };

  return (
    <>
      <header
        className={`bg-white/95 backdrop-blur-md border-b sticky top-0 w-full transition-all duration-200 z-40 ${
          isScrolled ? 'shadow-md border-gray-200' : 'shadow-xs border-gray-100'
        }`}
      >
      <div className="max-w-[1536px] mx-auto px-4 sm:px-6 py-2.5 sm:py-3.5 flex items-center justify-between gap-3 sm:gap-4 lg:gap-8">
        {/* Animated Mobile Burger Button */}
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="lg:hidden relative w-10 h-10 flex flex-col items-center justify-center gap-1.5 rounded-xl border border-gray-200 bg-slate-50/80 hover:bg-slate-100 text-slate-700 transition-all active:scale-95 shadow-2xs"
          aria-label={mobileMenuOpen ? 'Close mobile menu' : 'Open mobile menu'}
          aria-expanded={mobileMenuOpen}
        >
          <span
            className={`w-5 h-0.5 bg-slate-700 rounded-full transition-all duration-300 transform origin-center ${
              mobileMenuOpen ? 'rotate-45 translate-y-2 bg-blue-600' : ''
            }`}
          />
          <span
            className={`w-3.5 h-0.5 bg-slate-700 rounded-full transition-all duration-200 ${
              mobileMenuOpen ? 'opacity-0 scale-x-0' : 'opacity-100'
            }`}
          />
          <span
            className={`w-5 h-0.5 bg-slate-700 rounded-full transition-all duration-300 transform origin-center ${
              mobileMenuOpen ? '-rotate-45 -translate-y-2 bg-blue-600' : ''
            }`}
          />
        </button>

        {/* Brand Logo */}
        <div className="flex-shrink-0">
          <Logo size="md" />
        </div>

        {/* Center Universal Search Bar (Desktop & Tablets) */}
        <form
          onSubmit={handleSearchSubmit}
          className="hidden md:flex flex-1 max-w-3xl items-center border-2 border-gray-300 hover:border-hub-blue focus-within:border-hub-blue rounded-xl overflow-hidden transition-colors relative bg-white shadow-2xs"
        >
          {/* Search Icon Prefix */}
          <div className="pl-4 rtl:pl-0 rtl:pr-4 text-gray-400 shrink-0 pointer-events-none">
            <Search className="w-4 h-4 text-gray-400" />
          </div>

          {/* Search Input Container with Animated Placeholder */}
          <div className="relative flex-1 flex items-center min-w-0">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full px-3 py-2.5 text-[14px] text-gray-800 focus:outline-none bg-transparent relative z-10"
              autoComplete="off"
            />
            {/* Animated Rotating Search Placeholder */}
            <AnimatedSearchPlaceholder isRtl={isRtl} hasValue={Boolean(searchQuery)} />

            {/* Clear Button when user types */}
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 rtl:right-auto rtl:left-2.5 z-20 text-gray-400 hover:text-gray-600 p-1 transition-colors"
                aria-label="Clear search"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Blue Search Button */}
          <button
            type="submit"
            aria-label="Search"
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2.5 transition-colors flex items-center justify-center font-bold text-[13px] gap-1.5 shrink-0"
          >
            <Search className="w-4 h-4 stroke-[2.5]" />
            <span className="hidden lg:inline">{isRtl ? 'بحث' : 'Search'}</span>
          </button>
        </form>

        {/* Right Header Navigation Icons & Actions */}
        <div className="flex items-center gap-2.5 sm:gap-5">
          {/* Admin CMS Direct Shortcut (Admins Only) */}
          {currentUser?.role === 'admin' && (
            <Link
              href="/admin"
              className="hidden sm:flex flex-col items-center group text-slate-700 hover:text-blue-600 transition-colors"
              title="Admin CMS Dashboard"
            >
              <Shield className="w-5 h-5 text-slate-700 group-hover:text-blue-600 transition-colors" />
              <span className="text-[11px] font-bold mt-0.5 text-slate-600 group-hover:text-blue-600 transition-colors">{isRtl ? 'الإدارة' : 'Admin'}</span>
            </Link>
          )}

          {/* Compare */}
          <Link
            href="/compare"
            className="hidden sm:flex flex-col items-center group text-slate-700 hover:text-blue-600 transition-colors relative"
          >
            <div className="relative">
              <Shuffle className="w-5 h-5 text-slate-700 group-hover:text-blue-600 transition-colors" />
              {compareCount > 0 && (
                <span className="absolute -top-1.5 -right-2 bg-blue-600 text-white text-[10px] font-black w-4 h-4 rounded-full flex items-center justify-center">
                  {compareCount}
                </span>
              )}
            </div>
            <span className="text-[11px] font-bold mt-0.5 text-slate-600 group-hover:text-blue-600 transition-colors">{isRtl ? 'المقارنة' : 'Compare'}</span>
          </Link>

          {/* Wishlist */}
          <Link
            href="/wishlist"
            className="flex flex-col items-center group text-slate-700 hover:text-blue-600 transition-colors relative"
          >
            <div className="relative">
              <Heart className="w-5 h-5 text-slate-700 group-hover:text-blue-600 transition-colors" />
              {wishlistCount > 0 && (
                <span className="absolute -top-1.5 -right-2 bg-blue-600 text-white text-[10px] font-black w-4 h-4 rounded-full flex items-center justify-center">
                  {wishlistCount}
                </span>
              )}
            </div>
            <span className="text-[11px] font-bold mt-0.5 text-slate-600 group-hover:text-blue-600 transition-colors hidden sm:inline">{isRtl ? 'المفضلة' : 'Wishlist'}</span>
          </Link>

          {/* Account / User Menu */}
          <div className="relative">
            {currentUser ? (
              <div>
                <button
                  type="button"
                  onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                  className="flex flex-col items-center group text-slate-700 hover:text-blue-600 transition-colors relative"
                >
                  <div className="w-6 h-6 rounded-full bg-slate-100 border border-slate-200 text-slate-700 font-bold text-[10px] flex items-center justify-center group-hover:bg-blue-600 group-hover:text-white group-hover:border-blue-600 transition-colors">
                    {currentUser.name.slice(0, 2).toUpperCase()}
                  </div>
                  <span className="text-[11px] font-bold mt-0.5 text-slate-600 group-hover:text-blue-600 transition-colors max-w-[60px] truncate hidden sm:inline">
                    {currentUser.name.split(' ')[0]}
                  </span>
                </button>

                {userDropdownOpen && (
                  <div className="absolute right-0 rtl:right-auto rtl:left-0 top-full mt-2 w-52 bg-white rounded-2xl border border-gray-200 shadow-xl py-2 z-50 text-[13px]">
                    <div className="px-4 py-2 border-b border-gray-100">
                      <span className="font-extrabold text-gray-900 block truncate">{currentUser.name}</span>
                      <span className="text-[11px] text-gray-500 block truncate">{currentUser.email}</span>
                      <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded mt-1 inline-block">
                        {currentUser.role === 'admin' ? 'Admin' : 'Verified Customer'}
                      </span>
                    </div>

                    <Link
                      href="/account"
                      onClick={() => setUserDropdownOpen(false)}
                      className="flex items-center gap-2.5 px-4 py-2 text-gray-700 hover:bg-blue-50 hover:text-blue-600 transition-colors"
                    >
                      <User className="w-4 h-4 text-gray-400" />
                      <span>{isRtl ? 'حسابي' : 'My Account'}</span>
                    </Link>

                    <Link
                      href="/account"
                      onClick={() => setUserDropdownOpen(false)}
                      className="flex items-center gap-2.5 px-4 py-2 text-gray-700 hover:bg-blue-50 hover:text-blue-600 transition-colors"
                    >
                      <Package className="w-4 h-4 text-gray-400" />
                      <span>{isRtl ? 'طلباتي وفواتيري' : 'Orders & Invoices'}</span>
                    </Link>

                    {currentUser.role === 'admin' && (
                      <Link
                        href="/admin"
                        onClick={() => setUserDropdownOpen(false)}
                        className="flex items-center gap-2.5 px-4 py-2 text-slate-700 font-bold hover:bg-slate-100 transition-colors"
                      >
                        <Shield className="w-4 h-4 text-blue-600" />
                        <span>{isRtl ? 'لوحة الإدارة (Admin CMS)' : 'Admin Suite'}</span>
                      </Link>
                    )}

                    <div className="border-t border-gray-100 my-1 pt-1">
                      <button
                        type="button"
                        onClick={() => {
                          logout();
                          setUserDropdownOpen(false);
                        }}
                        className="w-full flex items-center gap-2.5 px-4 py-2 text-red-600 hover:bg-red-50 text-start transition-colors font-semibold"
                      >
                        <LogOut className="w-4 h-4" />
                        <span>{isRtl ? 'تسجيل الخروج' : 'Sign Out'}</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <Link
                href="/login"
                className="flex flex-col items-center group text-slate-700 hover:text-blue-600 transition-colors"
              >
                <User className="w-5 h-5 text-slate-700 group-hover:text-blue-600 transition-colors" />
                <span className="text-[11px] font-bold mt-0.5 text-slate-600 group-hover:text-blue-600 transition-colors hidden sm:inline">{isRtl ? 'دخول' : 'Sign In'}</span>
              </Link>
            )}
          </div>

          {/* Cart */}
          <Link
            href="/cart"
            className="flex items-center gap-2 group bg-slate-50 hover:bg-blue-50/80 text-slate-700 hover:text-blue-600 px-3 py-1.5 rounded-xl border border-slate-200 hover:border-blue-300 transition-colors"
          >
            <div className="relative">
              <ShoppingCart className="w-5 h-5 text-slate-700 group-hover:text-blue-600 transition-transform group-hover:scale-110" />
              {cartCount > 0 && (
                <span className="absolute -top-2 -right-2.5 bg-blue-600 text-white text-[11px] font-black w-4.5 h-4.5 rounded-full flex items-center justify-center px-1 shadow-xs">
                  {cartCount}
                </span>
              )}
            </div>
            <div className="hidden xl:flex flex-col text-start">
              <span className="text-[10px] text-slate-500 uppercase font-bold leading-none">{isRtl ? 'السلة' : 'Cart'}</span>
              <span className="text-[12px] font-black text-slate-900 group-hover:text-blue-600 leading-tight font-mono">{formatPrice(subtotal)}</span>
            </div>
          </Link>

          {/* Language Toggle Button (Next to Cart) */}
          <button
            type="button"
            onClick={() => setLanguage(language === 'ar' ? 'en' : 'ar')}
            className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-xl border border-slate-200 hover:border-blue-500 hover:bg-blue-50/60 text-slate-700 hover:text-blue-600 transition-all text-[12px] font-bold shadow-2xs group"
            title={isRtl ? 'Switch to English' : 'التحويل للغة العربية'}
            aria-label="Change Language"
          >
            <Globe className="w-4 h-4 text-slate-700 group-hover:text-blue-600 transition-colors" />
            <span className="font-extrabold uppercase text-slate-700 group-hover:text-blue-600 transition-colors">
              {language === 'ar' ? 'EN' : 'عربي'}
            </span>
          </button>
        </div>
      </div>

      {/* Mobile Search Bar (Always visible on mobile matching mockup) */}
      <div className="md:hidden px-4 pb-3 pt-1">
        <form onSubmit={handleSearchSubmit} className="flex items-center border border-gray-200 rounded-xl overflow-hidden bg-[#F8FAFC] focus-within:bg-white focus-within:border-blue-600 focus-within:ring-2 focus-within:ring-blue-100 transition-all shadow-2xs">
          <div className="pl-3.5 rtl:pl-0 rtl:pr-3.5 text-gray-400 shrink-0">
            <Search className="w-4 h-4" />
          </div>
          <div className="relative flex-1 flex items-center min-w-0">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full px-2.5 py-2.5 text-[13px] bg-transparent focus:outline-none text-gray-800 relative z-10"
              autoComplete="off"
            />
            {/* Animated Rotating Search Placeholder */}
            <AnimatedSearchPlaceholder isRtl={isRtl} hasValue={Boolean(searchQuery)} />

            {/* Clear Button when user types */}
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="absolute right-2 rtl:right-auto rtl:left-2 z-20 text-gray-400 hover:text-gray-600 p-1"
                aria-label="Clear search"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
          <button
            type="submit"
            className="bg-blue-600 hover:bg-blue-700 text-white text-[12px] font-bold px-4 py-2 mr-1.5 rtl:mr-0 rtl:ml-1.5 my-1 rounded-lg transition-colors shadow-2xs shrink-0"
          >
            {isRtl ? 'بحث' : 'Search'}
          </button>
        </form>
      </div>
    </header>

    {/* Mobile Drawer Navigation (Slide-over with smooth 60fps Open/Close CSS transition) rendered via Portal */}
    {mounted &&
      createPortal(
        <div
          className={`fixed inset-0 z-[99999] transition-all duration-300 ${
            mobileMenuOpen ? 'visible pointer-events-auto' : 'invisible pointer-events-none'
          }`}
          aria-hidden={!mobileMenuOpen}
        >
          {/* Smooth Backdrop Fade In & Out */}
          <div
            className={`fixed inset-0 bg-slate-950/60 backdrop-blur-xs transition-opacity duration-300 ease-in-out z-[99998] ${
              mobileMenuOpen ? 'opacity-100' : 'opacity-0'
            }`}
            onClick={() => setMobileMenuOpen(false)}
          />

          {/* Drawer Content with Smooth Slide In & Out */}
          <div
            dir={isRtl ? 'rtl' : 'ltr'}
            className={`fixed top-0 bottom-0 ${
              isRtl ? 'right-0' : 'left-0'
            } w-[86%] max-w-sm bg-white h-full shadow-2xl flex flex-col justify-between z-[99999] transition-transform duration-300 ease-out transform ${
              mobileMenuOpen
                ? 'translate-x-0'
                : isRtl
                ? 'translate-x-full'
                : '-translate-x-full'
            }`}
          >
          {/* Top Section (Scrollable) */}
          <div className="flex-1 overflow-y-auto overflow-x-hidden">
            {/* Drawer Header */}
            <div className="p-4 border-b border-gray-100 flex items-center justify-between bg-white sticky top-0 z-10 shadow-2xs">
              <Logo size="sm" />
              <button
                onClick={() => setMobileMenuOpen(false)}
                className="w-9 h-9 rounded-xl border border-gray-200 hover:border-gray-300 bg-slate-50 hover:bg-slate-100 text-slate-700 flex items-center justify-center transition-all active:scale-95"
                aria-label="Close menu"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* User Profile Card / Sign In */}
            <div className="p-4 border-b border-gray-100 bg-slate-50/60">
              {currentUser ? (
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-sm shadow-xs">
                      {currentUser.name?.charAt(0).toUpperCase() || 'U'}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="font-extrabold text-gray-900 text-[13px] truncate">
                        {currentUser.name}
                      </div>
                      <div className="text-[11px] text-gray-500 truncate font-mono">
                        {currentUser.email}
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2 pt-1">
                    <Link
                      href="/account"
                      onClick={() => setMobileMenuOpen(false)}
                      className="flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl bg-white border border-gray-200 hover:border-blue-500 text-[12px] font-bold text-slate-700 hover:text-blue-600 transition-colors shadow-2xs"
                    >
                      <User className="w-3.5 h-3.5 text-blue-600" />
                      <span>{isRtl ? 'حسابي' : 'My Account'}</span>
                    </Link>
                    <Link
                      href="/account"
                      onClick={() => setMobileMenuOpen(false)}
                      className="flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl bg-white border border-gray-200 hover:border-blue-500 text-[12px] font-bold text-slate-700 hover:text-blue-600 transition-colors shadow-2xs"
                    >
                      <Package className="w-3.5 h-3.5 text-blue-600" />
                      <span>{isRtl ? 'طلباتي' : 'My Orders'}</span>
                    </Link>
                  </div>
                </div>
              ) : (
                <Link
                  href="/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center justify-between p-3 rounded-xl bg-white border border-gray-200 hover:border-blue-500 hover:shadow-xs transition-all group"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 border border-blue-100 flex items-center justify-center">
                      <User className="w-4 h-4" />
                    </div>
                    <div className="text-start">
                      <div className="text-[13px] font-black text-gray-900 group-hover:text-blue-600 transition-colors">
                        {isRtl ? 'تسجيل الدخول / إنشاء حساب' : 'Sign In / Register'}
                      </div>
                      <div className="text-[11px] text-slate-500">
                        {isRtl ? 'لمتابعة طلباتك وضمانك' : 'Manage orders & warranty'}
                      </div>
                    </div>
                  </div>
                  <ArrowRight className="w-4 h-4 text-gray-400 group-hover:text-blue-600 rtl:rotate-180 transition-transform group-hover:translate-x-0.5 rtl:group-hover:-translate-x-0.5" />
                </Link>
              )}
            </div>

            {/* Language Switcher Segmented Control */}
            <div className="p-4 border-b border-gray-100">
              <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                <Globe className="w-3.5 h-3.5 text-blue-600" />
                <span>{isRtl ? 'اللغة المفضلة' : 'Select Language'}</span>
              </div>
              <div className="grid grid-cols-2 gap-1.5 bg-slate-100 p-1 rounded-xl">
                <button
                  type="button"
                  onClick={() => setLanguage('ar')}
                  className={`py-2 px-3 rounded-lg text-xs font-black transition-all flex items-center justify-center gap-1.5 ${
                    language === 'ar'
                      ? 'bg-white text-blue-600 shadow-xs border border-gray-200/80'
                      : 'text-slate-600 hover:text-gray-900'
                  }`}
                >
                  <span>العربية (AR)</span>
                </button>
                <button
                  type="button"
                  onClick={() => setLanguage('en')}
                  className={`py-2 px-3 rounded-lg text-xs font-black transition-all flex items-center justify-center gap-1.5 ${
                    language === 'en'
                      ? 'bg-white text-blue-600 shadow-xs border border-gray-200/80'
                      : 'text-slate-600 hover:text-gray-900'
                  }`}
                >
                  <span>English (EN)</span>
                </button>
              </div>
            </div>

            {/* Core 5 Categories */}
            <div className="p-4 space-y-1.5">
              <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2">
                {isRtl ? 'الأقسام والمنتجات' : 'Core Categories'}
              </div>

              {categories
                .filter((c) => c.id !== 'all')
                .map((cat) => {
                  const Icon = cat.icon;
                  const catColors: Record<string, string> = {
                    laptops: 'bg-blue-50 text-blue-600 border-blue-100',
                    desktops: 'bg-indigo-50 text-indigo-600 border-indigo-100',
                    'network-device': 'bg-cyan-50 text-cyan-600 border-cyan-100',
                    scanner: 'bg-teal-50 text-teal-600 border-teal-100',
                    accessories: 'bg-purple-50 text-purple-600 border-purple-100',
                  };

                  return (
                    <Link
                      key={cat.id}
                      href={`/category/${cat.id}`}
                      onClick={() => setMobileMenuOpen(false)}
                      className="flex items-center justify-between p-2.5 rounded-xl hover:bg-blue-50/70 border border-transparent hover:border-blue-100 text-gray-800 hover:text-blue-600 transition-all group"
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-9 h-9 rounded-xl border flex items-center justify-center transition-transform group-hover:scale-105 ${
                            catColors[cat.id] || 'bg-slate-50 text-slate-600 border-slate-200'
                          }`}
                        >
                          <Icon className="w-4 h-4" />
                        </div>
                        <span className="font-bold text-[13px]">{isRtl ? cat.nameAr : cat.name}</span>
                      </div>
                      <ArrowRight className="w-4 h-4 rtl:rotate-180 text-gray-400 group-hover:text-blue-600 group-hover:translate-x-0.5 rtl:group-hover:-translate-x-0.5 transition-all" />
                    </Link>
                  );
                })}

              {/* Special Flash Deals Highlight */}
              <Link
                href="/deals"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center justify-between p-2.5 rounded-xl bg-gradient-to-r from-red-50 to-rose-50 border border-red-100 text-red-600 font-black text-[13px] hover:shadow-xs transition-all mt-3 group"
              >
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-red-600 text-white flex items-center justify-center shadow-xs">
                    <Flame className="w-4 h-4 fill-white" />
                  </div>
                  <span>{isRtl ? 'عروض وتخفيضات اليوم' : "Today's Flash Deals"}</span>
                </div>
                <span className="px-2 py-0.5 bg-red-600 text-white rounded-md text-[10px] font-black uppercase tracking-wider shadow-2xs">
                  {isRtl ? 'تخفيضات' : 'HOT'}
                </span>
              </Link>
            </div>

            {/* Customer Care & Quick Policies */}
            <div className="p-4 border-t border-gray-100 space-y-1">
              <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2">
                {isRtl ? 'خدمات وضمان' : 'Help & Policies'}
              </div>
              <div className="grid grid-cols-2 gap-2 text-[12px]">
                <Link
                  href="/warranty"
                  onClick={() => setMobileMenuOpen(false)}
                  className="p-2 rounded-lg bg-slate-50 text-slate-700 hover:text-blue-600 hover:bg-blue-50 transition-colors font-medium"
                >
                  {isRtl ? '🛡️ الضمان الرسمي' : '🛡️ Warranty'}
                </Link>
                <Link
                  href="/shipping"
                  onClick={() => setMobileMenuOpen(false)}
                  className="p-2 rounded-lg bg-slate-50 text-slate-700 hover:text-blue-600 hover:bg-blue-50 transition-colors font-medium"
                >
                  {isRtl ? '🚚 الشحن والتوصيل' : '🚚 Delivery'}
                </Link>
                <Link
                  href="/returns"
                  onClick={() => setMobileMenuOpen(false)}
                  className="p-2 rounded-lg bg-slate-50 text-slate-700 hover:text-blue-600 hover:bg-blue-50 transition-colors font-medium"
                >
                  {isRtl ? '🔄 الاستبدال والاسترجاع' : '🔄 Returns'}
                </Link>
                <Link
                  href="/about"
                  onClick={() => setMobileMenuOpen(false)}
                  className="p-2 rounded-lg bg-slate-50 text-slate-700 hover:text-blue-600 hover:bg-blue-50 transition-colors font-medium"
                >
                  {isRtl ? 'ℹ️ عن Hubcloud' : 'ℹ️ About Us'}
                </Link>
              </div>
            </div>
          </div>

          {/* Drawer Footer */}
          <div className="p-4 border-t border-gray-200 bg-slate-50 space-y-2.5 text-[12px]">
            {/* Direct WhatsApp Action */}
            <a
              href="https://wa.me/2001060777895"
              target="_blank"
              rel="noopener noreferrer"
              className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold transition-all shadow-xs active:scale-95"
            >
              <span>💬</span>
              <span>{isRtl ? 'تواصل عبر واتساب مباشر' : 'Live WhatsApp Support'}</span>
            </a>

            {/* Hotline Phone */}
            <a
              href="tel:+2001060777895"
              className="flex items-center justify-center gap-2 text-slate-600 hover:text-blue-600 font-mono text-[11.5px] transition-colors py-0.5"
              dir="ltr"
            >
              <Phone className="w-3.5 h-3.5 text-blue-600" />
              <span>+20 010 60 777 895</span>
            </a>

            {/* Admin Center Link if Admin */}
            {currentUser?.role === 'admin' && (
              <Link
                href="/admin"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center gap-2 p-2 bg-slate-900 text-white rounded-xl font-bold justify-center text-[11px]"
              >
                <Shield className="w-3.5 h-3.5 text-cyan-400" />
                <span>{isRtl ? 'لوحة تحكم الإدارة (Admin CMS)' : 'Admin Suite'}</span>
              </Link>
            )}
          </div>
        </div>
      </div>,
      document.body
    )}
  </>
  );
};
