'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { Logo } from '@/components/layout/Logo';
import { useStore } from '@/context/StoreContext';
import { canAccessPath, isManagerUser, DEFAULT_ADMIN_ROLES } from '@/lib/rbac';
import { useLiveQuery } from '@/hooks/useLiveQuery';
import { Order } from '@/types';
import {
  LayoutDashboard,
  Package,
  ShoppingBag,
  Tag,
  Layers,
  ExternalLink,
  Shield,
  Database,
  ArrowLeft,
  Users,
  Settings,
  ShieldAlert,
  Lock,
  ArrowRight,
  Boxes,
  SlidersHorizontal,
  History,
  Menu,
  X,
  Mail,
  Globe
} from 'lucide-react';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const { currentUser, isRtl, language, setLanguage } = useStore();

  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Close mobile drawer on route change
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [pathname]);

  const fetchPendingOrdersCount = useCallback(async () => {
    const res = await fetch('/api/orders');
    const data = await res.json();
    const orders = (data.orders || []) as Order[];
    return orders.filter(o => o.orderStatus === 'processing').length;
  }, []);

  const { data: liveCount } = useLiveQuery(fetchPendingOrdersCount, 15000);
  const pendingOrdersCount = liveCount ?? 0;

  const isManager = isManagerUser(currentUser);
  const currentRole = DEFAULT_ADMIN_ROLES.find(r => r.id === currentUser?.adminRoleId) ||
    (isManager ? DEFAULT_ADMIN_ROLES[0] : null);

  interface NavItem {
    name: string;
    nameAr: string;
    href: string;
    icon: any;
    managerOnly?: boolean;
  }

  interface NavGroup {
    title: string;
    titleAr: string;
    items: NavItem[];
  }

  const navGroups: NavGroup[] = [
    {
      title: 'Overview',
      titleAr: 'الرئيسية',
      items: [
        { name: 'Dashboard Overview', nameAr: 'لوحة التحكم والإحصائيات', href: '/admin', icon: LayoutDashboard },
      ],
    },
    {
      title: 'Catalog',
      titleAr: 'الكتالوج والمنتجات',
      items: [
        { name: 'Products Catalog', nameAr: 'كتالوج المنتجات', href: '/admin/products', icon: Package },
        { name: 'Categories', nameAr: 'الأقسام والتصنيفات', href: '/admin/categories', icon: Layers },
        { name: 'Attribute Engine', nameAr: 'محرك الخصائص والمواصفات', href: '/admin/attributes', icon: SlidersHorizontal },
      ],
    },
    {
      title: 'Sales & Fulfillment',
      titleAr: 'المبيعات والعملاء',
      items: [
        { name: 'Orders Pipeline', nameAr: 'الطلبات والمبيعات', href: '/admin/orders', icon: ShoppingBag },
        { name: 'Customers & Users', nameAr: 'بيانات العملاء', href: '/admin/customers', icon: Users },
      ],
    },
    {
      title: 'Marketing & Content',
      titleAr: 'التسويق والمحتوى',
      items: [
        { name: 'Coupons & Discounts', nameAr: 'الكوبونات والتخفيضات', href: '/admin/coupons', icon: Tag },
        { name: 'Pages & Content CMS', nameAr: 'إدارة صفحات ومحتوى المتجر', href: '/admin/pages', icon: Database },
      ],
    },
    {
      title: 'System & Governance',
      titleAr: 'النظام والإعدادات',
      items: [
        { name: 'Store Settings', nameAr: 'إعدادات المتجر', href: '/admin/settings', icon: Settings },
        { name: 'Email & SMTP', nameAr: 'إدارة البريد والـ SMTP', href: '/admin/emails', icon: Mail },
        { name: 'Roles & Staff', nameAr: 'إدارة الرولز والموظفين', href: '/admin/roles', icon: ShieldAlert, managerOnly: true },
        { name: 'Audit & Activity Logs', nameAr: 'سجل العمليات والرقابة', href: '/admin/audit-logs', icon: History },
      ],
    },
  ];

  // Filter groups and items based on permissions
  const visibleGroups = navGroups
    .map((group) => ({
      ...group,
      items: group.items.filter((item) => {
        if (item.managerOnly && !isManager) return false;
        return canAccessPath(currentUser, item.href);
      }),
    }))
    .filter((group) => group.items.length > 0);

  const visibleNavItems = visibleGroups.flatMap((g) => g.items);
  const totalVisibleItems = visibleNavItems.length;

  // Route Guard: check if current route is authorized for this user
  const hasAccessToCurrentPage = canAccessPath(currentUser, pathname);

  return (
    <div dir={isRtl ? 'rtl' : 'ltr'} className="min-h-screen bg-slate-950 text-slate-100 flex flex-col md:flex-row antialiased font-sans">
      {/* Mobile Sticky Top Header (< md) */}
      <div className="md:hidden flex items-center justify-between px-4 py-3.5 bg-slate-900 border-b border-slate-800 z-30 sticky top-0 backdrop-blur-md">
        <div className="flex items-center gap-2.5">
          <Logo variant="white" size="sm" />
          <span className="text-[10px] uppercase tracking-widest text-blue-400 font-bold bg-blue-950/60 px-2 py-0.5 rounded-full border border-blue-800/40">
            Admin Suite
          </span>
        </div>

        <div className="flex items-center gap-2">
          {/* Mobile Language Switcher */}
          <button
            type="button"
            onClick={() => setLanguage(language === 'ar' ? 'en' : 'ar')}
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-slate-800 text-slate-200 text-xs font-bold border border-slate-700 active:scale-95 transition-all"
            title={language === 'ar' ? 'Switch to English' : 'التحويل للعربية'}
          >
            <Globe className="w-3.5 h-3.5 text-blue-400" />
            <span>{language === 'ar' ? 'EN' : 'عربي'}</span>
          </button>

          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors border border-slate-700/60"
            aria-label="Toggle Menu"
          >
            {isMobileMenuOpen ? <X className="w-5 h-5 text-white" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Backdrop Overlay for Mobile Drawer */}
      {isMobileMenuOpen && (
        <div
          className="fixed inset-0 bg-black/75 backdrop-blur-xs z-40 md:hidden animate-in fade-in duration-150"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Admin Sidebar (Slide-over drawer on mobile, sticky on md+) */}
      <aside
        className={`fixed inset-y-0 ${isRtl ? 'right-0 border-l' : 'left-0 border-r'} z-50 w-72 h-screen bg-slate-900 border-slate-800 flex flex-col justify-between flex-shrink-0 transition-transform duration-200 md:sticky md:top-0 md:h-screen md:w-64 md:translate-x-0 overflow-hidden ${
          isMobileMenuOpen ? 'translate-x-0 shadow-2xl' : (isRtl ? 'translate-x-full' : '-translate-x-full')
        }`}
      >
        <div className="flex flex-col flex-1 min-h-0 overflow-hidden">
          {/* Logo & Badge */}
          <div className="p-4 border-b border-slate-800 flex items-center justify-between flex-shrink-0">
            <div className="flex items-center gap-2.5">
              <Logo variant="white" size="sm" />
              <span className="text-[10px] uppercase tracking-widest text-blue-400 font-bold bg-blue-950/60 px-2 py-0.5 rounded-full border border-blue-800/40">
                Admin
              </span>
            </div>

            {/* Close Button on Mobile Drawer */}
            <button
              onClick={() => setIsMobileMenuOpen(false)}
              className="p-1 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white md:hidden"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Grouped Navigation Links with Smooth Scrolling */}
          <nav className="p-3 space-y-4 overflow-y-auto flex-1 scrollbar-thin scrollbar-thumb-slate-800">
            {visibleGroups.map((group) => (
              <div key={group.title} className="space-y-1">
                <div className="px-3 py-1 text-[10px] font-extrabold text-slate-500 uppercase tracking-wider">
                  {isRtl ? group.titleAr : group.title}
                </div>

                <div className="space-y-0.5">
                  {group.items.map((item) => {
                    const Icon = item.icon;
                    const isActive = pathname === item.href;
                    return (
                      <Link
                        key={item.href}
                        href={item.href}
                        className={`flex items-center justify-between px-3 py-2 rounded-xl text-[12.5px] font-bold transition-all ${
                          isActive
                            ? 'bg-blue-600 text-white shadow-md shadow-blue-600/20'
                            : 'text-slate-400 hover:text-white hover:bg-slate-800/70'
                        }`}
                      >
                        <div className="flex items-center gap-2.5 min-w-0">
                          <Icon className={`w-4 h-4 flex-shrink-0 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                          <span className="truncate">{isRtl ? item.nameAr : item.name}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          {item.href === '/admin/orders' && pendingOrdersCount > 0 && (
                            <span className="flex items-center justify-center w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-[9px] font-bold relative">
                              <span className="absolute inset-0 rounded-full border border-emerald-500 animate-ping opacity-75"></span>
                              {pendingOrdersCount}
                            </span>
                          )}
                          {item.managerOnly && (
                            <span className="text-[9px] font-mono px-1.5 py-0.2 rounded bg-purple-500/20 text-purple-300 ml-1">
                              Owner
                            </span>
                          )}
                        </div>
                      </Link>
                    );
                  })}
                </div>
              </div>
            ))}
          </nav>
        </div>

        {/* Bottom Sidebar: Staff Info & Return to Store (Always pinned & visible on all pages) */}
        <div className="p-4 border-t border-slate-800 space-y-3 flex-shrink-0 bg-slate-900 z-10">
          <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800/80 space-y-1">
            <div className="text-[11px] font-bold text-white truncate">
              {currentUser?.name || 'Hub Cloud Admin'}
            </div>
            <div className="flex items-center gap-1.5">
              <span className={`w-2 h-2 rounded-full ${isManager || !currentUser ? 'bg-purple-400' : 'bg-blue-400'}`} />
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider truncate">
                {isManager || !currentUser ? 'General Manager' : (currentRole?.name || 'Staff Member')}
              </span>
            </div>
          </div>

          {/* Language Switcher in Sidebar */}
          <button
            type="button"
            onClick={() => setLanguage(language === 'ar' ? 'en' : 'ar')}
            className="w-full flex items-center justify-between p-2.5 rounded-xl bg-slate-950/60 hover:bg-slate-800 text-slate-300 hover:text-white text-[12px] font-bold transition-colors border border-slate-800 active:scale-98"
          >
            <div className="flex items-center gap-2">
              <Globe className="w-4 h-4 text-blue-400" />
              <span>{isRtl ? 'لغة اللوحة' : 'Language'}</span>
            </div>
            <span className="text-[11px] font-mono px-2 py-0.5 rounded-md bg-blue-600/20 text-blue-300 border border-blue-500/30">
              {language === 'ar' ? 'العربية' : 'English'}
            </span>
          </button>

          <Link
            href="/"
            className="flex items-center justify-between p-3 rounded-xl bg-slate-800/60 hover:bg-slate-800 text-slate-300 hover:text-white text-[12px] font-bold transition-colors border border-slate-700/50"
          >
            <div className="flex items-center gap-2">
              <ArrowLeft className="w-4 h-4 rtl:rotate-180" />
              <span>{isRtl ? 'معاينة المتجر' : 'View Live Store'}</span>
            </div>
            <ExternalLink className="w-3.5 h-3.5 text-slate-400" />
          </Link>
        </div>
      </aside>

      {/* Main Admin Content */}
      <main className="flex-1 flex flex-col min-w-0">
        {/* Desktop Top Header (Hidden on small screens) */}
        <header className="hidden md:flex h-16 bg-slate-900/60 backdrop-blur-md border-b border-slate-800 px-6 items-center justify-between flex-shrink-0">
          <div className="flex items-center gap-3">
            <span className="text-sm font-bold text-slate-300">
              {isRtl ? 'مركز إدارة وعمليات HUB CLOUD' : 'HUB CLOUD Operations Center'}
            </span>
          </div>

          <div className="flex items-center gap-3">
            {/* Desktop Language Switcher */}
            <button
              type="button"
              onClick={() => setLanguage(language === 'ar' ? 'en' : 'ar')}
              className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold transition-all border border-slate-700 hover:border-blue-500/50 shadow-xs"
              title={isRtl ? 'تبديل لغة لوحة التحكم إلى English' : 'Switch dashboard language to العربية'}
            >
              <Globe className="w-3.5 h-3.5 text-blue-400" />
              <span>{language === 'ar' ? 'English (EN)' : 'العربية (AR)'}</span>
            </button>

            <div className={`flex items-center gap-2 text-[12px] px-3 py-1.5 rounded-xl border ${
              isManager
                ? 'bg-purple-500/10 text-purple-300 border-purple-500/30 font-bold'
                : 'bg-slate-800 text-slate-300 border-slate-700 font-medium'
            }`}>
              <Shield className={`w-3.5 h-3.5 ${isManager ? 'text-purple-400' : 'text-blue-400'}`} />
              <span>{isManager ? (isRtl ? 'المدير العام (Super Admin)' : 'Store Manager (Super Admin)') : (isRtl ? (currentRole?.nameAr || 'موظف مصرح') : (currentRole?.name || 'Authorized Staff'))}</span>
            </div>
          </div>
        </header>

        {/* Content Body with Route Guarding */}
        <div className="flex-1 p-3.5 sm:p-6 overflow-y-auto">
          {hasAccessToCurrentPage ? (
            children
          ) : (
            <div className="max-w-xl mx-auto py-20 text-center space-y-5">
              <div className="w-16 h-16 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center mx-auto text-amber-400">
                <Lock className="w-8 h-8" />
              </div>
              <div className="space-y-2">
                <h2 className="text-xl font-black text-white">
                  {isRtl ? 'غير مصرح بالوصول إلى هذه الصفحة' : 'Access Restricted'}
                </h2>
                <p className="text-slate-400 text-sm leading-relaxed">
                  {isRtl
                    ? `رتبتك الحالية (${currentRole?.nameAr || 'موظف'}) لا تملك صلاحية لفتح هذا القسم. يرجى التواصل مع المدير العام للمتجر لمنحك الصلاحية.`
                    : `Your assigned staff role (${currentRole?.name || 'Staff'}) does not have permission to view this section. Please contact the General Store Manager.`}
                </p>
              </div>
              <div className="pt-2">
                <Link
                  href={visibleNavItems[0]?.href || '/admin'}
                  className="inline-flex items-center gap-2 px-5 py-2.5 bg-hub-blue text-white rounded-xl text-xs font-bold hover:bg-hub-blue-dark transition-colors shadow"
                >
                  <span>{isRtl ? 'العودة إلى القسم المتاح' : 'Go to Permitted Section'}</span>
                  <ArrowRight className="w-4 h-4 rtl:rotate-180" />
                </Link>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
