'use client';

import React, { useState, useMemo, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useStore } from '@/context/StoreContext';
import { SavedAddress, Order } from '@/types';
import {
  User,
  Package,
  Heart,
  FileText,
  Settings,
  LogOut,
  ChevronRight,
  ShieldCheck,
  Building2,
  MapPin,
  Lock,
  Plus,
  Trash2,
  CheckCircle2,
  Clock,
  Truck,
  ExternalLink,
  Shield,
  Eye,
  CreditCard
} from 'lucide-react';
import { EGYPT_GOVERNORATES } from '@/lib/egypt-locations';

export default function AccountPage() {
  const router = useRouter();
  const {
    language,
    isRtl,
    formatPrice,
    currentUser,
    logout,
    updateProfile,
    savedAddresses,
    addAddress,
    removeAddress,
    setDefaultAddress,
    orders,
    wishlistCount,
    showToast
  } = useStore();

  const [activeTab, setActiveTab] = useState<'orders' | 'profile' | 'addresses' | 'security'>('orders');

  // Profile Edit State
  const [profileName, setProfileName] = useState(currentUser?.name || '');
  const [profilePhone, setProfilePhone] = useState(currentUser?.phone || '');

  // Add Address Modal
  const [isAddAddressOpen, setIsAddAddressOpen] = useState(false);
  const [newAddrTitle, setNewAddrTitle] = useState('');
  const [newAddrFullName, setNewAddrFullName] = useState(currentUser?.name || '');
  const [newAddrPhone, setNewAddrPhone] = useState(currentUser?.phone || '');
  const [newAddrGov, setNewAddrGov] = useState('cairo');
  const [newAddrCity, setNewAddrCity] = useState('مدينة نصر');
  const [isNewAddrCustom, setIsNewAddrCustom] = useState(false);
  const [newAddrCustomCity, setNewAddrCustomCity] = useState('');
  const [newAddrDetails, setNewAddrDetails] = useState('');

  // Security Form
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordLoading, setPasswordLoading] = useState(false);

  // Filter orders related strictly to current user by verified email
  const userOrders = useMemo<Order[]>(() => {
    if (!currentUser?.email) return [];
    const currentEmail = currentUser.email.toLowerCase().trim();
    return orders.filter(o => (o.customerEmail || '').toLowerCase().trim() === currentEmail);
  }, [orders, currentUser]);

  // Sync user's real orders from database when viewing account
  useEffect(() => {
    if (currentUser?.email) {
      fetch('/api/orders')
        .then(res => res.json())
        .then(data => {
          if (data.success && Array.isArray(data.orders)) {
            // Merge newly fetched orders with context
            const userOrdersFromDb = data.orders.map((o: any) => ({
              ...o,
              date: o.createdAt
                ? new Date(o.createdAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })
                : o.date,
            }));
            // Update orders if there's any difference
            if (userOrdersFromDb.length > 0) {
              const currentEmail = currentUser.email.toLowerCase().trim();
              const validUserDbOrders = userOrdersFromDb.filter((o: any) => (o.customerEmail || '').toLowerCase().trim() === currentEmail);
              if (validUserDbOrders.length > 0) {
                // Keep store context in sync
                try {
                  const existing = JSON.parse(localStorage.getItem('hubcloud_orders') || '[]');
                  const map = new Map<string, any>();
                  validUserDbOrders.forEach((o: any) => map.set(o.id, o));
                  existing.forEach((o: any) => { if (!map.has(o.id)) map.set(o.id, o); });
                  localStorage.setItem('hubcloud_orders', JSON.stringify(Array.from(map.values())));
                } catch (e) {}
              }
            }
          }
        })
        .catch(() => {});
    }
  }, [currentUser]);

  if (!currentUser) {
    return (
      <div className="py-16 min-h-[60vh] flex items-center justify-center">
        <div className="text-center max-w-md mx-auto px-4 space-y-4">
          <div className="w-16 h-16 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center mx-auto shadow-sm">
            <User className="w-8 h-8" />
          </div>
          <h2 className="text-2xl font-extrabold text-gray-900">
            {isRtl ? 'يرجى تسجيل الدخول إلى حسابك' : 'Please Sign In to Your Account'}
          </h2>
          <p className="text-sm text-gray-500">
            {isRtl
              ? 'سجل الدخول لمتابعة طلباتك السابقة وإدارة عناوين الشحن بكل سهولة.'
              : 'Sign in to track your orders, invoices, and manage delivery addresses.'}
          </p>
          <Link
            href="/login"
            className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-bold px-6 py-3 rounded-xl transition-colors shadow-md"
          >
            <span>{isRtl ? 'تسجيل الدخول / إنشاء حساب' : 'Sign In / Register'}</span>
            <ChevronRight className="w-4 h-4 rtl:rotate-180" />
          </Link>
        </div>
      </div>
    );
  }

  const handleProfileUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await fetch('/api/auth/me', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: profileName, phone: profilePhone })
      });
    } catch (err) {
      console.warn('API profile update error:', err);
    }
    updateProfile({
      name: profileName,
      phone: profilePhone
    });
    showToast(isRtl ? 'تم تحديث بيانات الحساب بنجاح' : 'Profile updated successfully', 'success');
  };

  const handleCreateAddress = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAddrTitle || !newAddrDetails) {
      showToast(isRtl ? 'يرجى ملء جميع الحقول المطلوبة' : 'Please fill all required fields', 'error');
      return;
    }
    const currentGov = EGYPT_GOVERNORATES.find(g => g.id === newAddrGov) || EGYPT_GOVERNORATES[0];
    const finalCity = isNewAddrCustom ? newAddrCustomCity.trim() : newAddrCity;
    if (!finalCity) {
      showToast(isRtl ? 'يرجى تحديد أو كتابة المدينة أو المركز' : 'Please specify city or district', 'error');
      return;
    }
    const fullCity = `${currentGov.nameAr} - ${finalCity}`;
    addAddress({
      title: newAddrTitle,
      fullName: newAddrFullName,
      phone: newAddrPhone,
      city: fullCity,
      addressDetails: newAddrDetails,
      isDefault: savedAddresses.length === 0
    });
    setIsAddAddressOpen(false);
    setNewAddrTitle('');
    setNewAddrDetails('');
    setNewAddrCustomCity('');
    setIsNewAddrCustom(false);
    showToast(isRtl ? 'تم إضافة العنوان بنجاح' : 'Address added successfully', 'success');
  };

  const handlePasswordUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentPassword || !newPassword) {
      showToast(isRtl ? 'يرجى تعبئة حقول كلمة المرور' : 'Please fill password fields', 'error');
      return;
    }
    if (newPassword.length < 6) {
      showToast(isRtl ? 'كلمة المرور يجب أن لا تقل عن 6 أحرف' : 'Password must be at least 6 characters', 'error');
      return;
    }
    if (newPassword !== confirmPassword) {
      showToast(isRtl ? 'كلمتا المرور غير متطابقتين' : 'Passwords do not match', 'error');
      return;
    }
    setPasswordLoading(true);
    try {
      const res = await fetch('/api/auth/me', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ currentPassword, newPassword }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        showToast(isRtl ? 'تم تغيير كلمة المرور بنجاح' : 'Password updated successfully', 'success');
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
      } else {
        showToast(data.error || (isRtl ? 'فشل تغيير كلمة المرور' : 'Failed to update password'), 'error');
      }
    } catch {
      showToast(isRtl ? 'تعذر الاتصال بالخادم' : 'Server connection failed', 'error');
    } finally {
      setPasswordLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'delivered':
        return (
          <span className="inline-flex items-center gap-1 bg-emerald-50 text-emerald-700 border border-emerald-200 text-[11px] font-bold px-2.5 py-0.5 rounded-full">
            <CheckCircle2 className="w-3 h-3" />
            <span>{isRtl ? 'تم التسليم' : 'Delivered'}</span>
          </span>
        );
      case 'shipped':
        return (
          <span className="inline-flex items-center gap-1 bg-blue-50 text-blue-700 border border-blue-200 text-[11px] font-bold px-2.5 py-0.5 rounded-full">
            <Truck className="w-3 h-3" />
            <span>{isRtl ? 'جاري الشحن' : 'Shipped'}</span>
          </span>
        );
      case 'cancelled':
        return (
          <span className="inline-flex items-center gap-1 bg-rose-50 text-rose-700 border border-rose-200 text-[11px] font-bold px-2.5 py-0.5 rounded-full">
            <span>{isRtl ? 'ملغي' : 'Cancelled'}</span>
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 bg-amber-50 text-amber-700 border border-amber-200 text-[11px] font-bold px-2.5 py-0.5 rounded-full">
            <Clock className="w-3 h-3" />
            <span>{isRtl ? 'قيد التجهيز والتأكيد' : 'Processing'}</span>
          </span>
        );
    }
  };

  return (
    <div className="py-8 bg-slate-50 min-h-[85vh]">
      <div className="max-w-7xl mx-auto px-4 space-y-6">
        {/* Breadcrumbs */}
        <div className="flex items-center gap-2 text-[12px] text-gray-500">
          <Link href="/" className="hover:text-blue-600 transition-colors">{isRtl ? 'الرئيسية' : 'Home'}</Link>
          <ChevronRight className="w-3 h-3 rtl:rotate-180 text-gray-400" />
          <span className="font-semibold text-gray-900">{isRtl ? 'لوحة تحكم حسابي' : 'My Account Dashboard'}</span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-8 items-start">
          {/* User Profile Sidebar (4 Cols) */}
          <div className="lg:col-span-4 bg-white rounded-2xl border border-gray-200 p-5 sm:p-6 shadow-xs space-y-6">
            <div className="flex items-center gap-3.5">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-700 text-white font-black text-xl flex items-center justify-center shadow-md shrink-0">
                {currentUser.name.slice(0, 2).toUpperCase()}
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-1.5 flex-wrap">
                  <h3 className="font-extrabold text-gray-900 text-[16px] truncate">{currentUser.name}</h3>
                  {currentUser.role === 'admin' && (
                    <span className="bg-purple-100 text-purple-700 text-[10px] font-black px-2 py-0.5 rounded-full">
                      Admin
                    </span>
                  )}
                </div>
                <span className="text-[12px] text-gray-500 block truncate">{currentUser.email}</span>
                <span className="inline-block text-[11px] font-semibold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-md mt-1">
                  {currentUser.role === 'admin' ? (isRtl ? 'حساب مدير المتجر' : 'Store Administrator') : (isRtl ? 'حساب عميل معتمد' : 'Verified Customer')}
                </span>
              </div>
            </div>

            {/* Quick Admin Shortcut if admin */}
            {currentUser.role === 'admin' && (
              <Link
                href="/admin"
                className="flex items-center justify-between p-3 rounded-xl bg-purple-50 hover:bg-purple-100 border border-purple-200 text-purple-900 transition-colors text-[13px] font-bold"
              >
                <div className="flex items-center gap-2">
                  <Shield className="w-4 h-4 text-purple-700" />
                  <span>{isRtl ? 'فتح لوحة تحكم الإدارة (CMS)' : 'Open Admin Suite CMS'}</span>
                </div>
                <ChevronRight className="w-4 h-4 rtl:rotate-180 text-purple-600" />
              </Link>
            )}

            {/* Navigation Tabs */}
            <div className="border-t border-gray-100 pt-4 space-y-1.5 text-[13px] font-bold">
              <button
                onClick={() => setActiveTab('orders')}
                className={`w-full flex items-center justify-between p-2.5 rounded-xl transition-all ${
                  activeTab === 'orders'
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'text-gray-700 hover:bg-gray-50 hover:text-blue-600'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <Package className="w-4 h-4" />
                  <span>{isRtl ? 'سجل الطلبات والفواتير' : 'Order History & Invoices'}</span>
                </div>
                <span className={`text-[11px] font-mono px-2 py-0.5 rounded-full ${
                  activeTab === 'orders' ? 'bg-blue-700 text-white' : 'bg-gray-100 text-gray-600'
                }`}>
                  {userOrders.length}
                </span>
              </button>

              <button
                onClick={() => setActiveTab('profile')}
                className={`w-full flex items-center justify-between p-2.5 rounded-xl transition-all ${
                  activeTab === 'profile'
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'text-gray-700 hover:bg-gray-50 hover:text-blue-600'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <User className="w-4 h-4" />
                  <span>{isRtl ? 'بيانات الملف الشخصي' : 'Personal Profile Settings'}</span>
                </div>
              </button>

              <button
                onClick={() => setActiveTab('addresses')}
                className={`w-full flex items-center justify-between p-2.5 rounded-xl transition-all ${
                  activeTab === 'addresses'
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'text-gray-700 hover:bg-gray-50 hover:text-blue-600'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <MapPin className="w-4 h-4" />
                  <span>{isRtl ? 'عناوين التوصيل المحفوظة' : 'Saved Delivery Addresses'}</span>
                </div>
                <span className={`text-[11px] font-mono px-2 py-0.5 rounded-full ${
                  activeTab === 'addresses' ? 'bg-blue-700 text-white' : 'bg-gray-100 text-gray-600'
                }`}>
                  {savedAddresses.length}
                </span>
              </button>

              <button
                onClick={() => setActiveTab('security')}
                className={`w-full flex items-center justify-between p-2.5 rounded-xl transition-all ${
                  activeTab === 'security'
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'text-gray-700 hover:bg-gray-50 hover:text-blue-600'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <Lock className="w-4 h-4" />
                  <span>{isRtl ? 'الأمان وكلمة المرور' : 'Security & Password'}</span>
                </div>
              </button>

              <Link
                href="/wishlist"
                className="flex items-center justify-between p-2.5 rounded-xl text-gray-700 hover:bg-gray-50 hover:text-blue-600 transition-colors"
              >
                <div className="flex items-center gap-2.5">
                  <Heart className="w-4 h-4" />
                  <span>{isRtl ? 'قائمة المفضلة' : 'My Wishlist'}</span>
                </div>
                <span className="text-[11px] font-mono bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">
                  {wishlistCount}
                </span>
              </Link>
            </div>

            {/* Logout Button */}
            <div className="border-t border-gray-100 pt-4">
              <button
                onClick={() => {
                  logout();
                  router.push('/');
                }}
                className="w-full flex items-center justify-center gap-2 p-2.5 rounded-xl text-red-600 hover:bg-red-50 font-bold text-[13px] transition-colors border border-red-100"
              >
                <LogOut className="w-4 h-4" />
                <span>{isRtl ? 'تسجيل الخروج' : 'Sign Out'}</span>
              </button>
            </div>
          </div>

          {/* Main Tab Content (8 Cols) */}
          <div className="lg:col-span-8 bg-white rounded-2xl border border-gray-200 p-6 sm:p-7 shadow-xs">
            {/* TAB 1: ORDERS & INVOICES */}
            {activeTab === 'orders' && (
              <div className="space-y-5">
                <div className="flex items-center justify-between pb-4 border-b border-gray-100">
                  <div>
                    <h3 className="font-extrabold text-gray-900 text-lg">
                      {isRtl ? 'سجل الطلبات وإيصالات الشراء' : 'Order History & Receipts'}
                    </h3>
                    <p className="text-[12px] text-gray-500 mt-0.5">
                      {isRtl ? 'تتبع حالة شحناتك الحالية واستعراض إيصالات الشراء المعتمدة.' : 'Track live shipment progress and view official order receipts.'}
                    </p>
                  </div>
                  <span className="text-[12px] font-bold text-gray-500 font-mono">
                    {userOrders.length} {isRtl ? 'طلب' : 'Orders'}
                  </span>
                </div>

                {userOrders.length === 0 ? (
                  <div className="py-12 text-center space-y-3">
                    <Package className="w-12 h-12 text-gray-300 mx-auto" />
                    <h4 className="font-bold text-gray-800 text-[15px]">
                      {isRtl ? 'لم تقم بأي طلبات بعد' : 'No orders found yet'}
                    </h4>
                    <p className="text-[12px] text-gray-500 max-w-sm mx-auto">
                      {isRtl ? 'تصفح أقوى أجهزة اللابتوب والشبكات وأضفها إلى السلة للاستفادة من عروضنا.' : 'Explore professional enterprise gear and place your first order.'}
                    </p>
                    <Link
                      href="/products"
                      className="inline-block bg-blue-600 text-white font-bold text-[13px] px-5 py-2.5 rounded-xl hover:bg-blue-700 transition-colors shadow-sm"
                    >
                      {isRtl ? 'تصفح الكتالوج الآن' : 'Browse Catalog'}
                    </Link>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {userOrders.map(ord => (
                      <div
                        key={ord.id}
                        className="rounded-2xl border border-gray-200 hover:border-blue-300 p-4 sm:p-5 transition-all bg-white shadow-2xs space-y-3"
                      >
                        <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-gray-100">
                          <div className="flex items-center gap-3">
                            <span className="font-black text-gray-900 text-[14px] font-mono">
                              #{ord.id}
                            </span>
                            {getStatusBadge(ord.orderStatus)}
                          </div>
                          <span className="text-[12px] text-gray-400 font-medium">
                            {ord.date}
                          </span>
                        </div>

                        {/* Order Items Preview */}
                        <div className="space-y-2">
                          {ord.items.map((item, idx) => (
                            <div key={idx} className="flex items-center justify-between text-[13px] text-gray-700 gap-2">
                              <div className="flex items-center gap-2 min-w-0">
                                <span className="font-bold text-blue-600 shrink-0 font-mono">
                                  {item.quantity}×
                                </span>
                                <span className="truncate font-medium text-gray-800">
                                  {item.product?.name || 'Enterprise Hardware'}
                                </span>
                                {item.selectedRam && (
                                  <span className="text-[11px] text-gray-400 shrink-0">
                                    ({item.selectedRam})
                                  </span>
                                )}
                              </div>
                              <span className="font-mono font-bold text-gray-900 shrink-0">
                                {formatPrice(item.totalPrice)}
                              </span>
                            </div>
                          ))}
                        </div>

                        {/* Footer Total and Actions */}
                        <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-gray-100 bg-gray-50/50 -mx-4 sm:-mx-5 -mb-4 sm:-mb-5 p-4 rounded-b-2xl">
                          <div className="text-start">
                            <span className="text-[11px] text-gray-500 block">
                              {isRtl ? 'إجمالي الطلب النهائي:' : 'Total Amount:'}
                            </span>
                            <span className="text-[16px] font-black text-blue-700 font-mono">
                              {formatPrice(ord.total)}
                            </span>
                          </div>

                          <div className="flex items-center gap-2">
                            <Link
                              href={`/order-success/${ord.id}`}
                              className="inline-flex items-center gap-1.5 text-[12px] font-bold text-blue-700 hover:text-blue-900 bg-white border border-blue-200 hover:bg-blue-50 px-3 py-1.5 rounded-lg transition-colors shadow-2xs"
                            >
                              <FileText className="w-3.5 h-3.5" />
                              <span>{isRtl ? 'عرض إيصال وتفاصيل الطلب' : 'View Order Receipt'}</span>
                            </Link>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* TAB 2: PROFILE SETTINGS */}
            {activeTab === 'profile' && (
              <form onSubmit={handleProfileUpdate} className="space-y-5">
                <div className="pb-4 border-b border-gray-100">
                  <h3 className="font-extrabold text-gray-900 text-lg">
                    {isRtl ? 'بيانات الملف الشخصي' : 'Personal Profile Details'}
                  </h3>
                  <p className="text-[12px] text-gray-500 mt-0.5">
                    {isRtl ? 'تحديث بيانات الاتصال واسم المستخدم لتسهيل توصيل الشحنات.' : 'Update your personal contact details for delivery and orders.'}
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[12px] font-bold text-gray-700 mb-1.5">
                      {isRtl ? 'الاسم بالكامل' : 'Full Name'}
                    </label>
                    <input
                      type="text"
                      required
                      value={profileName}
                      onChange={(e) => setProfileName(e.target.value)}
                      className="w-full px-3.5 py-2.5 text-[13px] border border-gray-200 rounded-xl focus:outline-none focus:border-blue-600"
                    />
                  </div>

                  <div>
                    <label className="block text-[12px] font-bold text-gray-700 mb-1.5">
                      {isRtl ? 'البريد الإلكتروني (غير قابل للتعديل)' : 'Email Address'}
                    </label>
                    <input
                      type="email"
                      disabled
                      value={currentUser.email}
                      className="w-full px-3.5 py-2.5 text-[13px] border border-gray-200 rounded-xl bg-gray-50 text-gray-500 cursor-not-allowed"
                    />
                  </div>

                  <div>
                    <label className="block text-[12px] font-bold text-gray-700 mb-1.5">
                      {isRtl ? 'رقم الهاتف' : 'Phone Number'}
                    </label>
                    <input
                      type="tel"
                      required
                      value={profilePhone}
                      onChange={(e) => setProfilePhone(e.target.value)}
                      className="w-full px-3.5 py-2.5 text-[13px] border border-gray-200 rounded-xl focus:outline-none focus:border-blue-600 font-mono"
                    />
                  </div>

                  <div>
                    <label className="block text-[12px] font-bold text-gray-700 mb-1.5">
                      {isRtl ? 'حالة الحساب' : 'Account Status'}
                    </label>
                    <div className="px-3.5 py-2.5 text-[13px] font-bold bg-emerald-50 text-emerald-800 rounded-xl border border-emerald-100 flex items-center justify-between">
                      <span>{currentUser.role === 'admin' ? (isRtl ? 'مدير نظام (Admin)' : 'Store Administrator') : (isRtl ? 'حساب عميل نشط' : 'Active Customer')}</span>
                      <ShieldCheck className="w-4 h-4 text-emerald-600" />
                    </div>
                  </div>
                </div>

                <div className="flex justify-end pt-2">
                  <button
                    type="submit"
                    className="bg-blue-600 hover:bg-blue-700 text-white font-bold text-[13px] px-6 py-2.5 rounded-xl transition-all shadow-sm"
                  >
                    {isRtl ? 'حفظ التعديلات' : 'Save Changes'}
                  </button>
                </div>
              </form>
            )}

            {/* TAB 3: SAVED ADDRESSES */}
            {activeTab === 'addresses' && (
              <div className="space-y-5">
                <div className="flex items-center justify-between pb-4 border-b border-gray-100">
                  <div>
                    <h3 className="font-extrabold text-gray-900 text-lg">
                      {isRtl ? 'عناوين الشحن والتوصيل' : 'Delivery Addresses'}
                    </h3>
                    <p className="text-[12px] text-gray-500 mt-0.5">
                      {isRtl ? 'العناوين المحفوظة للشحن السريع عند إتمام الطلب.' : 'Manage shipping destinations across Egyptian governorates.'}
                    </p>
                  </div>
                  <button
                    onClick={() => setIsAddAddressOpen(true)}
                    className="flex items-center gap-1.5 bg-blue-600 hover:bg-blue-700 text-white text-[12px] font-bold px-3.5 py-2 rounded-xl transition-colors shadow-2xs"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>{isRtl ? 'إضافة عنوان جديد' : 'Add New Address'}</span>
                  </button>
                </div>

                {/* Add Address Form Modal / Inline */}
                {isAddAddressOpen && (
                  <form onSubmit={handleCreateAddress} className="p-4 bg-slate-50 border border-blue-200 rounded-2xl space-y-3">
                    <h4 className="text-[13px] font-bold text-gray-900">
                      {isRtl ? 'إضافة عنوان توصيل جديد' : 'Add New Delivery Address'}
                    </h4>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-[11px] font-bold text-gray-700 mb-1">
                          {isRtl ? 'تسمية العنوان (مثال: مقر الشركة، الفرع، المنزل)' : 'Address Label (e.g. Office, Home)'}
                        </label>
                        <input
                          type="text"
                          required
                          value={newAddrTitle}
                          onChange={(e) => setNewAddrTitle(e.target.value)}
                          placeholder={isRtl ? 'مقر الشركة الرئيسي' : 'HQ Office'}
                          className="w-full px-3 py-2 text-[12px] border border-gray-300 rounded-lg focus:outline-none focus:border-blue-600 bg-white"
                        />
                      </div>

                      {/* Governorate */}
                      <div>
                        <label className="block text-[11px] font-bold text-gray-700 mb-1">
                          {isRtl ? 'المحافظة' : 'Governorate'} *
                        </label>
                        <select
                          value={newAddrGov}
                          onChange={(e) => {
                            const govId = e.target.value;
                            setNewAddrGov(govId);
                            const gov = EGYPT_GOVERNORATES.find(g => g.id === govId);
                            if (gov && gov.cities.length > 0) {
                              setNewAddrCity(gov.cities[0].nameAr);
                              setIsNewAddrCustom(false);
                              setNewAddrCustomCity('');
                            } else {
                              setIsNewAddrCustom(true);
                              setNewAddrCustomCity('');
                            }
                          }}
                          className="w-full px-3 py-2 text-[12px] border border-gray-300 rounded-lg focus:outline-none focus:border-blue-600 bg-white font-medium"
                        >
                          {EGYPT_GOVERNORATES.map(gov => (
                            <option key={gov.id} value={gov.id}>
                              {isRtl ? `${gov.nameAr} (${gov.nameEn})` : `${gov.nameEn} (${gov.nameAr})`}
                            </option>
                          ))}
                        </select>
                      </div>

                      {/* City / District */}
                      <div>
                        <label className="block text-[11px] font-bold text-gray-700 mb-1">
                          {isRtl ? 'المدينة / المركز / الحي' : 'City / Center / District'} *
                        </label>
                        {!isNewAddrCustom ? (
                          <select
                            value={newAddrCity}
                            onChange={(e) => {
                              if (e.target.value === '__custom__') {
                                setIsNewAddrCustom(true);
                                setNewAddrCustomCity('');
                              } else {
                                setNewAddrCity(e.target.value);
                              }
                            }}
                            className="w-full px-3 py-2 text-[12px] border border-gray-300 rounded-lg focus:outline-none focus:border-blue-600 bg-white font-medium"
                          >
                            {(EGYPT_GOVERNORATES.find(g => g.id === newAddrGov) || EGYPT_GOVERNORATES[0]).cities.map(c => (
                              <option key={c.nameAr} value={c.nameAr}>
                                {isRtl ? c.nameAr : c.nameEn}
                              </option>
                            ))}
                            <option value="__custom__">
                              {isRtl ? '➕ منطقة أو مركز آخر (كتابة يدوية)...' : '➕ Other area (Enter manually)...'}
                            </option>
                          </select>
                        ) : (
                          <div className="space-y-1">
                            <input
                              type="text"
                              required
                              value={newAddrCustomCity}
                              onChange={(e) => setNewAddrCustomCity(e.target.value)}
                              placeholder={isRtl ? 'اكتب اسم المدينة أو المركز أو الحي' : 'Enter city or district'}
                              className="w-full px-3 py-2 text-[12px] border border-gray-300 rounded-lg focus:outline-none focus:border-blue-600 bg-white"
                            />
                            <button
                              type="button"
                              onClick={() => {
                                setIsNewAddrCustom(false);
                                const gov = EGYPT_GOVERNORATES.find(g => g.id === newAddrGov);
                                if (gov && gov.cities.length > 0) {
                                  setNewAddrCity(gov.cities[0].nameAr);
                                }
                              }}
                              className="text-[10px] font-bold text-blue-600 hover:underline block"
                            >
                              {isRtl ? '↩ العودة للقائمة' : '↩ Back to list'}
                            </button>
                          </div>
                        )}
                      </div>

                      <div className="sm:col-span-2">
                        <label className="block text-[11px] font-bold text-gray-700 mb-1">
                          {isRtl ? 'تفاصيل العنوان والشارع ورقم المبنى' : 'Street & Building Details'}
                        </label>
                        <input
                          type="text"
                          required
                          value={newAddrDetails}
                          onChange={(e) => setNewAddrDetails(e.target.value)}
                          placeholder={isRtl ? 'رقم المبنى، اسم الشارع، الحي، الدور' : 'Building number, street name, district'}
                          className="w-full px-3 py-2 text-[12px] border border-gray-300 rounded-lg focus:outline-none focus:border-blue-600 bg-white"
                        />
                      </div>
                    </div>

                    <div className="flex items-center justify-end gap-2 pt-2">
                      <button
                        type="button"
                        onClick={() => setIsAddAddressOpen(false)}
                        className="px-3.5 py-1.5 text-[12px] font-bold text-gray-600 hover:text-gray-900"
                      >
                        {isRtl ? 'إلغاء' : 'Cancel'}
                      </button>
                      <button
                        type="submit"
                        className="px-4 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-[12px] font-bold rounded-lg transition-colors"
                      >
                        {isRtl ? 'حفظ العنوان' : 'Save Address'}
                      </button>
                    </div>
                  </form>
                )}

                {/* Address Cards List */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {savedAddresses.map(addr => (
                    <div
                      key={addr.id}
                      className={`p-4 rounded-xl border transition-all relative space-y-2 ${
                        addr.isDefault
                          ? 'border-blue-600 bg-blue-50/30'
                          : 'border-gray-200 bg-white hover:border-gray-300'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <MapPin className="w-4 h-4 text-blue-600" />
                          <h4 className="font-extrabold text-[13px] text-gray-900">{addr.title}</h4>
                        </div>
                        {addr.isDefault ? (
                          <span className="text-[10px] font-bold bg-blue-600 text-white px-2 py-0.5 rounded-full">
                            {isRtl ? 'العنوان الافتراضي' : 'Default'}
                          </span>
                        ) : (
                          <button
                            onClick={() => setDefaultAddress(addr.id)}
                            className="text-[11px] font-semibold text-blue-600 hover:underline"
                          >
                            {isRtl ? 'تعيين كافتراضي' : 'Set as default'}
                          </button>
                        )}
                      </div>

                      <p className="text-[12px] text-gray-600 leading-relaxed">
                        {addr.addressDetails}
                      </p>
                      <span className="text-[11px] text-gray-400 block font-medium">
                        {addr.city} • {addr.phone}
                      </span>

                      {savedAddresses.length > 1 && (
                        <div className="pt-2 flex justify-end">
                          <button
                            onClick={() => removeAddress(addr.id)}
                            className="text-red-500 hover:text-red-700 text-[11px] font-bold flex items-center gap-1"
                          >
                            <Trash2 className="w-3 h-3" />
                            <span>{isRtl ? 'حذف' : 'Remove'}</span>
                          </button>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* TAB 4: SECURITY */}
            {activeTab === 'security' && (
              <form onSubmit={handlePasswordUpdate} className="space-y-5">
                <div className="pb-4 border-b border-gray-100">
                  <h3 className="font-extrabold text-gray-900 text-lg">
                    {isRtl ? 'الأمان وتغيير كلمة المرور' : 'Security & Password Settings'}
                  </h3>
                  <p className="text-[12px] text-gray-500 mt-0.5">
                    {isRtl ? 'تحديث كلمة المرور لحماية حسابك ومعاملاتك التجارية.' : 'Manage your authentication and password security.'}
                  </p>
                </div>

                <div className="space-y-3.5 max-w-md">
                  <div>
                    <label className="block text-[12px] font-bold text-gray-700 mb-1">
                      {isRtl ? 'كلمة المرور الحالية' : 'Current Password'}
                    </label>
                    <input
                      type="password"
                      required
                      value={currentPassword}
                      onChange={(e) => setCurrentPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full px-3.5 py-2.5 text-[13px] border border-gray-200 rounded-xl focus:outline-none focus:border-blue-600"
                    />
                  </div>

                  <div>
                    <label className="block text-[12px] font-bold text-gray-700 mb-1">
                      {isRtl ? 'كلمة المرور الجديدة' : 'New Password'}
                    </label>
                    <input
                      type="password"
                      required
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full px-3.5 py-2.5 text-[13px] border border-gray-200 rounded-xl focus:outline-none focus:border-blue-600"
                    />
                  </div>

                  <div>
                    <label className="block text-[12px] font-bold text-gray-700 mb-1">
                      {isRtl ? 'تأكيد كلمة المرور الجديدة' : 'Confirm New Password'}
                    </label>
                    <input
                      type="password"
                      required
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full px-3.5 py-2.5 text-[13px] border border-gray-200 rounded-xl focus:outline-none focus:border-blue-600"
                    />
                  </div>
                </div>

                  <button
                    type="submit"
                    disabled={passwordLoading}
                    className="bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-bold text-[13px] px-6 py-2.5 rounded-xl transition-all shadow-sm flex items-center gap-2"
                  >
                    {passwordLoading ? (
                      <span>{isRtl ? 'جاري التحديث...' : 'Updating...'}</span>
                    ) : (
                      <span>{isRtl ? 'تحديث كلمة المرور' : 'Update Password'}</span>
                    )}
                  </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
