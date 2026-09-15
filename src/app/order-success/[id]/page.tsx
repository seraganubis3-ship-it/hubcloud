'use client';

import React, { useMemo, useState } from 'react';
import Link from 'next/link';
import { useStore } from '@/context/StoreContext';
import {
  CheckCircle2,
  Package,
  Printer,
  ArrowRight,
  Truck,
  FileText,
  MapPin,
  Phone,
  MessageCircle,
  Clock,
  ShieldCheck
} from 'lucide-react';

export default function OrderSuccessPage({ params }: { params: { id: string } }) {
  const { id } = params;
  const { isRtl, formatPrice, orders } = useStore();

  const orderFromStore = useMemo(() => {
    return orders.find(o => o.id === id);
  }, [orders, id]);

  const [dbOrder, setDbOrder] = useState<any | null>(null);

  React.useEffect(() => {
    if (!orderFromStore && id) {
      fetch(`/api/orders/${id}`)
        .then(res => res.json())
        .then(data => {
          if (data.success && data.order) {
            setDbOrder({
              ...data.order,
              shippingAddress: data.order.address,
              items: (data.order.items || []).map((it: any) => ({
                product: { name: it.productName, nameAr: it.productNameAr || it.productName },
                quantity: it.quantity,
                unitPrice: it.unitPrice,
                totalPrice: it.totalPrice,
                selectedRam: it.selectedRam,
                selectedStorage: it.selectedStorage
              }))
            });
          }
        })
        .catch(() => {});
    }
  }, [id, orderFromStore]);

  const order = orderFromStore || dbOrder;

  const handlePrint = () => {
    window.print();
  };

  const whatsappMessage = encodeURIComponent(
    `مرحباً هاب كلاود، قمت بتأكيد الطلب رقم #${id} وأود متابعة حالة الشحن والتسليم.`
  );

  return (
    <div className="py-10 bg-slate-50 min-h-[85vh]">
      <div className="max-w-3xl mx-auto px-4 space-y-6">

        {/* Success Card */}
        <div className="bg-white rounded-3xl border border-gray-200 p-6 sm:p-10 shadow-sm text-center space-y-5">
          <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto shadow-xs">
            <CheckCircle2 className="w-10 h-10" />
          </div>

          <div>
            <h1 className="text-2xl sm:text-3xl font-black text-gray-900">
              {isRtl ? 'تم تأكيد طلبك بنجاح!' : 'Order Confirmed Successfully!'}
            </h1>
            <p className="text-[13px] text-gray-500 max-w-md mx-auto mt-2 leading-relaxed">
              {isRtl
                ? 'شكراً لاختيارك HUB CLOUD. تم تسجيل طلبك وإصدار إيصال الشراء المعتمد.'
                : 'Thank you for choosing HUB CLOUD. Your order has been placed and confirmed.'}
            </p>
          </div>

          <div className="inline-flex items-center gap-2 bg-blue-50 border border-blue-200 px-5 py-2.5 rounded-2xl text-[14px] font-mono font-bold text-blue-700">
            <span>{isRtl ? 'رقم إيصال الطلب:' : 'Order Receipt ID:'}</span>
            <span>#{id}</span>
          </div>

          {/* Shipment Progress */}
          <div className="pt-6 border-t border-gray-100">
            <h4 className="text-[12px] font-bold text-gray-400 uppercase tracking-wider mb-6 text-start">
              {isRtl ? 'مراحل تجهيز وتسليم الشحنة' : 'Shipment Progress'}
            </h4>

            <div className="grid grid-cols-4 gap-2 text-center text-[11px]">
              <div className="space-y-1.5">
                <div className="w-8 h-8 rounded-full bg-emerald-600 text-white flex items-center justify-center mx-auto font-bold text-[12px]">
                  ✓
                </div>
                <span className="font-bold text-gray-900 block">{isRtl ? 'تم التأكيد' : 'Confirmed'}</span>
                <span className="text-gray-400 text-[10px]">{isRtl ? 'الآن' : 'Now'}</span>
              </div>

              <div className="space-y-1.5">
                <div className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center mx-auto font-bold text-[12px] animate-pulse">
                  2
                </div>
                <span className="font-bold text-blue-600 block">{isRtl ? 'قيد التجهيز' : 'Processing'}</span>
                <span className="text-gray-400 text-[10px]">{isRtl ? 'بالمخزن' : 'Warehouse'}</span>
              </div>

              <div className="space-y-1.5">
                <div className="w-8 h-8 rounded-full bg-gray-200 text-gray-500 flex items-center justify-center mx-auto font-bold text-[12px]">
                  3
                </div>
                <span className="font-medium text-gray-500 block">{isRtl ? 'تم الشحن' : 'Dispatched'}</span>
                <span className="text-gray-400 text-[10px]">{isRtl ? 'شركة الشحن' : 'Courier'}</span>
              </div>

              <div className="space-y-1.5">
                <div className="w-8 h-8 rounded-full bg-gray-200 text-gray-500 flex items-center justify-center mx-auto font-bold text-[12px]">
                  4
                </div>
                <span className="font-medium text-gray-500 block">{isRtl ? 'تم التسليم' : 'Delivered'}</span>
                <span className="text-gray-400 text-[10px]">24-48h</span>
              </div>
            </div>
          </div>

          {/* Order Details Breakdown if found */}
          {order && (
            <div className="pt-6 border-t border-gray-100 text-start space-y-4">
              <h4 className="font-extrabold text-gray-900 text-[14px]">
                {isRtl ? 'تفاصيل إيصال الشراء:' : 'Order Receipt Summary:'}
              </h4>

              <div className="bg-slate-50 p-4 rounded-2xl border border-gray-200 space-y-3">
                <div className="divide-y divide-gray-200/70">
                  {order.items.map((it: any, idx: number) => (
                    <div key={idx} className="py-2.5 flex items-center justify-between text-[13px]">
                      <div className="space-y-0.5">
                        <span className="font-bold text-gray-900 block">
                          {it.quantity}× {it.product.name}
                        </span>
                        {it.selectedRam && (
                          <span className="text-[11px] text-gray-500 block">
                            {it.selectedRam} {it.selectedStorage ? `• ${it.selectedStorage}` : ''}
                          </span>
                        )}
                      </div>
                      <span className="font-bold text-gray-900 font-mono">
                        {formatPrice(it.totalPrice)}
                      </span>
                    </div>
                  ))}
                </div>

                <div className="pt-3 border-t border-gray-200 flex justify-between items-center text-[14px]">
                  <span className="font-black text-gray-900">{isRtl ? 'إجمالي الطلب:' : 'Total Amount:'}</span>
                  <span className="font-black text-blue-700 text-lg font-mono">{formatPrice(order.total)}</span>
                </div>
              </div>

              {/* Delivery info */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-[12px] text-gray-600 bg-white p-3.5 rounded-xl border border-gray-200">
                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-blue-600 shrink-0" />
                  <span>{order.city} - {order.shippingAddress}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Phone className="w-4 h-4 text-blue-600 shrink-0" />
                  <span className="font-mono">{order.customerPhone}</span>
                </div>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="pt-4 flex flex-wrap items-center justify-center gap-3">
            <a
              href={`https://wa.me/201060777895?text=${whatsappMessage}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[13px] px-5 py-2.5 rounded-xl transition-colors shadow-sm"
            >
              <MessageCircle className="w-4 h-4" />
              <span>{isRtl ? 'متابعة الشحنة عبر واتساب' : 'Track via WhatsApp'}</span>
            </a>

            <button
              onClick={handlePrint}
              className="inline-flex items-center gap-2 bg-gray-100 hover:bg-gray-200 text-gray-800 font-bold text-[13px] px-5 py-2.5 rounded-xl transition-colors"
            >
              <Printer className="w-4 h-4" />
              <span>{isRtl ? 'طباعة إيصال الشراء' : 'Print Order Receipt'}</span>
            </button>

            <Link
              href="/products"
              className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-bold text-[13px] px-6 py-2.5 rounded-xl transition-colors shadow-md"
            >
              <span>{isRtl ? 'متابعة التسوق' : 'Continue Shopping'}</span>
              <ArrowRight className="w-4 h-4 rtl:rotate-180" />
            </Link>
          </div>
        </div>

      </div>
    </div>
  );
}
