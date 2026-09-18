'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useStore } from '@/context/StoreContext';
import { ProductCard } from '@/components/product/ProductCard';
import { TrustBadgesRow } from '@/components/home/TrustBadgesRow';
import {
  ChevronRight,
  Trash2,
  RefreshCw,
  Lock,
  ArrowRight,
  Tag,
  Info,
  ShoppingCart,
  Plus,
  Minus
} from 'lucide-react';

export default function CartPage() {
  const router = useRouter();
  const {
    language,
    isRtl,
    formatPrice,
    cart,
    cartCount,
    removeFromCart,
    updateQuantity,
    clearCart,
    subtotal,
    shipping,
    vat,
    discount,
    total,
    appliedCoupon,
    applyCoupon,
    removeCoupon,
    showToast,
    products
  } = useStore();

  const [couponInput, setCouponInput] = useState('');

  const handleApplyCoupon = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!couponInput.trim()) return;
    const success = await applyCoupon(couponInput);
    if (success) setCouponInput('');
  };

  const youMayAlsoLike = products.slice(0, 5);

  return (
    <div className="py-4">
      <div className="max-w-[1536px] mx-auto px-4 sm:px-6 space-y-6">
        {/* Breadcrumbs */}
        <div className="flex items-center gap-2 text-[12px] text-gray-500">
          <Link href="/" className="hover:text-hub-blue">{isRtl ? 'الرئيسية' : 'Home'}</Link>
          <ChevronRight className="w-3 h-3 rtl:rotate-180 text-gray-400" />
          <span className="font-semibold text-gray-900">{isRtl ? 'سلة المشتريات' : 'Your Cart'}</span>
        </div>

        {/* Page Header */}
        <div className="flex flex-wrap items-center justify-between gap-4 pb-3 border-b border-gray-200">
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900">
              {isRtl ? `سلة المشتريات (${cartCount} منتجات)` : `Your Cart (${cartCount} Items)`}
            </h1>
          </div>
          <Link
            href="/products"
            className="inline-flex items-center gap-1.5 text-[13px] font-bold text-hub-blue hover:text-hub-blue-dark bg-white border border-gray-300 px-4 py-2 rounded-xl hover:border-hub-blue transition-colors shadow-sm"
          >
            <span>{isRtl ? 'متابعة التسوق' : 'Continue Shopping'}</span>
            <ArrowRight className="w-4 h-4 rtl:rotate-180" />
          </Link>
        </div>

        {cart.length === 0 ? (
          <div className="bg-white rounded-2xl border border-gray-200 p-16 text-center space-y-4">
            <div className="w-20 h-20 bg-blue-50 text-hub-blue rounded-full flex items-center justify-center mx-auto">
              <ShoppingCart className="w-10 h-10" />
            </div>
            <h2 className="text-xl font-bold text-gray-900">
              {isRtl ? 'سلة المشتريات فاضية حالياً' : 'Your Shopping Cart is Empty'}
            </h2>
            <p className="text-[14px] text-gray-500 max-w-md mx-auto">
              {isRtl ? 'تصفح أحدث عروض اللابتوبات، السيرفرات، والشبكات وأضف المنتجات لسلتك الآن.' : 'Explore our catalog of enterprise laptops, servers, and tech gear to fill your cart.'}
            </p>
            <Link
              href="/products"
              className="inline-block bg-hub-blue text-white font-bold text-[14px] px-6 py-3 rounded-xl hover:bg-hub-blue-dark transition-colors shadow-md"
            >
              {isRtl ? 'ابدأ التسوق الآن' : 'Start Shopping Now'}
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            {/* Left Items Column (8 Cols) */}
            <div className="lg:col-span-8 space-y-4">
              {/* Cart Table Container */}
              <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
                <div className="hidden md:grid grid-cols-12 gap-4 px-5 py-3.5 bg-gray-50 text-[12px] font-bold text-gray-500 border-b border-gray-200 uppercase">
                  <div className="col-span-6">{isRtl ? 'المنتج' : 'Product'}</div>
                  <div className="col-span-2 text-center">{isRtl ? 'الحالة' : 'Availability'}</div>
                  <div className="col-span-2 text-center">{isRtl ? 'الكمية' : 'Quantity'}</div>
                  <div className="col-span-2 text-end">{isRtl ? 'الإجمالي' : 'Total'}</div>
                </div>

                <div className="divide-y divide-gray-100">
                  {cart.map(item => (
                    <div
                      key={item.id}
                      className="p-3.5 sm:p-5 flex flex-col md:grid md:grid-cols-12 gap-3 md:gap-4 md:items-center"
                    >
                      {/* Product Thumbnail & Details (Col 6) */}
                      <div className="md:col-span-6 flex items-start sm:items-center gap-3 sm:gap-4">
                        <div className="w-16 h-16 sm:w-20 sm:h-20 bg-white rounded-xl border border-gray-200 p-1.5 sm:p-2 flex-shrink-0 relative">
                          <Image
                            src={item.product.thumbnail || item.product.images[0]}
                            alt={item.product.name}
                            fill
                            className="object-contain p-1 mix-blend-multiply"
                          />
                        </div>
                        <div className="space-y-1 min-w-0 flex-1">
                          <Link href={`/products/${item.product.id}`}>
                            <h4 className="font-bold text-[13px] sm:text-[14px] text-gray-900 hover:text-hub-blue transition-colors line-clamp-2 sm:line-clamp-1">
                              {isRtl ? (item.product.nameAr || item.product.name) : item.product.name}
                            </h4>
                          </Link>
                          <div className="text-[11px] text-gray-500">
                            {item.selectedRam && <span>{item.selectedRam} • </span>}
                            {item.selectedStorage && <span>{item.selectedStorage}</span>}
                          </div>
                          <span className="text-[10px] font-mono text-gray-400 block">
                            SKU: {item.product.sku}
                          </span>
                        </div>
                      </div>

                      {/* Availability (Col 2 - desktop only) */}
                      <div className="hidden md:block md:col-span-2 text-start md:text-center text-[11px] font-bold text-emerald-600">
                        <span className="inline-flex items-center gap-1">
                          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                          <span>{isRtl ? 'متوفر' : 'In Stock'}</span>
                        </span>
                        <span className="text-[10px] text-gray-400 block">{isRtl ? 'شحن 24 ساعة' : 'Ships in 24h'}</span>
                      </div>

                      {/* Mobile Row: Quantity on Left, Total & Delete on Right (Or Desktop Cols 2 & 2) */}
                      <div className="flex md:contents items-center justify-between pt-2 md:pt-0 border-t md:border-t-0 border-gray-100">
                        {/* Quantity Selector (Col 2) */}
                        <div className="md:col-span-2 flex items-center justify-start md:justify-center">
                          <div className="flex items-center border border-gray-200 rounded-lg bg-gray-50 p-0.5">
                            <button
                              type="button"
                              onClick={() => updateQuantity(item.id, item.quantity - 1)}
                              aria-label={isRtl ? 'تقليل الكمية' : 'Decrease quantity'}
                              className="p-1.5 min-w-[44px] min-h-[44px] flex items-center justify-center hover:bg-white text-gray-600 rounded transition-colors"
                            >
                              <Minus className="w-3.5 h-3.5" />
                            </button>
                            <span className="w-8 text-center text-[13px] font-bold font-mono">
                              {item.quantity}
                            </span>
                            <button
                              type="button"
                              onClick={() => updateQuantity(item.id, item.quantity + 1)}
                              aria-label={isRtl ? 'زيادة الكمية' : 'Increase quantity'}
                              className="p-1.5 min-w-[44px] min-h-[44px] flex items-center justify-center hover:bg-white text-gray-600 rounded transition-colors"
                            >
                              <Plus className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>

                        {/* Total & Action (Col 2) */}
                        <div className="md:col-span-2 flex items-center justify-end gap-3 text-end">
                          <div>
                            <div className="font-extrabold text-[14px] sm:text-[15px] text-gray-900 font-mono">
                              {formatPrice(item.totalPrice)}
                            </div>
                            {item.product.oldPrice && (
                              <span className="text-[10px] text-emerald-600 font-bold block">
                                {isRtl ? `وفر ${formatPrice((item.product.oldPrice - item.product.price) * item.quantity)}` : `Save ${formatPrice((item.product.oldPrice - item.product.price) * item.quantity)}`}
                              </span>
                            )}
                          </div>

                          <button
                            type="button"
                            onClick={() => removeFromCart(item.id)}
                            title="Remove item"
                            className="p-2 text-gray-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors active:scale-95"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Table Footer Controls */}
                <div className="p-4 bg-gray-50/70 border-t border-gray-200 flex flex-wrap items-center justify-between gap-3">
                  <button
                    onClick={() => showToast(isRtl ? 'تم تحديث سلة المشتريات بنجاح' : 'Cart updated successfully', 'success')}
                    className="flex items-center gap-1.5 text-[12px] font-bold text-gray-700 hover:text-hub-blue bg-white border border-gray-200 px-4 py-2 rounded-lg transition-colors shadow-sm"
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                    <span>{isRtl ? 'تحديث السلة' : 'Update Cart'}</span>
                  </button>

                  <button
                    onClick={clearCart}
                    className="flex items-center gap-1.5 text-[12px] font-bold text-rose-600 hover:text-rose-700 bg-white border border-rose-200 hover:bg-rose-50 px-4 py-2 rounded-lg transition-colors shadow-sm"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>{isRtl ? 'إفراغ السلة' : 'Clear Cart'}</span>
                  </button>
                </div>
              </div>

              {/* Coupon Code Section */}
              <div className="bg-white rounded-2xl border border-gray-200 p-5 shadow-sm space-y-3">
                <div className="flex items-center gap-2">
                  <Tag className="w-4 h-4 text-hub-blue" />
                  <h4 className="font-bold text-gray-900 text-[14px]">
                    {isRtl ? 'عندك كود خصم؟' : 'Have a coupon code?'}
                  </h4>
                </div>
                <p className="text-[12px] text-gray-500">
                  {isRtl ? 'اكتب كود الخصم (مثال: HUB2026 أو SAVE2000) للاستفادة من خصم فوري على طلبك.' : 'Enter your promo code (e.g. HUB2026 or SAVE2000) to apply instant discount.'}
                </p>

                <form onSubmit={handleApplyCoupon} className="flex gap-2 max-w-md">
                  <input
                    type="text"
                    id="coupon-input"
                    aria-label={isRtl ? 'كود الخصم' : 'Discount coupon code'}
                    value={couponInput}
                    onChange={(e) => setCouponInput(e.target.value)}
                    placeholder={isRtl ? 'اكتب كود الخصم هنا' : 'Enter coupon code'}
                    className="flex-1 px-4 py-2 text-[13px] border border-gray-300 rounded-xl focus:outline-none focus:border-hub-blue uppercase font-bold"
                  />
                  <button
                    type="submit"
                    className="bg-hub-blue hover:bg-hub-blue-dark text-white font-bold text-[13px] px-5 py-2 rounded-xl transition-colors shadow-sm"
                  >
                    {isRtl ? 'تطبيق الكود' : 'Apply Coupon'}
                  </button>
                </form>

                {appliedCoupon && (
                  <div className="flex items-center justify-between bg-emerald-50 text-emerald-800 p-3 rounded-xl border border-emerald-200 text-[12px] font-bold">
                    <span>✓ {isRtl ? `تم تفعيل الكود "${appliedCoupon}" بنجاح!` : `Coupon "${appliedCoupon}" applied!`}</span>
                    <button
                      onClick={removeCoupon}
                      className="text-rose-600 hover:underline font-bold"
                    >
                      {isRtl ? 'حذف الكود' : 'Remove'}
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Right Column: Order Summary & Trust Boxes (4 Cols) */}
            <div className="lg:col-span-4 space-y-5">
              {/* Order Summary Box (Matches Mockup 5) */}
              <div className="bg-white rounded-2xl border border-gray-200 p-5 shadow-sm space-y-4">
                <h3 className="font-extrabold text-[17px] text-gray-900 pb-3 border-b border-gray-100">
                  {isRtl ? 'ملخص الطلب والفاتورة' : 'Order Summary'}
                </h3>

                <div className="space-y-2.5 text-[13px] text-gray-600">
                  <div className="flex justify-between">
                    <span>{isRtl ? `المجموع الفرعي (${cartCount} منتجات):` : `Subtotal (${cartCount} items):`}</span>
                    <span className="font-bold text-gray-900">{formatPrice(subtotal)}</span>
                  </div>

                  <div className="flex justify-between items-center">
                    <span className="flex items-center gap-1">
                      <span>{isRtl ? 'تكلفة الشحن والتوصيل:' : 'Shipping:'}</span>
                      <Info className="w-3.5 h-3.5 text-gray-400" />
                    </span>
                    <span className="font-bold text-gray-900">{formatPrice(shipping)}</span>
                  </div>

                  {discount > 0 && (
                    <div className="flex justify-between text-emerald-600 font-bold">
                      <span>{isRtl ? 'خصم الكوبون:' : 'Discount:'}</span>
                      <span>- {formatPrice(discount)}</span>
                    </div>
                  )}

                  <div className="pt-3 border-t border-gray-200 flex justify-between items-baseline">
                    <div>
                      <span className="font-black text-gray-900 text-[16px] block">
                        {isRtl ? 'الإجمالي الكلي:' : 'Total:'}
                      </span>
                      <span className="text-[11px] text-gray-400">
                        {isRtl ? 'السعر النهائي للمنتجات والشحن' : 'Final price including shipping'}
                      </span>
                    </div>
                    <span className="text-2xl font-black text-hub-blue">
                      {formatPrice(total)}
                    </span>
                  </div>
                </div>

                {/* Checkout Button */}
                <div className="pt-3 space-y-2">
                  <button
                    onClick={() => router.push('/checkout')}
                    className="w-full bg-hub-blue hover:bg-hub-blue-dark text-white font-bold text-[14px] py-3.5 px-4 rounded-xl flex items-center justify-center gap-2 shadow-md transition-all active:scale-95"
                  >
                    <Lock className="w-4 h-4" />
                    <span>{isRtl ? 'متابعة الطلب' : 'Proceed to Checkout'}</span>
                  </button>

                  <Link
                    href="/products"
                    className="w-full bg-white hover:bg-gray-50 text-gray-700 border border-gray-300 font-bold text-[13px] py-2.5 px-4 rounded-xl flex items-center justify-center transition-colors block text-center"
                  >
                    {isRtl ? 'متابعة التسوق' : 'Continue Shopping'}
                  </Link>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* You May Also Like Carousel */}
        <div className="space-y-4 pt-6">
          <h3 className="text-xl font-bold text-gray-900">
            {isRtl ? 'منتجات مقترحة قد تعجبك' : 'You May Also Like'}
          </h3>
          <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4">
            {youMayAlsoLike.map(prod => (
              <ProductCard key={prod.id} product={prod} />
            ))}
          </div>
        </div>

        {/* Bottom Trust Row */}
        <TrustBadgesRow />
      </div>
    </div>
  );
}
