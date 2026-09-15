'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { useStore } from '@/context/StoreContext';
import {
  TrendingUp,
  Package,
  ShoppingBag,
  Plus,
  ArrowUpRight,
  DollarSign,
  BarChart3,
  RefreshCw,
  Sparkles,
  Layers,
  SlidersHorizontal,
  ExternalLink,
  Calendar,
  ArrowRight,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';

interface DbStats {
  totalRevenue: number;
  totalOrders: number;
  averageOrderValue: number;
  totalProducts: number;
  totalCategories: number;
  statusBreakdown: {
    processing: number;
    shipped: number;
    delivered: number;
    cancelled: number;
  };
  monthlyBreakdown: {
    label: string;
    labelAr: string;
    revenue: number;
    orders: number;
  }[];
  quarterlyBreakdown: {
    label: string;
    labelAr: string;
    revenue: number;
    orders: number;
  }[];
}

interface DbOrder {
  id: string;
  createdAt: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  city: string;
  orderStatus: string;
  paymentStatus: string;
  total: number;
  items?: { id: string; productName: string; quantity: number }[];
}

export default function AdminDashboardPage() {
  const { isRtl, formatPrice, showToast, currentUser } = useStore();

  const [stats, setStats] = useState<DbStats | null>(null);
  const [recentOrders, setRecentOrders] = useState<DbOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState<'month' | 'quarter'>('month');
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Fetch real statistics and real orders directly from the Database API
  const fetchDashboardData = useCallback(async () => {
    try {
      const res = await fetch('/api/admin/stats');
      const data = await res.json();
      if (data.success && data.stats) {
        setStats(data.stats);
        if (Array.isArray(data.recentOrders)) {
          setRecentOrders(data.recentOrders);
        }
      }
    } catch (err) {
      console.warn('Failed to load database stats:', err);
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  const handleManualRefresh = async () => {
    setIsRefreshing(true);
    await fetchDashboardData();
    showToast(isRtl ? 'تم تحديث البيانات من قاعدة البيانات!' : 'Data refreshed from Database!', 'info');
  };

  const handleUpdateOrderStatus = async (orderId: string, newStatus: string) => {
    try {
      const res = await fetch(`/api/orders/${orderId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderStatus: newStatus }),
      });
      const data = await res.json();
      if (data.success) {
        showToast(isRtl ? 'تم تحديث حالة الطلب في قاعدة البيانات' : 'Order status updated in DB', 'success');
        // Refresh live stats from DB
        fetchDashboardData();
      } else {
        showToast(data.error || 'Failed to update order', 'error');
      }
    } catch (err: any) {
      showToast(err.message, 'error');
    }
  };

  // Safe fallback values from DB
  const totalRevenue = stats?.totalRevenue ?? 0;
  const totalOrders = stats?.totalOrders ?? 0;
  const averageOrderValue = stats?.averageOrderValue ?? 0;
  const totalProducts = stats?.totalProducts ?? 0;
  const totalCategories = stats?.totalCategories ?? 0;

  const processingCount = stats?.statusBreakdown?.processing ?? 0;
  const shippedCount = stats?.statusBreakdown?.shipped ?? 0;
  const deliveredCount = stats?.statusBreakdown?.delivered ?? 0;
  const cancelledCount = stats?.statusBreakdown?.cancelled ?? 0;

  const getPercentage = (count: number) => {
    if (totalOrders === 0) return 0;
    return Math.round((count / totalOrders) * 100);
  };

  // Dynamic Monthly / Quarterly Breakdown from DB
  const activeBreakdown = (timeRange === 'month' ? stats?.monthlyBreakdown : stats?.quarterlyBreakdown) || [];
  const maxRevenue = Math.max(...activeBreakdown.map((d) => d.revenue), 1);
  const activePeriodSales = activeBreakdown.reduce((s, d) => s + d.revenue, 0);
  const activePeriodOrders = activeBreakdown.reduce((s, d) => s + d.orders, 0);

  // Current Date formatted
  const todayFormatted = new Date().toLocaleDateString(isRtl ? 'ar-EG' : 'en-US', {
    weekday: 'short',
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });

  return (
    <div className="space-y-6 sm:space-y-8 max-w-7xl mx-auto pb-10">
      {/* ========================================================================= */}
      {/* 1. EXECUTIVE WELCOME BANNER                                               */}
      {/* ========================================================================= */}
      <div className="relative overflow-hidden bg-gradient-to-br from-slate-900 via-slate-900/95 to-slate-950 border border-slate-800 rounded-3xl p-5 sm:p-7 shadow-xl backdrop-blur-xl">
        <div className="absolute top-0 right-1/4 w-80 h-80 bg-blue-500/10 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20" />
        <div className="absolute bottom-0 left-10 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none -mb-20" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between gap-5">
          <div className="space-y-1.5 min-w-0">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-bold">
              <Calendar className="w-3.5 h-3.5" />
              <span>{todayFormatted}</span>
            </div>

            <h1 className="text-xl sm:text-2xl md:text-3xl font-black text-white tracking-tight break-words">
              {isRtl ? (
                <>مرحباً بك، <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-300">{currentUser?.name || 'مدير المتجر'}</span> 👋</>
              ) : (
                <>Welcome back, <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-300">{currentUser?.name || 'Store Admin'}</span> 👋</>
              )}
            </h1>

            <p className="text-xs sm:text-sm text-slate-400 max-w-xl">
              {isRtl
                ? 'لوحة متابعة الأداء، المبيعات، والطلبات المسجلة في قاعدة البيانات الفعلية.'
                : 'Executive live overview of revenue, hardware catalog, and database orders.'}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5 sm:gap-3 shrink-0">
            <button
              onClick={handleManualRefresh}
              className="p-2.5 rounded-2xl bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors border border-slate-700/60 shadow-xs"
              title={isRtl ? 'تحديث البيانات من قاعدة البيانات' : 'Refresh Data from DB'}
            >
              <RefreshCw className={`w-4 h-4 ${isRefreshing || loading ? 'animate-spin text-blue-400' : ''}`} />
            </button>

            <Link
              href="/"
              target="_blank"
              className="flex items-center gap-2 px-3.5 sm:px-4 py-2.5 rounded-2xl bg-slate-800/90 hover:bg-slate-700 text-slate-200 text-xs font-bold transition-all border border-slate-700/80 shadow-xs"
            >
              <ExternalLink className="w-3.5 h-3.5 text-slate-400" />
              <span>{isRtl ? 'المتجر' : 'Store'}</span>
            </Link>

            <Link
              href="/admin/products"
              className="flex items-center gap-2 px-4 sm:px-5 py-2.5 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white text-xs font-bold transition-all shadow-md shadow-blue-500/25 active:scale-95"
            >
              <Plus className="w-4 h-4" />
              <span>{isRtl ? '+ إضافة منتج' : '+ Add Product'}</span>
            </Link>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 2. REAL DATABASE KPI METRIC CARDS (4 ELEVATED CARDS)                      */}
      {/* ========================================================================= */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5 sm:gap-4">
        {/* Card 1: Gross Sales from DB */}
        <div className="relative overflow-hidden bg-slate-900/90 border border-slate-800 rounded-3xl p-5 hover:border-slate-700 transition-all shadow-lg group">
          <div className="flex items-center justify-between pb-2">
            <span className="text-[11px] font-extrabold uppercase tracking-wider text-slate-400">
              {isRtl ? 'إجمالي المبيعات' : 'Gross Revenue'}
            </span>
            <div className="w-9 h-9 rounded-2xl bg-blue-500/10 border border-blue-500/20 text-blue-400 flex items-center justify-center group-hover:scale-105 transition-transform">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <div className="space-y-1">
            <div className="text-xl sm:text-2xl font-black text-white font-mono tracking-tight break-words">
              {formatPrice(totalRevenue)}
            </div>
            <div className="flex items-center gap-1 text-[11px] text-slate-400">
              <span className="text-emerald-400 font-bold">{totalOrders}</span>
              <span>{isRtl ? 'إجمالي طلبات المتجر' : 'Total store orders'}</span>
            </div>
          </div>
        </div>

        {/* Card 2: Orders Pipeline from DB */}
        <div className="relative overflow-hidden bg-slate-900/90 border border-slate-800 rounded-3xl p-5 hover:border-slate-700 transition-all shadow-lg group">
          <div className="flex items-center justify-between pb-2">
            <span className="text-[11px] font-extrabold uppercase tracking-wider text-slate-400">
              {isRtl ? 'الطلبات المسجلة' : 'Total Orders'}
            </span>
            <div className="w-9 h-9 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 flex items-center justify-center group-hover:scale-105 transition-transform">
              <ShoppingBag className="w-4 h-4" />
            </div>
          </div>
          <div className="space-y-1">
            <div className="text-xl sm:text-2xl font-black text-white font-mono tracking-tight">
              {totalOrders} <span className="text-xs font-normal text-slate-400 font-sans">{isRtl ? 'طلب' : 'Orders'}</span>
            </div>
            <div className="flex items-center gap-2 text-[11px] text-slate-400 font-bold truncate">
              <span className="text-amber-400">{processingCount} {isRtl ? 'تجهيز' : 'Proc.'}</span>
              <span>•</span>
              <span className="text-emerald-400">{deliveredCount} {isRtl ? 'تم التسليم' : 'Delivered'}</span>
            </div>
          </div>
        </div>

        {/* Card 3: Average Order Value (AOV) */}
        <div className="relative overflow-hidden bg-slate-900/90 border border-slate-800 rounded-3xl p-5 hover:border-slate-700 transition-all shadow-lg group">
          <div className="flex items-center justify-between pb-2">
            <span className="text-[11px] font-extrabold uppercase tracking-wider text-slate-400">
              {isRtl ? 'متوسط قيمة الطلب' : 'Average Order (AOV)'}
            </span>
            <div className="w-9 h-9 rounded-2xl bg-purple-500/10 border border-purple-500/20 text-purple-400 flex items-center justify-center group-hover:scale-105 transition-transform">
              <Sparkles className="w-4 h-4" />
            </div>
          </div>
          <div className="space-y-1">
            <div className="text-xl sm:text-2xl font-black text-white font-mono tracking-tight break-words">
              {formatPrice(averageOrderValue)}
            </div>
            <p className="text-[11px] text-slate-400 truncate">
              {isRtl ? 'محسوب من الطلبات المكتملة' : 'Calculated from active orders'}
            </p>
          </div>
        </div>

        {/* Card 4: Hardware Catalog & Categories from DB */}
        <div className="relative overflow-hidden bg-slate-900/90 border border-slate-800 rounded-3xl p-5 hover:border-slate-700 transition-all shadow-lg group">
          <div className="flex items-center justify-between pb-2">
            <span className="text-[11px] font-extrabold uppercase tracking-wider text-slate-400">
              {isRtl ? 'كتالوج الأجهزة' : 'Hardware Catalog'}
            </span>
            <div className="w-9 h-9 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center group-hover:scale-105 transition-transform">
              <Package className="w-4 h-4" />
            </div>
          </div>
          <div className="space-y-1">
            <div className="text-xl sm:text-2xl font-black text-white font-mono tracking-tight">
              {totalProducts} <span className="text-xs font-normal text-slate-400 font-sans">{isRtl ? 'منتج' : 'Products'}</span>
            </div>
            <p className="text-[11px] text-slate-400 flex items-center gap-1 truncate">
              <span className="text-emerald-400 font-bold">{totalCategories}</span>
              <span>{isRtl ? 'أقسام وتصنيفات مسجلة في الداتابيز' : 'Active database categories'}</span>
            </p>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 3. QUICK CATALOG SHORTCUTS                                                */}
      {/* ========================================================================= */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5 sm:gap-4">
        <Link
          href="/admin/products"
          className="bg-slate-900/70 hover:bg-slate-800/80 border border-slate-800 hover:border-blue-500/40 rounded-2xl p-4 transition-all flex items-center justify-between group"
        >
          <div className="flex items-center gap-3 min-w-0">
            <div className="p-2.5 rounded-xl bg-blue-500/10 text-blue-400 border border-blue-500/20 group-hover:scale-105 transition-transform shrink-0">
              <Package className="w-4 h-4" />
            </div>
            <div className="min-w-0">
              <h3 className="text-xs sm:text-sm font-bold text-white group-hover:text-blue-400 transition-colors truncate">
                {isRtl ? 'كتالوج المنتجات' : 'Products Catalog'}
              </h3>
              <p className="text-[11px] text-slate-400 truncate">
                {isRtl ? 'الأسعار والمخزون' : 'Pricing & stock management'}
              </p>
            </div>
          </div>
          <ArrowRight className={`w-4 h-4 text-slate-500 group-hover:text-white transition-transform shrink-0 ${isRtl ? 'rotate-180' : ''}`} />
        </Link>

        <Link
          href="/admin/categories"
          className="bg-slate-900/70 hover:bg-slate-800/80 border border-slate-800 hover:border-indigo-500/40 rounded-2xl p-4 transition-all flex items-center justify-between group"
        >
          <div className="flex items-center gap-3 min-w-0">
            <div className="p-2.5 rounded-xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 group-hover:scale-105 transition-transform shrink-0">
              <Layers className="w-4 h-4" />
            </div>
            <div className="min-w-0">
              <h3 className="text-xs sm:text-sm font-bold text-white group-hover:text-indigo-400 transition-colors truncate">
                {isRtl ? 'الأقسام والتصنيفات' : 'Categories Hub'}
              </h3>
              <p className="text-[11px] text-slate-400 truncate">
                {isRtl ? 'تصنيفات المتجر والمواصفات' : 'Single-level categories'}
              </p>
            </div>
          </div>
          <ArrowRight className={`w-4 h-4 text-slate-500 group-hover:text-white transition-transform shrink-0 ${isRtl ? 'rotate-180' : ''}`} />
        </Link>

        <Link
          href="/admin/attributes"
          className="bg-slate-900/70 hover:bg-slate-800/80 border border-slate-800 hover:border-purple-500/40 rounded-2xl p-4 transition-all flex items-center justify-between group"
        >
          <div className="flex items-center gap-3 min-w-0">
            <div className="p-2.5 rounded-xl bg-purple-500/10 text-purple-400 border border-purple-500/20 group-hover:scale-105 transition-transform shrink-0">
              <SlidersHorizontal className="w-4 h-4" />
            </div>
            <div className="min-w-0">
              <h3 className="text-xs sm:text-sm font-bold text-white group-hover:text-purple-400 transition-colors truncate">
                {isRtl ? 'مواصفات وفلاتر الأجهزة' : 'Attributes & Filters'}
              </h3>
              <p className="text-[11px] text-slate-400 truncate">
                {isRtl ? 'خيارات الرام والمعالج' : 'Specs, tags, & filters'}
              </p>
            </div>
          </div>
          <ArrowRight className={`w-4 h-4 text-slate-500 group-hover:text-white transition-transform shrink-0 ${isRtl ? 'rotate-180' : ''}`} />
        </Link>
      </div>

      {/* ========================================================================= */}
      {/* 4. REAL DATABASE SALES OVERVIEW & FULFILLMENT PIPELINE                    */}
      {/* ========================================================================= */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-stretch">
        {/* Real Sales Breakdown (7 Cols) */}
        <div className="lg:col-span-7 bg-slate-900/90 border border-slate-800 rounded-3xl p-5 sm:p-6 flex flex-col justify-between shadow-xl">
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pb-4 border-b border-slate-800">
              <div>
                <h2 className="font-black text-white text-sm sm:text-base flex items-center gap-2">
                  <BarChart3 className="w-4 h-4 text-blue-400 shrink-0" />
                  <span>
                    {timeRange === 'month'
                      ? (isRtl ? 'حركة المبيعات الشهرية (من الداتابيز)' : 'Monthly Sales (from DB)')
                      : (isRtl ? 'حركة المبيعات ربع السنوية (من الداتابيز)' : 'Quarterly Sales (from DB)')}
                  </span>
                </h2>
                <span className="text-xs text-slate-400 block mt-0.5">
                  {isRtl ? 'بيانات وإحصائيات دقيقة محسوبة من طلبات قاعدة البيانات' : 'Calculated accurately from database orders table'}
                </span>
              </div>

              {/* Functional Toggle */}
              <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-xl border border-slate-800 text-xs font-bold self-start sm:self-auto">
                <button
                  type="button"
                  onClick={() => setTimeRange('month')}
                  className={`px-3 py-1 rounded-lg transition-all ${
                    timeRange === 'month' ? 'bg-blue-600 text-white shadow-xs' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  {isRtl ? 'شهري' : 'Monthly'}
                </button>
                <button
                  type="button"
                  onClick={() => setTimeRange('quarter')}
                  className={`px-3 py-1 rounded-lg transition-all ${
                    timeRange === 'quarter' ? 'bg-blue-600 text-white shadow-xs' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  {isRtl ? 'ربع سنوي' : 'Quarterly'}
                </button>
              </div>
            </div>

            {/* Financial Highlights */}
            <div className="grid grid-cols-2 gap-3 bg-slate-950/60 p-3 rounded-2xl border border-slate-800/80">
              <div>
                <span className="text-[10px] uppercase font-bold text-slate-400 block">
                  {isRtl ? 'مبيعات الفترة الفعلية' : 'Period Actual Sales'}
                </span>
                <span className="text-base sm:text-lg font-black text-white font-mono">
                  {formatPrice(activePeriodSales)}
                </span>
              </div>
              <div>
                <span className="text-[10px] uppercase font-bold text-slate-400 block">
                  {isRtl ? 'طلبات الفترة' : 'Period Orders'}
                </span>
                <span className="text-base sm:text-lg font-black text-blue-400 font-mono">
                  {activePeriodOrders} {isRtl ? 'طلب' : 'orders'}
                </span>
              </div>
            </div>

            {/* Dynamic Scaled Bars from Real DB Aggregations */}
            <div className="h-44 sm:h-52 flex items-end justify-between gap-2 sm:gap-4 pt-4 px-1">
              {activeBreakdown.map((item, idx) => {
                // If revenue is 0, give minimum 6% height so bar is visible as empty baseline
                const hasRev = item.revenue > 0;
                const barHeightPercent = hasRev
                  ? Math.max(15, Math.round((item.revenue / maxRevenue) * 100))
                  : 6;

                return (
                  <div key={idx} className="flex-1 flex flex-col items-center gap-1.5 group h-full justify-end min-w-0">
                    <div className="opacity-0 group-hover:opacity-100 transition-opacity text-[10px] font-mono font-bold bg-slate-950 border border-slate-800 text-blue-300 px-2 py-1 rounded-lg shadow-xl whitespace-nowrap pointer-events-none mb-1 z-10">
                      {formatPrice(item.revenue)} ({item.orders} {isRtl ? 'طلب' : 'ord'})
                    </div>

                    <div
                      style={{ height: `${barHeightPercent}%` }}
                      className={`w-full max-w-[40px] rounded-t-xl transition-all group-hover:brightness-125 ${
                        hasRev
                          ? 'bg-gradient-to-t from-blue-600 to-indigo-500 shadow-md shadow-blue-500/20'
                          : 'bg-slate-800/60'
                      }`}
                    />

                    <span className="text-[10px] sm:text-[11px] font-bold text-slate-400 group-hover:text-white transition-colors truncate max-w-full text-center">
                      {isRtl ? item.labelAr : item.label}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-400 mt-4">
            <span className="flex items-center gap-1.5 font-bold text-[11px]">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>{isRtl ? 'بيانات حية ومباشرة من PostgreSQL' : 'Live from PostgreSQL DB'}</span>
            </span>
            <span className="text-[11px] text-slate-400 font-mono">
              {isRtl ? `${totalOrders} طلب إجمالي` : `${totalOrders} total orders`}
            </span>
          </div>
        </div>

        {/* Real Orders Pipeline Breakdown from DB (5 Cols) */}
        <div className="lg:col-span-5 bg-slate-900/90 border border-slate-800 rounded-3xl p-5 sm:p-6 flex flex-col justify-between shadow-xl space-y-5">
          <div className="space-y-4">
            <div className="flex items-center justify-between pb-4 border-b border-slate-800">
              <div>
                <h2 className="font-black text-white text-sm sm:text-base flex items-center gap-2">
                  <ShoppingBag className="w-4 h-4 text-indigo-400 shrink-0" />
                  <span>{isRtl ? 'توزيع حالات الطلبات' : 'Orders Fulfillment'}</span>
                </h2>
              </div>

              <Link
                href="/admin/orders"
                className="text-xs font-bold text-blue-400 hover:text-blue-300 transition-colors shrink-0"
              >
                {isRtl ? 'عرض الكل' : 'View All'}
              </Link>
            </div>

            {/* Fulfillment Progress Bars */}
            <div className="space-y-3.5">
              {/* Delivered */}
              <div className="space-y-1">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-slate-200 flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 shrink-0" />
                    <span>{isRtl ? 'تم التسليم بنجاح (Delivered)' : 'Delivered'}</span>
                  </span>
                  <span className="font-mono text-emerald-400 font-bold">
                    {deliveredCount} ({getPercentage(deliveredCount)}%)
                  </span>
                </div>
                <div className="w-full h-2 rounded-full bg-slate-950 overflow-hidden border border-slate-800">
                  <div
                    className="h-full bg-emerald-500 rounded-full transition-all"
                    style={{ width: `${getPercentage(deliveredCount)}%` }}
                  />
                </div>
              </div>

              {/* Shipped */}
              <div className="space-y-1">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-slate-200 flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-blue-400 shrink-0" />
                    <span>{isRtl ? 'تم الشحن في الطريق (Shipped)' : 'Shipped & En Route'}</span>
                  </span>
                  <span className="font-mono text-blue-400 font-bold">
                    {shippedCount} ({getPercentage(shippedCount)}%)
                  </span>
                </div>
                <div className="w-full h-2 rounded-full bg-slate-950 overflow-hidden border border-slate-800">
                  <div
                    className="h-full bg-blue-500 rounded-full transition-all"
                    style={{ width: `${getPercentage(shippedCount)}%` }}
                  />
                </div>
              </div>

              {/* Processing */}
              <div className="space-y-1">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-slate-200 flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-amber-400 shrink-0" />
                    <span>{isRtl ? 'قيد التجهيز (Processing)' : 'Processing'}</span>
                  </span>
                  <span className="font-mono text-amber-400 font-bold">
                    {processingCount} ({getPercentage(processingCount)}%)
                  </span>
                </div>
                <div className="w-full h-2 rounded-full bg-slate-950 overflow-hidden border border-slate-800">
                  <div
                    className="h-full bg-amber-500 rounded-full transition-all"
                    style={{ width: `${getPercentage(processingCount)}%` }}
                  />
                </div>
              </div>

              {/* Cancelled */}
              <div className="space-y-1">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-slate-200 flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-red-400 shrink-0" />
                    <span>{isRtl ? 'طلبات ملغية (Cancelled)' : 'Cancelled'}</span>
                  </span>
                  <span className="font-mono text-red-400 font-bold">
                    {cancelledCount} ({getPercentage(cancelledCount)}%)
                  </span>
                </div>
                <div className="w-full h-2 rounded-full bg-slate-950 overflow-hidden border border-slate-800">
                  <div
                    className="h-full bg-red-500 rounded-full transition-all"
                    style={{ width: `${getPercentage(cancelledCount)}%` }}
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="pt-3 border-t border-slate-800/80 text-center">
            <Link
              href="/admin/orders"
              className="text-xs font-bold text-slate-400 hover:text-white transition-colors inline-flex items-center gap-1"
            >
              <span>{isRtl ? 'عرض سجل الطلبات والمبيعات بالكامل' : 'Open Full Orders Console'}</span>
              <ArrowRight className={`w-3.5 h-3.5 ${isRtl ? 'rotate-180' : ''}`} />
            </Link>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 5. REAL RECENT ORDERS TABLE (FROM POSTGRESQL DB)                          */}
      {/* ========================================================================= */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-4 sm:p-6 space-y-4 shadow-xl">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 pb-3 border-b border-slate-800">
          <div>
            <h2 className="font-black text-white text-sm sm:text-base flex items-center gap-2">
              <ShoppingBag className="w-4 h-4 text-indigo-400 shrink-0" />
              <span>{isRtl ? 'أحدث الطلبات من قاعدة البيانات' : 'Recent Database Orders'}</span>
            </h2>
            <span className="text-xs text-slate-400">
              {isRtl
                ? 'طلبات الشراء الفعلية المسجلة وتعديل حالتها فورياً'
                : 'Real orders stored in PostgreSQL database'}
            </span>
          </div>

          <Link
            href="/admin/orders"
            className="text-xs font-bold text-blue-400 hover:text-blue-300 transition-colors flex items-center gap-1 self-start sm:self-auto"
          >
            <span>{isRtl ? 'لوحة الطلبات الكاملة' : 'Complete Orders Console'}</span>
            <ArrowUpRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {/* Responsive Orders Table */}
        <div className="overflow-x-auto -mx-4 sm:mx-0">
          <div className="inline-block min-w-full align-middle px-4 sm:px-0">
            <table className="min-w-full text-left text-xs text-slate-300">
              <thead className="bg-slate-950/80 text-[11px] uppercase tracking-wider text-slate-400 font-bold border-b border-slate-800">
                <tr>
                  <th className="py-3 px-3 sm:px-4">{isRtl ? 'رقم الطلب' : 'Order ID'}</th>
                  <th className="py-3 px-3 sm:px-4">{isRtl ? 'العميل' : 'Customer'}</th>
                  <th className="py-3 px-3 sm:px-4">{isRtl ? 'العناصر' : 'Items'}</th>
                  <th className="py-3 px-3 sm:px-4">{isRtl ? 'المبلغ' : 'Amount'}</th>
                  <th className="py-3 px-3 sm:px-4">{isRtl ? 'الحالة' : 'Status'}</th>
                  <th className="py-3 px-3 sm:px-4 text-end">{isRtl ? 'تغيير الحالة' : 'Action'}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800 font-medium">
                {recentOrders.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-8 text-center text-slate-500">
                      {isRtl ? 'لا توجد طلبات مسجلة في قاعدة البيانات حتى الآن.' : 'No orders recorded in database yet.'}
                    </td>
                  </tr>
                ) : (
                  recentOrders.map((ord) => (
                    <tr key={ord.id} className="hover:bg-slate-800/40 transition-colors">
                      <td className="py-3 px-3 sm:px-4 font-mono font-bold text-white whitespace-nowrap">
                        #{ord.id}
                      </td>
                      <td className="py-3 px-3 sm:px-4 whitespace-nowrap">
                        <span className="font-bold text-slate-200 block truncate max-w-[140px] sm:max-w-xs">{ord.customerName}</span>
                        <span className="text-[10px] text-slate-500 font-mono block">{ord.customerPhone}</span>
                      </td>
                      <td className="py-3 px-3 sm:px-4 font-mono whitespace-nowrap">
                        {ord.items?.length || 1} {isRtl ? 'عنصر' : 'item(s)'}
                      </td>
                      <td className="py-3 px-3 sm:px-4 font-mono font-bold text-blue-400 whitespace-nowrap">
                        {formatPrice(ord.total)}
                      </td>
                      <td className="py-3 px-3 sm:px-4 whitespace-nowrap">
                        <span
                          className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border ${
                            ord.orderStatus === 'delivered'
                              ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30'
                              : ord.orderStatus === 'shipped'
                              ? 'bg-blue-500/20 text-blue-400 border-blue-500/30'
                              : ord.orderStatus === 'processing'
                              ? 'bg-amber-500/20 text-amber-400 border-amber-500/30'
                              : 'bg-red-500/20 text-red-400 border-red-500/30'
                          }`}
                        >
                          {ord.orderStatus === 'delivered'
                            ? (isRtl ? 'تم التسليم' : 'Delivered')
                            : ord.orderStatus === 'shipped'
                            ? (isRtl ? 'تم الشحن' : 'Shipped')
                            : ord.orderStatus === 'processing'
                            ? (isRtl ? 'قيد التجهيز' : 'Processing')
                            : (isRtl ? 'ملغي' : ord.orderStatus)}
                        </span>
                      </td>
                      <td className="py-3 px-3 sm:px-4 text-end whitespace-nowrap">
                        <select
                          value={ord.orderStatus}
                          onChange={(e) => handleUpdateOrderStatus(ord.id, e.target.value)}
                          className="bg-slate-950 border border-slate-700 text-[11px] font-bold text-slate-200 rounded-xl px-2.5 py-1 focus:outline-none focus:border-blue-500 cursor-pointer shadow-xs"
                        >
                          <option value="processing">{isRtl ? 'قيد التجهيز' : 'Processing'}</option>
                          <option value="shipped">{isRtl ? 'تم الشحن' : 'Shipped'}</option>
                          <option value="delivered">{isRtl ? 'تم التسليم' : 'Delivered'}</option>
                          <option value="cancelled">{isRtl ? 'إلغاء الطلب' : 'Cancelled'}</option>
                        </select>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
