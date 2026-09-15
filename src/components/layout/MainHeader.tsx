'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
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

  const [categoryDropdownOpen, setCategoryDropdownOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);

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
    <header className="bg-white border-b border-gray-200 sticky top-0 z-40 shadow-sm">
      <div className="max-w-[1536px] mx-auto px-4 sm:px-6 py-2.5 sm:py-3.5 flex items-center justify-between gap-3 sm:gap-4 lg:gap-8">
        {/* Mobile Menu Button */}
        <button
          onClick={() => setMobileMenuOpen(true)}
          className="lg:hidden p-2 rounded-xl text-gray-700 hover:bg-gray-100 transition-colors"
          aria-label="Open mobile menu"
        >
          <Menu className="w-6 h-6" />
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
              className="hidden sm:flex flex-col items-center group text-gray-700 hover:text-hub-blue transition-colors"
              title="Admin CMS Dashboard"
            >
              <Shield className="w-5 h-5 text-purple-600 group-hover:text-hub-blue transition-colors" />
              <span className="text-[11px] font-bold mt-0.5 text-purple-700">{isRtl ? 'الإدارة' : 'Admin'}</span>
            </Link>
          )}

          {/* Compare */}
          <Link
            href="/compare"
            className="hidden sm:flex flex-col items-center group text-gray-700 hover:text-hub-blue transition-colors relative"
          >
            <div className="relative">
              <Shuffle className="w-5 h-5 text-gray-600 group-hover:text-hub-blue transition-colors" />
              {compareCount > 0 && (
                <span className="absolute -top-1.5 -right-2 bg-hub-blue text-white text-[10px] font-black w-4 h-4 rounded-full flex items-center justify-center">
                  {compareCount}
                </span>
              )}
            </div>
            <span className="text-[11px] font-bold mt-0.5">{isRtl ? 'المقارنة' : 'Compare'}</span>
          </Link>

          {/* Wishlist */}
          <Link
            href="/wishlist"
            className="flex flex-col items-center group text-gray-700 hover:text-hub-blue transition-colors relative"
          >
            <div className="relative">
              <Heart className="w-5 h-5 text-gray-600 group-hover:text-hub-blue transition-colors" />
              {wishlistCount > 0 && (
                <span className="absolute -top-1.5 -right-2 bg-hub-blue text-white text-[10px] font-black w-4 h-4 rounded-full flex items-center justify-center">
                  {wishlistCount}
                </span>
              )}
            </div>
            <span className="text-[11px] font-bold mt-0.5 hidden sm:inline">{isRtl ? 'المفضلة' : 'Wishlist'}</span>
          </Link>

          {/* Account / User Menu */}
          <div className="relative">
            {currentUser ? (
              <div>
                <button
                  type="button"
                  onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                  className="flex flex-col items-center group text-gray-700 hover:text-hub-blue transition-colors relative"
                >
                  <div className="w-6 h-6 rounded-full bg-blue-100 border border-blue-200 text-blue-700 font-bold text-[10px] flex items-center justify-center group-hover:bg-blue-600 group-hover:text-white transition-colors">
                    {currentUser.name.slice(0, 2).toUpperCase()}
                  </div>
                  <span className="text-[11px] font-bold mt-0.5 max-w-[60px] truncate hidden sm:inline">
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
                        className="flex items-center gap-2.5 px-4 py-2 text-purple-700 font-bold hover:bg-purple-50 transition-colors"
                      >
                        <Shield className="w-4 h-4 text-purple-600" />
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
                className="flex flex-col items-center group text-gray-700 hover:text-hub-blue transition-colors"
              >
                <User className="w-5 h-5 text-gray-600 group-hover:text-hub-blue transition-colors" />
                <span className="text-[11px] font-bold mt-0.5 hidden sm:inline">{isRtl ? 'دخول' : 'Sign In'}</span>
              </Link>
            )}
          </div>

          {/* Cart */}
          <Link
            href="/cart"
            className="flex items-center gap-2 group bg-blue-50/80 hover:bg-blue-100 text-hub-blue px-3 py-1.5 rounded-xl border border-blue-200 transition-colors"
          >
            <div className="relative">
              <ShoppingCart className="w-5 h-5 text-hub-blue transition-transform group-hover:scale-110" />
              {cartCount > 0 && (
                <span className="absolute -top-2 -right-2.5 bg-hub-blue text-white text-[11px] font-black w-4.5 h-4.5 rounded-full flex items-center justify-center px-1 shadow-sm">
                  {cartCount}
                </span>
              )}
            </div>
            <div className="hidden xl:flex flex-col text-start">
              <span className="text-[10px] text-gray-500 uppercase font-bold leading-none">{isRtl ? 'السلة' : 'Cart'}</span>
              <span className="text-[12px] font-black text-hub-blue leading-tight font-mono">{formatPrice(subtotal)}</span>
            </div>
          </Link>

          {/* Language Toggle Button (Next to Cart) */}
          <button
            type="button"
            onClick={() => setLanguage(language === 'ar' ? 'en' : 'ar')}
            className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-xl border border-gray-200 hover:border-hub-blue hover:bg-blue-50/70 text-gray-700 hover:text-hub-blue transition-all text-[12px] font-bold shadow-2xs"
            title={isRtl ? 'Switch to English' : 'التحويل للغة العربية'}
            aria-label="Change Language"
          >
            <Globe className="w-4 h-4 text-hub-blue" />
            <span className="font-extrabold uppercase">
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

      {/* Mobile Drawer Navigation (Slide-over) */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 flex">
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity"
            onClick={() => setMobileMenuOpen(false)}
          />

          {/* Drawer Content */}
          <div className="relative w-4/5 max-w-sm bg-white h-full shadow-2xl flex flex-col justify-between z-10 animate-in slide-in-from-left rtl:slide-in-from-right duration-300">
            {/* Drawer Header */}
            <div>
              <div className="p-4 border-b border-gray-100 flex items-center justify-between bg-slate-900 text-white">
                <Logo size="sm" />
                <button
                  onClick={() => setMobileMenuOpen(false)}
                  className="p-1 rounded-lg bg-slate-800 text-white hover:bg-slate-700"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Language Switcher in Drawer */}
              <div className="p-3 bg-blue-50/60 border-b border-blue-100 flex items-center justify-between text-[12px]">
                <span className="font-bold text-gray-700 flex items-center gap-1.5">
                  <Globe className="w-4 h-4 text-hub-blue" />
                  {isRtl ? 'اللغة' : 'Language'}
                </span>
                <button
                  onClick={() => setLanguage(language === 'ar' ? 'en' : 'ar')}
                  className="px-3 py-1 bg-white border border-blue-200 rounded-lg font-black text-hub-blue shadow-2xs"
                >
                  {language === 'ar' ? 'English (EN)' : 'العربية (AR)'}
                </button>
              </div>

              {/* 5 Core Categories Links */}
              <div className="p-3 space-y-1">
                <div className="px-3 py-1.5 text-[11px] font-black text-gray-400 uppercase tracking-wider">
                  {isRtl ? 'الأقسام الرئيسية' : 'Categories'}
                </div>

                {categories.filter(c => c.id !== 'all').map((cat) => {
                  const Icon = cat.icon;
                  return (
                    <Link
                      key={cat.id}
                      href={`/category/${cat.id}`}
                      onClick={() => setMobileMenuOpen(false)}
                      className="flex items-center justify-between p-3 rounded-xl hover:bg-blue-50 text-gray-800 hover:text-hub-blue font-bold text-[13px] transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-gray-100 text-hub-blue rounded-lg">
                          <Icon className="w-4 h-4" />
                        </div>
                        <span>{isRtl ? cat.nameAr : cat.name}</span>
                      </div>
                      <ArrowRight className="w-4 h-4 rtl:rotate-180 text-gray-400" />
                    </Link>
                  );
                })}

                <Link
                  href="/deals"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center justify-between p-3 rounded-xl bg-red-50 text-red-600 font-black text-[13px] transition-colors mt-2"
                >
                  <div className="flex items-center gap-3">
                    <Flame className="w-4 h-4 text-red-600 fill-red-600" />
                    <span>{isRtl ? 'عروض وتخفيضات اليوم' : "Today's Flash Deals"}</span>
                  </div>
                  <span className="px-2 py-0.5 bg-red-600 text-white rounded text-[10px] font-bold">HOT</span>
                </Link>
              </div>
            </div>

            {/* Drawer Bottom */}
            <div className="p-4 border-t border-gray-100 bg-gray-50 space-y-2 text-[12px]">
              {currentUser?.role === 'admin' && (
                <Link
                  href="/admin"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center gap-2 p-2.5 bg-slate-900 text-white rounded-xl font-bold justify-center"
                >
                  <Shield className="w-4 h-4 text-cyan-400" />
                  <span>{isRtl ? 'لوحة تحكم الإدارة (Admin CMS)' : 'Admin Operations Center'}</span>
                </Link>
              )}
              <div className="flex items-center justify-center gap-2 text-gray-500 pt-1">
                <Phone className="w-3.5 h-3.5 text-hub-blue" />
                <span>(+20) 010 222 88 444</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </header>
  );
};
