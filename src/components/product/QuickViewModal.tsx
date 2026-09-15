'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Product } from '@/types';
import { useStore } from '@/context/StoreContext';
import { X, ShoppingCart, ShieldCheck, Check, Truck, ArrowRight, Minus, Plus } from 'lucide-react';

interface QuickViewModalProps {
  product: Product | null;
  onClose: () => void;
}

export const QuickViewModal: React.FC<QuickViewModalProps> = ({ product, onClose }) => {
  const { language, isRtl, formatPrice, addToCart } = useStore();
  const [selectedImage, setSelectedImage] = useState(0);
  const [selectedRam, setSelectedRam] = useState(product?.ramOptions?.[0]?.label || '');
  const [selectedStorage, setSelectedStorage] = useState(product?.storageOptions?.[0]?.label || '');
  const [quantity, setQuantity] = useState(1);

  if (!product) return null;

  const title = isRtl ? (product.nameAr || product.name) : product.name;
  const description = isRtl ? (product.descriptionAr || product.description) : product.description;

  // Calculate dynamic price based on options
  const ramExtra = product.ramOptions?.find(r => r.label === selectedRam)?.priceDelta || 0;
  const storageExtra = product.storageOptions?.find(s => s.label === selectedStorage)?.priceDelta || 0;
  const currentUnitPrice = product.price + ramExtra + storageExtra;

  const images = product.images && product.images.length > 0 ? product.images : [product.thumbnail];

  const handleAdd = () => {
    addToCart(product, quantity, {
      ram: selectedRam,
      storage: selectedStorage,
      unitPrice: currentUnitPrice
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl max-w-3xl w-full p-5 sm:p-7 space-y-4 shadow-2xl relative animate-in zoom-in-95 duration-200 border border-gray-100 max-h-[92vh] overflow-y-auto">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 rtl:right-auto rtl:left-4 p-2 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-700 transition-colors z-10"
          aria-label="Close"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
          {/* Gallery */}
          <div className="space-y-3">
            <div className="w-full aspect-square bg-white rounded-2xl relative p-4 flex items-center justify-center overflow-hidden">
              <Image
                src={images[selectedImage] || product.thumbnail}
                alt={title}
                fill
                sizes="(max-width: 768px) 100vw, 400px"
                className="object-contain p-4 transition-all duration-300"
              />
            </div>

            {/* Thumbnails */}
            {images.length > 1 && (
              <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-1">
                {images.map((img, idx) => (
                  <button
                    key={idx}
                    onClick={() => setSelectedImage(idx)}
                    className={`w-14 h-14 rounded-xl border-2 p-1 relative flex-shrink-0 bg-white transition-all ${
                      selectedImage === idx ? 'border-blue-600 shadow-sm' : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <Image src={img} alt="thumbnail" fill className="object-contain p-1" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Details & Configurator */}
          <div className="space-y-3.5">
            <div>
              <div className="flex items-center justify-between gap-2 mb-1">
                <span className="text-[11px] font-black text-blue-600 uppercase tracking-wider bg-blue-50 px-2 py-0.5 rounded-md">
                  {product.brand}
                </span>
                <span className="text-[11px] text-emerald-600 font-bold bg-emerald-50 px-2 py-0.5 rounded-md flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                  {isRtl ? 'متوفر بالمخزون' : 'In Stock'}
                </span>
              </div>

              <h2 className="text-base sm:text-lg font-black text-gray-900 leading-snug">
                {title}
              </h2>
            </div>

            {/* Price Box */}
            <div className="bg-slate-50 p-3 rounded-2xl border border-gray-200/80 flex items-baseline justify-between">
              <div className="flex items-baseline gap-2">
                <span className="text-2xl font-black text-gray-900 font-mono">
                  {formatPrice(currentUnitPrice)}
                </span>
                {product.oldPrice && (
                  <span className="text-[13px] text-gray-400 line-through font-medium">
                    {formatPrice(product.oldPrice)}
                  </span>
                )}
              </div>
              {product.discountPercentage && (
                <span className="text-[11px] font-black text-red-600 bg-red-50 px-2 py-0.5 rounded-md">
                  {isRtl ? `وفر ${product.discountPercentage}%` : `Save ${product.discountPercentage}%`}
                </span>
              )}
            </div>

            {/* RAM Options */}
            {product.ramOptions && product.ramOptions.length > 0 && (
              <div className="space-y-1.5">
                <label className="text-[12px] font-bold text-gray-700 block">
                  {isRtl ? 'سعة الرام (RAM):' : 'Memory (RAM):'}
                </label>
                <div className="flex flex-wrap gap-2">
                  {product.ramOptions.map((ram) => (
                    <button
                      key={ram.label}
                      onClick={() => setSelectedRam(ram.label)}
                      className={`px-3 py-1.5 rounded-xl text-[12px] font-bold border transition-all ${
                        selectedRam === ram.label
                          ? 'border-blue-600 bg-blue-50 text-blue-700 shadow-2xs'
                          : 'border-gray-200 text-gray-700 hover:border-gray-300 bg-white'
                      }`}
                    >
                      {ram.label} {ram.priceDelta > 0 && `(+${formatPrice(ram.priceDelta)})`}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Storage Options */}
            {product.storageOptions && product.storageOptions.length > 0 && (
              <div className="space-y-1.5">
                <label className="text-[12px] font-bold text-gray-700 block">
                  {isRtl ? 'سعة التخزين (SSD):' : 'Storage (SSD):'}
                </label>
                <div className="flex flex-wrap gap-2">
                  {product.storageOptions.map((st) => (
                    <button
                      key={st.label}
                      onClick={() => setSelectedStorage(st.label)}
                      className={`px-3 py-1.5 rounded-xl text-[12px] font-bold border transition-all ${
                        selectedStorage === st.label
                          ? 'border-blue-600 bg-blue-50 text-blue-700 shadow-2xs'
                          : 'border-gray-200 text-gray-700 hover:border-gray-300 bg-white'
                      }`}
                    >
                      {st.label} {st.priceDelta > 0 && `(+${formatPrice(st.priceDelta)})`}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Quantity Stepper & Add to Cart */}
            <div className="pt-2 flex items-center gap-3">
              <div className="flex items-center border border-gray-200 rounded-xl bg-gray-50 p-1">
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="w-8 h-8 rounded-lg bg-white flex items-center justify-center text-gray-700 hover:bg-gray-100 transition-colors shadow-2xs"
                  aria-label="Decrease"
                >
                  <Minus className="w-3.5 h-3.5" />
                </button>
                <span className="w-9 text-center font-black text-gray-900 text-[14px]">
                  {quantity}
                </span>
                <button
                  onClick={() => setQuantity(quantity + 1)}
                  className="w-8 h-8 rounded-lg bg-white flex items-center justify-center text-gray-700 hover:bg-gray-100 transition-colors shadow-2xs"
                  aria-label="Increase"
                >
                  <Plus className="w-3.5 h-3.5" />
                </button>
              </div>

              <button
                onClick={handleAdd}
                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-bold text-[13px] py-3 px-4 rounded-xl flex items-center justify-center gap-2 shadow-md transition-all active:scale-95"
              >
                <ShoppingCart className="w-4 h-4" />
                <span>{isRtl ? 'إضافة إلى السلة' : 'Add to Cart'}</span>
              </button>
            </div>

            {/* Link to full details */}
            <div className="pt-1 flex items-center justify-between text-[11px] text-gray-500 border-t border-gray-100">
              <span className="flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5 text-blue-600" />
                {isRtl ? 'ضمان رسمي محلي' : 'Official Local Warranty'}
              </span>

              <Link
                href={`/products/${product.id}`}
                onClick={onClose}
                className="text-blue-600 font-bold hover:underline inline-flex items-center gap-1"
              >
                <span>{isRtl ? 'عرض المواصفات الكاملة' : 'Full Specifications'}</span>
                <ArrowRight className="w-3 h-3 rtl:rotate-180" />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
