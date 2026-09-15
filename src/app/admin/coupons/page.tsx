'use client';

import React, { useState, useEffect } from 'react';
import { Tag, Plus, Trash2, CheckCircle2, Percent, DollarSign, X, Loader2, RefreshCw, AlertCircle } from 'lucide-react';
import { useStore } from '@/context/StoreContext';

interface DbCoupon {
  id: string;
  code: string;
  discountAmount: number;
  minSpend: number;
  isActive: boolean;
}

export default function AdminCouponsPage() {
  const { isRtl, formatPrice } = useStore();
  const [coupons, setCoupons] = useState<DbCoupon[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Form states
  const [newCode, setNewCode] = useState('');
  const [newDiscount, setNewDiscount] = useState<number | ''>(1000);
  const [newMinSpend, setNewMinSpend] = useState<number | ''>(5000);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Fetch coupons from PostgreSQL database
  const fetchCoupons = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/coupons', { cache: 'no-store' });
      const data = await res.json();
      if (data.success && Array.isArray(data.coupons)) {
        setCoupons(data.coupons);
      } else {
        setError(data.error || 'Failed to load coupons');
      }
    } catch (err: any) {
      console.error('Error loading coupons:', err);
      setError('Connection error loading coupons from database');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCoupons();
  }, []);

  const handleAddCoupon = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCode.trim() || !newDiscount || Number(newDiscount) <= 0) return;

    setIsSubmitting(true);
    try {
      const res = await fetch('/api/coupons', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          code: newCode.trim().toUpperCase(),
          discountAmount: Number(newDiscount),
          minSpend: Number(newMinSpend || 0),
          isActive: true,
        }),
      });
      const data = await res.json();
      if (data.success && data.coupon) {
        setCoupons(prev => [data.coupon, ...prev]);
        setNewCode('');
        setNewDiscount(1000);
        setNewMinSpend(5000);
        setIsModalOpen(false);
      } else {
        alert(data.error || 'Failed to create coupon');
      }
    } catch (err: any) {
      console.error('Error creating coupon:', err);
      alert('Error creating coupon: ' + err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteCoupon = async (id: string, code: string) => {
    if (!confirm(`Are you sure you want to delete coupon code "${code}" from the database?`)) {
      return;
    }

    setActionLoadingId(id);
    try {
      const res = await fetch(`/api/coupons/${id}`, {
        method: 'DELETE',
      });
      const data = await res.json();
      if (data.success) {
        setCoupons(prev => prev.filter(c => c.id !== id));
      } else {
        alert(data.error || 'Failed to delete coupon');
      }
    } catch (err: any) {
      console.error('Error deleting coupon:', err);
      alert('Failed to delete coupon: ' + err.message);
    } finally {
      setActionLoadingId(null);
    }
  };

  const toggleStatus = async (coupon: DbCoupon) => {
    const nextStatus = !coupon.isActive;
    setActionLoadingId(coupon.id);

    // Optimistic UI update
    setCoupons(prev =>
      prev.map(c => (c.id === coupon.id ? { ...c, isActive: nextStatus } : c))
    );

    try {
      const res = await fetch(`/api/coupons/${coupon.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isActive: nextStatus }),
      });
      const data = await res.json();
      if (!data.success) {
        // Revert on failure
        setCoupons(prev =>
          prev.map(c => (c.id === coupon.id ? { ...c, isActive: coupon.isActive } : c))
        );
        alert(data.error || 'Failed to update coupon status');
      }
    } catch (err: any) {
      console.error('Error toggling coupon status:', err);
      // Revert on failure
      setCoupons(prev =>
        prev.map(c => (c.id === coupon.id ? { ...c, isActive: coupon.isActive } : c))
      );
      alert('Failed to update status');
    } finally {
      setActionLoadingId(null);
    }
  };

  const activeCount = coupons.filter(c => c.isActive).length;

  return (
    <div className="space-y-6">
      {/* Header Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-white tracking-tight flex items-center gap-2.5">
            <Tag className="w-6 h-6 text-hub-blue" />
            <span>{isRtl ? 'كوبونات الخصم والعروض الترويجية' : 'Discount Coupons & Marketing'}</span>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-hub-blue/20 text-hub-blue font-bold border border-hub-blue/30">
              PostgreSQL
            </span>
          </h1>
          <p className="text-[13px] text-slate-400 mt-1">
            {isRtl
              ? 'إنشاء وإدارة أكواد وكوبونات الخصم وتحديد الحد الأدنى للطلب وحالة التفعيل.'
              : 'Create and manage promotional discount codes stored directly in the database.'}
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={fetchCoupons}
            disabled={isLoading}
            title={isRtl ? 'تحديث من قاعدة البيانات' : 'Refresh from database'}
            className="p-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl border border-slate-700 transition-colors disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin text-hub-blue' : ''}`} />
          </button>
          <button
            onClick={() => setIsModalOpen(true)}
            className="inline-flex items-center gap-2 bg-hub-blue hover:bg-hub-blue-dark text-white font-bold text-[13px] px-5 py-2.5 rounded-xl transition-all shadow-md active:scale-95"
          >
            <Plus className="w-4 h-4" />
            <span>{isRtl ? '+ إنشاء كوبون جديد' : 'Create Coupon'}</span>
          </button>
        </div>
      </div>

      {/* Metrics Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-hub-blue">
            <Tag className="w-5 h-5" />
          </div>
          <div>
            <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
              {isRtl ? 'إجمالي الكوبونات' : 'Total Coupons'}
            </div>
            <div className="text-xl font-black text-white">{coupons.length}</div>
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
            <CheckCircle2 className="w-5 h-5" />
          </div>
          <div>
            <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
              {isRtl ? 'الأكواد المفعلة' : 'Active Codes'}
            </div>
            <div className="text-xl font-black text-emerald-400">{activeCount}</div>
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
            <Percent className="w-5 h-5" />
          </div>
          <div>
            <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
              {isRtl ? 'الأكواد المعطلة' : 'Disabled Codes'}
            </div>
            <div className="text-xl font-black text-slate-400">{coupons.length - activeCount}</div>
          </div>
        </div>
      </div>

      {/* Error Alert */}
      {error && (
        <div className="p-4 bg-rose-500/10 border border-rose-500/30 rounded-xl flex items-center gap-3 text-rose-400 text-sm">
          <AlertCircle className="w-5 h-5 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Coupons Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
        {isLoading ? (
          <div className="py-20 text-center flex flex-col items-center justify-center space-y-3">
            <Loader2 className="w-8 h-8 text-hub-blue animate-spin" />
            <p className="text-sm text-slate-400">
              {isRtl ? 'جاري تحميل الكوبونات من قاعدة البيانات...' : 'Loading coupons from PostgreSQL database...'}
            </p>
          </div>
        ) : coupons.length === 0 ? (
          <div className="py-16 text-center space-y-3">
            <Tag className="w-10 h-10 text-slate-600 mx-auto" />
            <p className="text-white font-bold">
              {isRtl ? 'لا توجد كوبونات مسجلة في قاعدة البيانات' : 'No coupons found in database'}
            </p>
            <p className="text-xs text-slate-400 max-w-sm mx-auto">
              {isRtl
                ? 'أنشئ أول كوبون ترويجي ليتمكن العملاء من استخدامه والحصول على خصم عند إتمام الطلب.'
                : 'Create your first promotional discount coupon to allow customers to apply discounts at checkout.'}
            </p>
            <button
              onClick={() => setIsModalOpen(true)}
              className="inline-flex items-center gap-1.5 px-4 py-2 bg-hub-blue text-white rounded-xl text-xs font-bold hover:bg-hub-blue-dark transition-colors"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>{isRtl ? 'إنشاء كوبون' : 'Create Coupon'}</span>
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className={`w-full ${isRtl ? 'text-right' : 'text-left'} text-[13px] text-slate-300`}>
              <thead className="bg-slate-950/80 text-[11px] uppercase font-bold text-slate-400 border-b border-slate-800">
                <tr>
                  <th className="py-4 px-5">{isRtl ? 'كود الكوبون' : 'Promo Code'}</th>
                  <th className="py-4 px-5">{isRtl ? 'قيمة الخصم' : 'Discount Value'}</th>
                  <th className="py-4 px-5">{isRtl ? 'الحد الأدنى للطلب' : 'Min Spend'}</th>
                  <th className="py-4 px-5 text-center">{isRtl ? 'الحالة' : 'Status'}</th>
                  <th className={`py-4 px-5 ${isRtl ? 'text-left' : 'text-right'}`}>{isRtl ? 'الإجراءات' : 'Actions'}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/80">
                {coupons.map((c) => {
                  const isActionLoading = actionLoadingId === c.id;
                  return (
                    <tr key={c.id} className="hover:bg-slate-800/40 transition-colors">
                      <td className="py-3.5 px-5">
                        <span className="font-mono font-bold text-white tracking-wider px-2.5 py-1 bg-slate-950 rounded-lg border border-slate-800">
                          {c.code}
                        </span>
                      </td>
                      <td className="py-3.5 px-5 font-mono font-bold text-emerald-400">
                        - {formatPrice(c.discountAmount)}
                      </td>
                      <td className="py-3.5 px-5 font-mono text-slate-400">
                        {c.minSpend && c.minSpend > 0 ? (
                          formatPrice(c.minSpend)
                        ) : (
                          <span className="text-slate-600">{isRtl ? 'بدون حد أدنى' : 'No minimum'}</span>
                        )}
                      </td>
                      <td className="py-3.5 px-5 text-center">
                        <button
                          onClick={() => toggleStatus(c)}
                          disabled={isActionLoading}
                          className={`px-3 py-1 rounded-full text-[11px] font-bold border transition-colors cursor-pointer ${
                            c.isActive
                              ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30 hover:bg-emerald-500/30'
                              : 'bg-slate-800 text-slate-500 border-slate-700 hover:bg-slate-700/50'
                          } disabled:opacity-50`}
                        >
                          {c.isActive ? (isRtl ? 'مفعّل' : 'Active') : (isRtl ? 'معطّل' : 'Disabled')}
                        </button>
                      </td>
                      <td className={`py-3.5 px-5 ${isRtl ? 'text-left' : 'text-right'}`}>
                        <button
                          onClick={() => handleDeleteCoupon(c.id, c.code)}
                          disabled={isActionLoading}
                          title={isRtl ? 'حذف الكوبون' : 'Delete coupon'}
                          className="p-2 text-rose-400 hover:text-rose-300 hover:bg-rose-500/20 rounded-lg transition-colors disabled:opacity-50"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal: Create Coupon */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-md w-full p-6 space-y-4 shadow-2xl animate-in fade-in zoom-in duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="text-lg font-black text-white flex items-center gap-2">
                <Tag className="w-5 h-5 text-hub-blue" />
                <span>{isRtl ? 'إنشاء كوبون خصم جديد' : 'Create New Coupon'}</span>
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddCoupon} className="space-y-4 text-[13px]">
              <div>
                <label className="block text-slate-300 mb-1 font-bold">
                  {isRtl ? 'رمز الكوبون *' : 'Coupon Code *'}
                </label>
                <input
                  type="text"
                  required
                  value={newCode}
                  onChange={(e) => setNewCode(e.target.value.toUpperCase())}
                  placeholder={isRtl ? 'مثال: HUB2026 أو MEGA50' : 'e.g. HUB2026 or MEGA50'}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-white font-mono uppercase focus:outline-none focus:border-hub-blue"
                />
              </div>

              <div>
                <label className="block text-slate-300 mb-1 font-bold">
                  {isRtl ? 'قيمة الخصم بالجنيه (EGP) *' : 'Discount Amount (EGP) *'}
                </label>
                <input
                  type="number"
                  required
                  min="1"
                  step="1"
                  value={newDiscount}
                  onChange={(e) => setNewDiscount(e.target.value === '' ? '' : Number(e.target.value))}
                  placeholder="1500"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-white font-mono focus:outline-none focus:border-hub-blue"
                />
              </div>

              <div>
                <label className="block text-slate-300 mb-1 font-bold">
                  {isRtl ? 'الحد الأدنى لقيمة الطلب (EGP)' : 'Minimum Order Spend (EGP)'}
                </label>
                <input
                  type="number"
                  min="0"
                  step="1"
                  value={newMinSpend}
                  onChange={(e) => setNewMinSpend(e.target.value === '' ? '' : Number(e.target.value))}
                  placeholder="0 (بدون حد أدنى)"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-white font-mono focus:outline-none focus:border-hub-blue"
                />
                <p className="text-[11px] text-slate-500 mt-1">
                  {isRtl
                    ? 'اتركه 0 إذا كان يمكن استخدام الكوبون مع أي قيمة للطلب.'
                    : 'Set to 0 if the coupon can be used with any order total.'}
                </p>
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 bg-slate-800 text-slate-300 rounded-xl font-bold hover:bg-slate-700 transition-colors"
                >
                  {isRtl ? 'إلغاء' : 'Cancel'}
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting || !newCode.trim()}
                  className="inline-flex items-center gap-2 px-6 py-2 bg-hub-blue hover:bg-hub-blue-dark text-white rounded-xl font-bold transition-all shadow disabled:opacity-50"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>{isRtl ? 'جاري الحفظ...' : 'Saving to DB...'}</span>
                    </>
                  ) : (
                    <span>{isRtl ? 'حفظ وتفعيل الكوبون' : 'Create Code'}</span>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
