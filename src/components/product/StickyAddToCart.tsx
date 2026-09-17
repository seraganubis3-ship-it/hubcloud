'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { Product } from '@/types';
import { useStore } from '@/context/StoreContext';
import { ShoppingCart } from 'lucide-react';

interface StickyAddToCartProps {
  product: Product;
  selectedRam?: string;
  selectedStorage?: string;
  selectedWarranty?: string;
  unitPrice: number;
}

export const StickyAddToCart: React.FC<StickyAddToCartProps> = ({
  product,
  selectedRam,
  selectedStorage,
  selectedWarranty,
  unitPrice,
}) => {
  const { language, isRtl, formatPrice, addToCart } = useStore();
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 450) {
        setVisible(true);
      } else {
        setVisible(false);
      }
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  if (!visible) return null;

  const title = isRtl ? (product.nameAr || product.name) : product.name;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-30 bg-white/95 backdrop-blur-md border-t border-gray-200 shadow-[0_-4px_20px_rgba(0,0,0,0.08)] p-2.5 sm:p-3 animate-in slide-in-from-bottom-3 duration-200">
      <div className="max-w-[1536px] mx-auto px-3 sm:px-6 flex items-center justify-between gap-2.5 sm:gap-4">
        {/* Product Mini Info */}
        <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
          <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gray-50 rounded-lg p-1 border border-gray-200 relative flex-shrink-0">
            <Image src={product.thumbnail} alt={title} fill className="object-contain" />
          </div>
          <div className="min-w-0">
            <h4 className="font-bold text-[12px] sm:text-[13px] text-gray-900 truncate max-w-[140px] sm:max-w-md">{title}</h4>
            <span className="text-[10px] sm:text-[11px] text-gray-500 truncate block">
              {product.brand} {selectedRam ? `• ${selectedRam}` : ''}
            </span>
          </div>
        </div>

        {/* Pricing & CTA */}
        <div className="flex items-center gap-2.5 sm:gap-4 flex-shrink-0">
          <div className="text-end">
            <span className="text-[9px] sm:text-[10px] text-gray-400 block font-semibold leading-tight">{isRtl ? 'السعر' : 'Price'}</span>
            <span className="text-base sm:text-xl font-black text-hub-blue font-mono leading-tight">{formatPrice(unitPrice)}</span>
          </div>

          <button
            onClick={() => addToCart(product, 1, { ram: selectedRam, storage: selectedStorage, warranty: selectedWarranty, unitPrice })}
            className="bg-hub-blue hover:bg-hub-blue-dark text-white font-bold text-xs sm:text-[13px] py-2 sm:py-2.5 px-3.5 sm:px-6 rounded-xl flex items-center gap-1.5 sm:gap-2 shadow-md transition-all active:scale-95 whitespace-nowrap"
          >
            <ShoppingCart className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            <span>{isRtl ? 'أضف للسلة' : 'Add to Cart'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
