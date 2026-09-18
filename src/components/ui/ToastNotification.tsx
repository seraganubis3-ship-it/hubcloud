'use client';

import React, { useEffect, useState, useRef } from 'react';
import Link from 'next/link';
import { useStore } from '@/context/StoreContext';
import { AnimatePresence, motion } from 'framer-motion';
import {
  CheckCircle2,
  Info,
  AlertCircle,
  X,
  ShoppingCart,
  ArrowRight
} from 'lucide-react';

export const ToastNotification: React.FC = () => {
  const { toast, hideToast, isRtl, formatPrice } = useStore();
  const [isHovered, setIsHovered] = useState(false);
  const [progress, setProgress] = useState(100);
  const startTimeRef = useRef<number>(0);
  const remainingTimeRef = useRef<number>(4500);

  const TOTAL_DURATION = 4500;

  // Auto-dismiss with hover pause
  useEffect(() => {
    if (!toast) {
      setProgress(100);
      return;
    }

    remainingTimeRef.current = TOTAL_DURATION;
    startTimeRef.current = Date.now();
    setProgress(100);

    const interval = setInterval(() => {
      if (!isHovered) {
        const elapsed = Date.now() - startTimeRef.current;
        const remaining = Math.max(0, remainingTimeRef.current - elapsed);
        const percent = (remaining / TOTAL_DURATION) * 100;
        setProgress(percent);

        if (remaining <= 0) {
          clearInterval(interval);
          hideToast();
        }
      } else {
        startTimeRef.current = Date.now();
      }
    }, 40);

    return () => clearInterval(interval);
  }, [toast, isHovered, hideToast]);

  const handleMouseEnter = () => {
    setIsHovered(true);
    const elapsed = Date.now() - startTimeRef.current;
    remainingTimeRef.current = Math.max(0, remainingTimeRef.current - elapsed);
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
    startTimeRef.current = Date.now();
  };

  return (
    <div
      dir={isRtl ? 'rtl' : 'ltr'}
      className="fixed top-4 sm:top-6 right-3 sm:right-6 rtl:right-auto rtl:left-3 rtl:sm:left-6 z-[100000] pointer-events-none max-w-[calc(100vw-1.5rem)] sm:max-w-md w-full"
    >
      <AnimatePresence mode="wait">
        {toast && (
          <motion.div
            key={toast.message + (toast.productTitle || '')}
            initial={{ opacity: 0, y: -24, scale: 0.92 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.94, filter: 'blur(4px)' }}
            transition={{ type: 'spring', stiffness: 450, damping: 30 }}
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
            className="pointer-events-auto relative overflow-hidden rounded-2xl bg-white/95 backdrop-blur-xl border border-slate-200/90 shadow-[0_20px_50px_-10px_rgba(0,98,210,0.22),0_10px_20px_-5px_rgba(0,0,0,0.08)]"
          >
            {/* Top ambient color indicator */}
            <div
              className={`h-1 w-full ${
                toast.type === 'success'
                  ? 'bg-gradient-to-r from-emerald-500 via-teal-400 to-blue-500'
                  : toast.type === 'error'
                  ? 'bg-gradient-to-r from-rose-500 to-red-600'
                  : 'bg-gradient-to-r from-blue-500 to-cyan-500'
              }`}
            />

            {toast.isCart ? (
              /* --- Cart Notification Deluxe View --- */
              <div className="p-4 sm:p-5 space-y-3.5">
                {/* Header Row */}
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-full bg-emerald-50 text-emerald-600 border border-emerald-200/60 flex items-center justify-center shrink-0 shadow-2xs">
                      <CheckCircle2 className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="text-xs sm:text-[13px] font-extrabold text-emerald-700 leading-none">
                        {isRtl ? 'تمت الإضافة إلى السلة بنجاح!' : 'Added to Cart Successfully!'}
                      </h4>
                    </div>
                  </div>

                  <button
                    onClick={hideToast}
                    className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
                    aria-label="Close"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                {/* Product Preview Card */}
                <div className="flex items-center gap-3 bg-slate-50/90 p-2.5 rounded-xl border border-slate-100">
                  {toast.productImage ? (
                    <div className="w-14 h-14 rounded-lg bg-white p-1 border border-slate-200/70 flex items-center justify-center shrink-0 overflow-hidden shadow-2xs">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={toast.productImage}
                        alt={toast.productTitle || 'Product'}
                        className="w-full h-full object-contain"
                      />
                    </div>
                  ) : (
                    <div className="w-14 h-14 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center shrink-0 border border-blue-100">
                      <ShoppingCart className="w-6 h-6" />
                    </div>
                  )}

                  <div className="min-w-0 flex-1">
                    <p className="text-xs sm:text-[13px] font-bold text-slate-900 line-clamp-2 leading-snug">
                      {toast.productTitle || toast.message}
                    </p>
                    {toast.productPrice !== undefined && toast.productPrice > 0 && (
                      <p className="text-xs font-black text-hub-blue mt-1">
                        {formatPrice(toast.productPrice)}
                      </p>
                    )}
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex items-center gap-2 pt-0.5">
                  <Link
                    href="/cart"
                    onClick={hideToast}
                    className="flex-1 py-2.5 px-4 rounded-xl bg-gradient-to-r from-blue-600 to-hub-blue hover:from-blue-700 hover:to-blue-800 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-md shadow-blue-500/25 active:scale-[0.98] transition-all"
                  >
                    <ShoppingCart className="w-4 h-4" />
                    <span>{isRtl ? 'عرض السلة وإتمام الشراء' : 'View Cart & Checkout'}</span>
                    <ArrowRight className="w-3.5 h-3.5 rtl:rotate-180" />
                  </Link>

                  <button
                    onClick={hideToast}
                    className="py-2.5 px-3.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs transition-colors active:scale-95 shrink-0"
                  >
                    {isRtl ? 'متابعة' : 'Continue'}
                  </button>
                </div>
              </div>
            ) : (
              /* --- General Toast View (Success / Info / Error) --- */
              <div className="p-4 flex items-center justify-between gap-3">
                <div className="flex items-center gap-3 min-w-0">
                  <div
                    className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 shadow-2xs ${
                      toast.type === 'success'
                        ? 'bg-emerald-50 text-emerald-600 border border-emerald-200'
                        : toast.type === 'error'
                        ? 'bg-rose-50 text-rose-600 border border-rose-200'
                        : 'bg-blue-50 text-blue-600 border border-blue-200'
                    }`}
                  >
                    {toast.type === 'success' ? (
                      <CheckCircle2 className="w-5 h-5" />
                    ) : toast.type === 'error' ? (
                      <AlertCircle className="w-5 h-5" />
                    ) : (
                      <Info className="w-5 h-5" />
                    )}
                  </div>

                  <p className="text-xs sm:text-[13px] font-bold text-slate-900 leading-snug">
                    {toast.message}
                  </p>
                </div>

                <button
                  onClick={hideToast}
                  className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors shrink-0"
                  aria-label="Close"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            )}

            {/* Bottom Progress Countdown Bar */}
            <div className="h-1 bg-slate-100 w-full overflow-hidden">
              <div
                className={`h-full transition-all duration-75 ${
                  toast.type === 'success'
                    ? 'bg-emerald-500'
                    : toast.type === 'error'
                    ? 'bg-rose-500'
                    : 'bg-blue-600'
                }`}
                style={{ width: `${progress}%` }}
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
