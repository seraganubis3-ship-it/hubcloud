'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useStore } from '@/context/StoreContext';
import { Shuffle, ChevronRight, Trash2, ShoppingCart, Check } from 'lucide-react';

export default function ComparePage() {
  const { language, isRtl, formatPrice, compareList, toggleCompare, addToCart, products } = useStore();
  const comparedProducts = products.filter(p => compareList.includes(p.id));

  return (
    <div className="py-6">
      <div className="max-w-7xl mx-auto px-4 space-y-6">
        {/* Breadcrumbs */}
        <div className="flex items-center gap-2 text-[12px] text-gray-500">
          <Link href="/" className="hover:text-hub-blue">{isRtl ? 'الرئيسية' : 'Home'}</Link>
          <ChevronRight className="w-3 h-3 rtl:rotate-180 text-gray-400" />
          <span className="font-semibold text-gray-900">{isRtl ? 'مقارنة المنتجات' : 'Compare Products'}</span>
        </div>

        <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 flex items-center gap-2">
          <Shuffle className="w-7 h-7 text-hub-blue" />
          <span>{isRtl ? `مقارنة المواصفات (${comparedProducts.length} منتجات)` : `Product Comparison (${comparedProducts.length})`}</span>
        </h1>

        {comparedProducts.length === 0 ? (
          <div className="bg-white rounded-2xl border border-gray-200 p-12 text-center space-y-4">
            <div className="w-16 h-16 bg-blue-50 text-hub-blue rounded-full flex items-center justify-center mx-auto">
              <Shuffle className="w-8 h-8" />
            </div>
            <h3 className="text-lg font-bold text-gray-900">{isRtl ? 'لم تقم بإضافة منتجات للمقارنة بعد' : 'No products in comparison'}</h3>
            <p className="text-[13px] text-gray-500 max-w-sm mx-auto">
              {isRtl ? 'اضغط على زر المقارنة على بطاقة أي منتج لمقارنة المواصفات الفنية وجهاً لوجه.' : 'Click the compare button on any product card to view side-by-side technical specs.'}
            </p>
            <Link
              href="/products"
              className="inline-block bg-hub-blue text-white font-bold text-[13px] px-6 py-2.5 rounded-xl hover:bg-hub-blue-dark transition-colors"
            >
              {isRtl ? 'استعراض المنتجات' : 'Browse Products'}
            </Link>
          </div>
        ) : (
          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-x-auto">
            <table className="w-full text-start text-[13px] border-collapse min-w-[700px]">
              <thead>
                <tr className="border-b border-gray-200 bg-gray-50">
                  <th className="p-4 w-48 text-start font-bold text-gray-500 uppercase text-[11px]">{isRtl ? 'المواصفة' : 'Feature'}</th>
                  {comparedProducts.map(p => (
                    <th key={p.id} className="p-4 text-start font-bold text-gray-900 min-w-[220px]">
                      <div className="space-y-3">
                        <div className="w-24 h-24 relative mx-auto bg-white rounded-lg p-2 border border-gray-100">
                          <Image src={p.thumbnail} alt={p.name} fill className="object-contain mix-blend-multiply" />
                        </div>
                        <div className="text-[13px] font-bold line-clamp-2 h-10">{p.name}</div>
                        <div className="text-lg font-black text-hub-blue">{formatPrice(p.price)}</div>
                        <div className="flex gap-2">
                          <button
                            onClick={() => addToCart(p)}
                            className="flex-1 bg-hub-blue text-white py-1.5 px-2 rounded-lg text-[11px] font-bold hover:bg-hub-blue-dark transition-colors"
                          >
                            {isRtl ? 'أضف للسلة' : 'Add to Cart'}
                          </button>
                          <button
                            onClick={() => toggleCompare(p.id)}
                            className="p-1.5 text-rose-500 hover:bg-rose-50 rounded-lg border border-rose-200"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                <tr>
                  <td className="p-4 font-bold text-gray-500 bg-gray-50/50">{isRtl ? 'الماركة' : 'Brand'}</td>
                  {comparedProducts.map(p => (
                    <td key={p.id} className="p-4 font-semibold text-gray-900">{p.brand}</td>
                  ))}
                </tr>
                <tr>
                  <td className="p-4 font-bold text-gray-500 bg-gray-50/50">{isRtl ? 'المعالج' : 'Processor'}</td>
                  {comparedProducts.map(p => (
                    <td key={p.id} className="p-4 text-gray-700">{p.specs['Processor'] || p.specs['المعالج'] || 'N/A'}</td>
                  ))}
                </tr>
                <tr>
                  <td className="p-4 font-bold text-gray-500 bg-gray-50/50">{isRtl ? 'كارت الشاشة' : 'Graphics'}</td>
                  {comparedProducts.map(p => (
                    <td key={p.id} className="p-4 text-gray-700">{p.specs['Graphics'] || p.specs['كارت الشاشة'] || 'N/A'}</td>
                  ))}
                </tr>
                <tr>
                  <td className="p-4 font-bold text-gray-500 bg-gray-50/50">{isRtl ? 'الذاكرة العشوائية' : 'RAM'}</td>
                  {comparedProducts.map(p => (
                    <td key={p.id} className="p-4 text-gray-700">{p.specs['RAM'] || p.specs['Memory'] || '8GB - 16GB'}</td>
                  ))}
                </tr>
                <tr>
                  <td className="p-4 font-bold text-gray-500 bg-gray-50/50">{isRtl ? 'التخزين' : 'Storage'}</td>
                  {comparedProducts.map(p => (
                    <td key={p.id} className="p-4 text-gray-700">{p.specs['Storage'] || '512GB - 1TB SSD'}</td>
                  ))}
                </tr>
                <tr>
                  <td className="p-4 font-bold text-gray-500 bg-gray-50/50">{isRtl ? 'التقسيط الشهري' : 'Monthly Installment'}</td>
                  {comparedProducts.map(p => (
                    <td key={p.id} className="p-4 text-blue-600 font-bold">
                      {p.monthlyInstallment ? formatPrice(p.monthlyInstallment.valuPrice) + ' / mo' : 'Available'}
                    </td>
                  ))}
                </tr>
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
