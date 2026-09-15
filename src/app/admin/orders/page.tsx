'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Order } from '@/types';
import { useStore } from '@/context/StoreContext';
import {
  ShoppingBag,
  RefreshCw,
  Search,
  CheckCircle2,
  Clock,
  Truck,
  FileText,
  Printer,
  ChevronDown,
  Building2,
  Eye,
  X,
  MapPin,
  Phone,
  Mail,
  DollarSign,
  AlertCircle
} from 'lucide-react';

export default function AdminOrdersPage() {
  const { isRtl, formatPrice, orders, updateOrderStatus, updatePaymentStatus, showToast } = useStore();

  const [statusFilter, setStatusFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  const filteredOrders = orders.filter(o => {
    const matchesStatus = statusFilter === 'all' || o.orderStatus === statusFilter;
    const matchesSearch =
      o.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      o.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      o.customerEmail.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'delivered':
        return (
          <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center gap-1">
            <CheckCircle2 className="w-3 h-3" />
            <span>{isRtl ? 'تم التوصيل' : 'Delivered'}</span>
          </span>
        );
      case 'shipped':
        return (
          <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-blue-500/20 text-blue-400 border border-blue-500/30 flex items-center gap-1">
            <Truck className="w-3 h-3" />
            <span>{isRtl ? 'تم الشحن' : 'Shipped'}</span>
          </span>
        );
      case 'cancelled':
        return (
          <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-rose-500/20 text-rose-400 border border-rose-500/30 flex items-center gap-1">
            <AlertCircle className="w-3 h-3" />
            <span>{isRtl ? 'ملغي' : 'Cancelled'}</span>
          </span>
        );
      default:
        return (
          <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-amber-500/20 text-amber-400 border border-amber-500/30 flex items-center gap-1">
            <Clock className="w-3 h-3" />
            <span>{isRtl ? 'قيد التجهيز' : 'Processing'}</span>
          </span>
        );
    }
  };

  const getPaymentBadge = (method: string) => {
    const m = (method || '').toLowerCase();
    if (m === 'instapay') {
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-lg text-[11px] font-bold bg-purple-500/20 text-purple-300 border border-purple-500/30">
          <span className="w-1.5 h-1.5 rounded-full bg-purple-400"></span>
          <span>InstaPay</span>
        </span>
      );
    }
    if (m === 'vodafone_cash') {
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-lg text-[11px] font-bold bg-red-500/20 text-red-300 border border-red-500/30">
          <span className="w-1.5 h-1.5 rounded-full bg-red-500"></span>
          <span>Vodafone Cash</span>
        </span>
      );
    }
    if (m === 'cod' || m === 'cash_on_delivery') {
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-lg text-[11px] font-bold bg-slate-800 text-slate-300 border border-slate-700">
          <span>{isRtl ? 'الدفع عند الاستلام' : 'COD (Cash)'}</span>
        </span>
      );
    }
    return (
      <span className="text-slate-300 font-mono text-[11px] uppercase bg-slate-950 px-2 py-0.5 rounded border border-slate-800">
        {method.replace('_', ' ')}
      </span>
    );
  };

  const totalVolume = orders.reduce((sum, o) => sum + o.total, 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 pb-6 border-b border-slate-800">
        <div>
          <h1 className="text-2xl font-black text-white tracking-tight flex items-center gap-2">
            <ShoppingBag className="w-6 h-6 text-indigo-400" />
            <span>{isRtl ? 'إدارة ومتابعة طلبات الشراء' : 'Commercial Procurement & Orders Pipeline'}</span>
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            {isRtl
              ? 'تتبع مسار الطلبات، تحديث حالات الشحن، وإدارة الفواتير الإلكترونية وسجلات التوصيل.'
              : 'Track, fulfill, and validate dispatch waybills and electronic tax invoices.'}
          </p>
        </div>

        <div className="flex items-center gap-3 font-mono text-xs">
          <div className="bg-slate-900 border border-slate-800 px-4 py-2 rounded-xl text-slate-300">
            {isRtl ? 'إجمالي الطلبات:' : 'Total Orders:'} <strong className="text-white mx-1">{orders.length}</strong>
          </div>
          <div className="bg-slate-900 border border-slate-800 px-4 py-2 rounded-xl text-slate-300">
            {isRtl ? 'حجم المبيعات:' : 'Pipeline Volume:'} <strong className="text-blue-400 mx-1">{formatPrice(totalVolume)}</strong>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 flex flex-wrap items-center justify-between gap-4">
        <div className="relative flex-1 min-w-[260px] max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3 rtl:right-3.5 rtl:left-auto pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={isRtl ? 'بحث برقم الطلب، اسم العميل، البريد، أو الشركة...' : 'Search by Order #, Customer, Email, or Company...'}
            className="w-full pl-10 pr-4 rtl:pr-10 rtl:pl-4 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
          />
        </div>

        {/* Status Filters */}
        <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
          {[
            { id: 'all', en: 'All', ar: 'الكل' },
            { id: 'processing', en: 'Processing', ar: 'قيد التجهيز' },
            { id: 'shipped', en: 'Shipped', ar: 'تم الشحن' },
            { id: 'delivered', en: 'Delivered', ar: 'تم التوصيل' },
            { id: 'cancelled', en: 'Cancelled', ar: 'ملغي' },
          ].map(st => (
            <button
              key={st.id}
              onClick={() => setStatusFilter(st.id)}
              className={`px-2.5 sm:px-3 py-1.5 rounded-xl text-[11px] sm:text-xs font-bold transition-colors ${
                statusFilter === st.id
                  ? 'bg-blue-600 text-white shadow'
                  : 'bg-slate-950 text-slate-400 hover:text-white border border-slate-800'
              }`}
            >
              {isRtl ? st.ar : st.en}
            </button>
          ))}
        </div>
      </div>

      {/* Orders Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left rtl:text-right text-xs text-slate-300 min-w-[700px]">
            <thead className="bg-slate-950/80 text-[11px] uppercase tracking-wider text-slate-400 font-bold border-b border-slate-800">
              <tr>
                <th className="py-3.5 px-4">{isRtl ? 'رقم وتاريخ الطلب' : 'Order ID & Date'}</th>
                <th className="py-3.5 px-4">{isRtl ? 'العميل / المؤسسة' : 'Customer / Enterprise'}</th>
                <th className="py-3.5 px-4">{isRtl ? 'المنتجات' : 'Hardware Items'}</th>
                <th className="py-3.5 px-4">{isRtl ? 'إجمالي المبلغ' : 'Total Amount'}</th>
                <th className="py-3.5 px-4">{isRtl ? 'طريقة الدفع' : 'Payment Method'}</th>
                <th className="py-3.5 px-4">{isRtl ? 'حالة الطلب' : 'Status Workflow'}</th>
                <th className="py-3.5 px-4 text-end">{isRtl ? 'التفاصيل' : 'Details'}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800 font-medium">
              {filteredOrders.map(ord => (
                <tr key={ord.id} className="hover:bg-slate-800/40 transition-colors">
                  <td className="py-3.5 px-4 whitespace-nowrap">
                    <span className="font-mono font-bold text-white block">#{ord.id}</span>
                    <span className="text-[11px] text-slate-500">{ord.date}</span>
                  </td>

                  <td className="py-3.5 px-4">
                    <span className="font-bold text-slate-200 block">{ord.customerName}</span>
                    <span className="text-[11px] text-slate-400 block">{ord.customerEmail}</span>
                  </td>

                  <td className="py-3.5 px-4">
                    <span className="font-mono text-slate-200 font-bold block">
                      {ord.items.length} {isRtl ? 'منتج' : 'product(s)'}
                    </span>
                    <span className="text-[11px] text-slate-400 truncate max-w-[180px] block">
                      {ord.items[0]?.product?.name || (isRtl ? 'منتج تجهيز' : 'Hardware unit')}
                    </span>
                  </td>

                  <td className="py-3.5 px-4 font-mono whitespace-nowrap">
                    <span className="font-bold text-blue-400 text-sm">{formatPrice(ord.total)}</span>
                  </td>

                  <td className="py-3.5 px-4 whitespace-nowrap">
                    {getPaymentBadge(ord.paymentMethod)}
                  </td>

                  <td className="py-3.5 px-4 whitespace-nowrap">
                    <div className="flex items-center gap-2">
                      <select
                        value={ord.orderStatus}
                        onChange={(e) => updateOrderStatus(ord.id, e.target.value as any)}
                        className="bg-slate-950 border border-slate-700 text-[11px] font-bold text-slate-200 rounded-lg px-2.5 py-1 focus:outline-none focus:border-blue-500 cursor-pointer"
                      >
                        <option value="processing">{isRtl ? 'قيد التجهيز' : 'Processing'}</option>
                        <option value="shipped">{isRtl ? 'تم الشحن' : 'Shipped'}</option>
                        <option value="delivered">{isRtl ? 'تم التوصيل' : 'Delivered'}</option>
                        <option value="cancelled">{isRtl ? 'ملغي' : 'Cancelled'}</option>
                      </select>
                    </div>
                  </td>

                  <td className="py-3.5 px-4 text-end whitespace-nowrap">
                    <button
                      onClick={() => setSelectedOrder(ord)}
                      className="p-1.5 rounded-lg bg-blue-600/20 hover:bg-blue-600 text-blue-400 hover:text-white transition-colors"
                      title={isRtl ? 'معاينة تفاصيل الفاتورة' : 'View Full Invoicing Details'}
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* FULL ORDER DETAILS MODAL */}
      {selectedOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/70 backdrop-blur-xs animate-in fade-in">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto p-4 sm:p-6 space-y-4 sm:space-y-6 shadow-2xl">
            {/* Modal Header */}
            <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-slate-800">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-blue-600/20 text-blue-400">
                  <FileText className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-extrabold text-white text-sm sm:text-base font-mono">
                    {isRtl ? 'فاتورة الطلب رقم' : 'Order Invoice #'} {selectedOrder.id}
                  </h3>
                  <span className="text-xs text-slate-400">
                    {isRtl ? 'بتاريخ' : 'Placed on'} {selectedOrder.date}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-2">
                {getStatusBadge(selectedOrder.orderStatus)}
                <button
                  onClick={() => setSelectedOrder(null)}
                  className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 ml-2"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Customer & Shipping Summary */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 bg-slate-950/80 rounded-xl border border-slate-800 text-xs">
              <div className="space-y-1.5">
                <span className="text-slate-500 uppercase font-bold text-[10px] block">
                  {isRtl ? 'بيانات العميل' : 'Customer Details'}
                </span>
                <span className="text-white font-bold block text-[13px]">{selectedOrder.customerName}</span>
                <span className="text-slate-400 block">{selectedOrder.customerEmail}</span>
                <span className="text-slate-400 block font-mono">{selectedOrder.customerPhone}</span>
              </div>

              <div className="space-y-1.5">
                <span className="text-slate-500 uppercase font-bold text-[10px] block">
                  {isRtl ? 'عنوان وبيانات التوصيل' : 'Shipping Destination'}
                </span>
                <span className="text-white font-bold block">{selectedOrder.city}</span>
                <p className="text-slate-400 leading-relaxed">{selectedOrder.shippingAddress}</p>
                <div className="pt-1 flex items-center gap-2">
                  <span className="text-slate-400">{isRtl ? 'طريقة الدفع:' : 'Payment:'} </span>
                  {getPaymentBadge(selectedOrder.paymentMethod)}
                </div>
              </div>
            </div>

            {/* Order Items Table */}
            <div className="space-y-3">
              <h4 className="text-xs font-bold text-slate-300 uppercase">
                {isRtl ? 'المنتجات في الطلب' : 'Procured Hardware Items'}
              </h4>
              <div className="bg-slate-950/60 rounded-xl border border-slate-800 divide-y divide-slate-800 text-xs">
                {selectedOrder.items.map((item, idx) => (
                  <div key={idx} className="p-3 flex items-center justify-between gap-3">
                    <div className="min-w-0">
                      <span className="font-bold text-white block truncate">
                        {item.quantity}× {item.product?.name || (isRtl ? 'منتج تجهيز' : 'Hardware Unit')}
                      </span>
                      <div className="flex items-center gap-2 text-[11px] text-slate-400 mt-0.5">
                        {item.selectedRam && <span>{item.selectedRam}</span>}
                        {item.selectedStorage && <span>• {item.selectedStorage}</span>}
                      </div>
                    </div>
                    <span className="font-mono font-bold text-blue-400 shrink-0">
                      {formatPrice(item.totalPrice)}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Financial Summary */}
            <div className="p-4 bg-slate-950 rounded-xl border border-slate-800 space-y-2 text-xs font-mono">
              <div className="flex justify-between text-slate-400">
                <span>{isRtl ? 'المجموع الفرعي' : 'Subtotal'}</span>
                <span>{formatPrice(selectedOrder.subtotal)}</span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>{isRtl ? 'الشحن والتوصيل' : 'Courier Delivery'}</span>
                <span>{selectedOrder.shipping === 0 ? (isRtl ? 'مجاني' : 'FREE') : formatPrice(selectedOrder.shipping)}</span>
              </div>
              {selectedOrder.discount > 0 && (
                <div className="flex justify-between text-emerald-400">
                  <span>{isRtl ? 'خصم الكوبون' : 'Coupon Discount'}</span>
                  <span>-{formatPrice(selectedOrder.discount)}</span>
                </div>
              )}
              <div className="flex justify-between text-white font-bold text-sm pt-2 border-t border-slate-800">
                <span>{isRtl ? 'الإجمالي النهائي' : 'Grand Total'}</span>
                <span className="text-blue-400">{formatPrice(selectedOrder.total)}</span>
              </div>
            </div>

            {/* Modal Actions */}
            <div className="flex items-center justify-between pt-2">
              <Link
                href={`/order-success/${selectedOrder.id}`}
                target="_blank"
                className="flex items-center gap-1.5 text-xs font-bold text-blue-400 hover:text-blue-300 transition-colors"
              >
                <Printer className="w-4 h-4" />
                <span>{isRtl ? 'فتح فاتورة للطباعة' : 'Open Printable Customer Invoice'}</span>
              </Link>

              <button
                onClick={() => setSelectedOrder(null)}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold rounded-xl transition-colors"
              >
                {isRtl ? 'إغلاق' : 'Close Window'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
