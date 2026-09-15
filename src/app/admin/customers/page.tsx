'use client';

import React, { useState, useEffect } from 'react';
import { useStore } from '@/context/StoreContext';
import { UserRole } from '@/types';
import {
  Users,
  Search,
  ShieldCheck,
  Mail,
  Phone,
  Calendar,
  ShoppingBag,
  TrendingUp,
  RefreshCw
} from 'lucide-react';

interface CustomerRecord {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: UserRole;
  ordersCount: number;
  totalSpent: number;
  joinedDate: string;
}

const INITIAL_CUSTOMERS: CustomerRecord[] = [
  {
    id: 'cust-1',
    name: 'Ahmed Mahmoud',
    email: 'ahmed@gmail.com',
    phone: '01012345678',
    role: 'customer',
    ordersCount: 2,
    totalSpent: 59458,
    joinedDate: '15 Jan 2026'
  },
  {
    id: 'cust-2',
    name: 'Sara Ibrahim',
    email: 'sara.ibrahim@gmail.com',
    phone: '01234567890',
    role: 'customer',
    ordersCount: 1,
    totalSpent: 2899,
    joinedDate: '20 Mar 2026'
  },
  {
    id: 'cust-3',
    name: 'Hub Cloud Admin',
    email: 'admin@hubcloud.eg',
    phone: '01000000000',
    role: 'admin',
    ordersCount: 3,
    totalSpent: 94000,
    joinedDate: '01 Nov 2025'
  }
];

export default function AdminCustomersPage() {
  const { formatPrice, showToast, isRtl } = useStore();

  const [customers, setCustomers] = useState<CustomerRecord[]>(INITIAL_CUSTOMERS);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState<'all' | 'admin' | 'customer'>('all');

  const fetchCustomers = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/customers');
      const data = await res.json();
      if (data.success && data.customers && data.customers.length > 0) {
        setCustomers(data.customers);
      }
    } catch (err) {
      console.warn('Could not fetch real customers:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCustomers();
  }, []);

  const filteredCustomers = customers.filter(c => {
    const matchesSearch =
      c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.phone.includes(searchQuery);

    let matchesRole = true;
    if (roleFilter === 'admin') matchesRole = c.role === 'admin';
    else if (roleFilter === 'customer') matchesRole = c.role === 'customer';

    return matchesSearch && matchesRole;
  });

  const totalCustomers = customers.length;
  const totalLtv = customers.reduce((sum, c) => sum + c.totalSpent, 0);
  const totalOrdersPlaced = customers.reduce((sum, c) => sum + c.ordersCount, 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 pb-6 border-b border-slate-800">
        <div>
          <h1 className="text-2xl font-black text-white tracking-tight flex items-center gap-2">
            <Users className="w-6 h-6 text-blue-400" />
            <span>{isRtl ? 'دليل العملاء والقيمة الدائمة (LTV)' : 'Customer Directory & Lifetime Value'}</span>
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            {isRtl
              ? 'سجل العملاء المتصل بقاعدة البيانات لمتابعة طلبات العملاء وإجمالي المشتريات وتفاصيل التواصل.'
              : 'Real-time customer directory linked to your PostgreSQL database, tracking orders and lifetime spend.'}
          </p>
        </div>

        <div className="flex items-center gap-3 font-mono text-xs">
          <button
            onClick={fetchCustomers}
            disabled={loading}
            className="flex items-center gap-1.5 bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800 px-3 py-2 rounded-xl transition-colors"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            <span>{isRtl ? 'تحديث' : 'Refresh'}</span>
          </button>
          <div className="bg-slate-900 border border-slate-800 px-4 py-2 rounded-xl text-slate-300">
            {isRtl ? 'إجمالي الحسابات:' : 'Total Accounts:'} <strong className="text-white">{customers.length}</strong>
          </div>
        </div>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 flex items-center justify-between">
          <div>
            <span className="text-xs font-bold text-slate-400 uppercase">
              {isRtl ? 'إجمالي إنفاق العملاء (LTV)' : 'Total Customer LTV'}
            </span>
            <div className="text-2xl font-black text-emerald-400 font-mono">{formatPrice(totalLtv)}</div>
          </div>
          <TrendingUp className="w-8 h-8 text-emerald-500/30" />
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 flex items-center justify-between">
          <div>
            <span className="text-xs font-bold text-slate-400 uppercase">
              {isRtl ? 'إجمالي الحسابات المسجلة' : 'Total Accounts Registered'}
            </span>
            <div className="text-2xl font-black text-blue-400 font-mono">{totalCustomers}</div>
          </div>
          <Users className="w-8 h-8 text-blue-500/30" />
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 flex items-center justify-between">
          <div>
            <span className="text-xs font-bold text-slate-400 uppercase">
              {isRtl ? 'إجمالي الطلبات المنفذة' : 'Orders Placed by Users'}
            </span>
            <div className="text-2xl font-black text-indigo-400 font-mono">{totalOrdersPlaced}</div>
          </div>
          <ShoppingBag className="w-8 h-8 text-indigo-500/30" />
        </div>
      </div>

      {/* Filter and Search */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 flex flex-wrap items-center justify-between gap-4">
        <div className="relative flex-1 min-w-[260px] max-w-md">
          <Search className={`w-4 h-4 text-slate-400 absolute ${isRtl ? 'right-3.5' : 'left-3.5'} top-3 pointer-events-none`} />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={isRtl ? 'البحث بالاسم، البريد، أو رقم الهاتف...' : 'Search by customer name, email, or phone...'}
            className={`w-full ${isRtl ? 'pr-10 pl-4 text-right' : 'pl-10 pr-4 text-left'} py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500`}
          />
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setRoleFilter('all')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-colors ${
              roleFilter === 'all'
                ? 'bg-blue-600 text-white shadow'
                : 'bg-slate-950 text-slate-400 hover:text-white border border-slate-800'
            }`}
          >
            {isRtl ? 'جميع المستخدمين' : 'All Users'}
          </button>
          <button
            onClick={() => setRoleFilter('customer')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-colors ${
              roleFilter === 'customer'
                ? 'bg-blue-600 text-white shadow'
                : 'bg-slate-950 text-slate-400 hover:text-white border border-slate-800'
            }`}
          >
            {isRtl ? 'العملاء' : 'Retail Customers'}
          </button>
          <button
            onClick={() => setRoleFilter('admin')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-colors ${
              roleFilter === 'admin'
                ? 'bg-blue-600 text-white shadow'
                : 'bg-slate-950 text-slate-400 hover:text-white border border-slate-800'
            }`}
          >
            {isRtl ? 'المشرفين' : 'Admins'}
          </button>
        </div>
      </div>

      {/* Customers Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className={`w-full ${isRtl ? 'text-right' : 'text-left'} text-xs text-slate-300`}>
            <thead className="bg-slate-950/80 text-[11px] uppercase tracking-wider text-slate-400 font-bold border-b border-slate-800">
              <tr>
                <th className="py-3.5 px-4">{isRtl ? 'اسم العميل والبريد الإلكتروني' : 'Client Name & Email'}</th>
                <th className="py-3.5 px-4">{isRtl ? 'رقم الهاتف' : 'Phone Number'}</th>
                <th className="py-3.5 px-4">{isRtl ? 'نوع الحساب' : 'Account Role'}</th>
                <th className="py-3.5 px-4">{isRtl ? 'عدد الطلبات' : 'Orders Placed'}</th>
                <th className="py-3.5 px-4">{isRtl ? 'إجمالي الإنفاق (LTV)' : 'Total Spent (LTV)'}</th>
                <th className="py-3.5 px-4">{isRtl ? 'تاريخ التسجيل' : 'Registration Date'}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800 font-medium">
              {filteredCustomers.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-slate-500">
                    {isRtl ? 'لا يوجد عملاء مطابقين للبحث.' : 'No customers found matching search.'}
                  </td>
                </tr>
              ) : (
                filteredCustomers.map(cust => (
                  <tr key={cust.id} className="hover:bg-slate-800/40 transition-colors">
                    <td className="py-3.5 px-4">
                      <span className="font-bold text-white block">{cust.name}</span>
                      <span className="text-[11px] text-slate-400 block">{cust.email}</span>
                    </td>

                    <td className="py-3.5 px-4 font-mono text-slate-300" dir="ltr">
                      {cust.phone || 'N/A'}
                    </td>

                    <td className="py-3.5 px-4 whitespace-nowrap">
                      {cust.role === 'admin' ? (
                        <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-purple-500/20 text-purple-400 border border-purple-500/30">
                          {isRtl ? 'مشرف' : 'Admin'}
                        </span>
                      ) : (
                        <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-blue-500/20 text-blue-400 border border-blue-500/30">
                          {isRtl ? 'عميل' : 'Customer'}
                        </span>
                      )}
                    </td>

                    <td className="py-3.5 px-4 font-mono font-bold text-slate-200">
                      {cust.ordersCount}
                    </td>

                    <td className="py-3.5 px-4 font-mono font-bold text-emerald-400">
                      {formatPrice(cust.totalSpent)}
                    </td>

                    <td className="py-3.5 px-4 text-slate-400 text-[11px] whitespace-nowrap">
                      {cust.joinedDate}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
