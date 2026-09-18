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
  const remainingTimeRef = useRef<number>(4000);

  const TOTAL_DURATION = 4000;

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
      className="fixed top-3 sm:top-5 left-3 right-3 sm:left-auto sm:right-6 rtl:sm:right-auto rtl:sm:left-6 z-[100000] pointer-events-none flex justify-center sm:block"
    >
      <AnimatePresence mode="wait">
        {toast && (
          <motion.div
            key={toast.message + (toast.productTitle || '')}
            initial={{ opacity: 0, y: -16, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -12, scale: 0.96 }}
            transition={{ type: 'spring', stiffness: 500, damping: 35 }}
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
            className="pointer-events-auto w-full max-w-sm sm:max-w-md relative overflow-hidden rounded-xl sm:rounded-2xl bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border border-slate-200/90 dark:border-slate-800 shadow-[0_10px_30px_-8px_rgba(0,0,0,0.12)] p-2.5 sm:p-3"
          >
            {toast.isCart ? (
              /* --- Simple & Responsive Cart Toast --- */
              <div className="flex items-center gap-2.5 sm:gap-3">
                {/* Product Thumbnail with tiny Check Badge */}
                <div className="relative shrink-0">
                  <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700/60 p-1 flex items-center justify-center overflow-hidden">
                    {toast.productImage ? (
                      /* eslint-disable-next-line @next/next/no-img-element */
                      <img
                        src={toast.productImage}
                        alt={toast.productTitle || 'Product'}
                        className="w-full h-full object-contain"
                      />
                    ) : (
                      <ShoppingCart className="w-5 h-5 text-hub-blue" />
                    )}
                  </div>
                  <span className="absolute -top-1 -right-1 rtl:-left-1 rtl:right-auto w-4 h-4 rounded-full bg-emerald-500 text-white flex items-center justify-center ring-2 ring-white dark:ring-slate-900 shadow-2xs">
                    <CheckCircle2 className="w-2.5 h-2.5 stroke-[3]" />
                  </span>
                </div>

                {/* Info Text */}
                <div className="min-w-0 flex-1">
                  <p className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400 leading-tight">
                    {isRtl ? 'تمت الإضافة إلى السلة' : 'Added to Cart'}
                  </p>
                  <p className="text-xs sm:text-[13px] font-medium text-slate-800 dark:text-slate-200 truncate leading-snug">
                    {toast.productTitle || toast.message}
                  </p>
                  {toast.productPrice !== undefined && toast.productPrice > 0 && (
                    <p className="text-xs font-bold text-hub-blue dark:text-blue-400 leading-tight mt-0.5">
                      {formatPrice(toast.productPrice)}
                    </p>
                  )}
                </div>

                {/* Actions: View Cart + Close */}
                <div className="flex items-center gap-1.5 shrink-0">
                  <Link
                    href="/cart"
                    onClick={hideToast}
                    className="h-8 px-2.5 sm:px-3 rounded-lg bg-hub-blue hover:bg-blue-700 active:scale-95 text-white font-medium text-xs flex items-center gap-1 shadow-xs transition-all"
                  >
                    <span>{isRtl ? 'السلة' : 'Cart'}</span>
                    <ArrowRight className="w-3.5 h-3.5 rtl:rotate-180" />
                  </Link>

                  <button
                    onClick={hideToast}
                    className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                    aria-label="Close"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ) : (
              /* --- Simple & Responsive General Toast --- */
              <div className="flex items-center gap-2.5 sm:gap-3">
                <div
                  className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                    toast.type === 'success'
                      ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-950/40 dark:text-emerald-400'
                      : toast.type === 'error'
                      ? 'bg-rose-50 text-rose-600 dark:bg-rose-950/40 dark:text-rose-400'
                      : 'bg-blue-50 text-blue-600 dark:bg-blue-950/40 dark:text-blue-400'
                  }`}
                >
                  {toast.type === 'success' ? (
                    <CheckCircle2 className="w-4 h-4" />
                  ) : toast.type === 'error' ? (
                    <AlertCircle className="w-4 h-4" />
                  ) : (
                    <Info className="w-4 h-4" />
                  )}
                </div>

                <p className="text-xs sm:text-sm font-medium text-slate-800 dark:text-slate-200 flex-1 min-w-0 leading-snug">
                  {toast.message}
                </p>

                <button
                  onClick={hideToast}
                  className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors shrink-0"
                  aria-label="Close"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            )}

            {/* Subtle countdown progress line */}
            <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-slate-100 dark:bg-slate-800 overflow-hidden">
              <div
                className={`h-full transition-all duration-75 ${
                  toast.type === 'success'
                    ? 'bg-emerald-500'
                    : toast.type === 'error'
                    ? 'bg-rose-500'
                    : 'bg-hub-blue'
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
