'use client';

import React from 'react';
import { useStore } from '@/context/StoreContext';
import { CheckCircle2, Info, AlertCircle } from 'lucide-react';

export const ToastNotification: React.FC = () => {
  const { toast } = useStore();

  if (!toast) return null;

  const icons = {
    success: <CheckCircle2 className="w-5 h-5 text-emerald-500" />,
    info: <Info className="w-5 h-5 text-hub-blue" />,
    error: <AlertCircle className="w-5 h-5 text-rose-500" />
  };

  const borderColors = {
    success: 'border-emerald-200 bg-white text-gray-900',
    info: 'border-blue-200 bg-white text-gray-900',
    error: 'border-rose-200 bg-white text-gray-900'
  };

  return (
    <div className="fixed top-20 right-6 rtl:right-auto rtl:left-6 z-50 animate-in fade-in slide-in-from-top-4 duration-200">
      <div className={`flex items-center gap-3 px-4 py-3 rounded-xl shadow-2xl border ${borderColors[toast.type]} max-w-md`}>
        {icons[toast.type]}
        <p className="text-[13px] font-semibold">{toast.message}</p>
      </div>
    </div>
  );
};
