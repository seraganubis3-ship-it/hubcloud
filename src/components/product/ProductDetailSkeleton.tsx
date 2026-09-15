import React from 'react';
import { Skeleton } from '@/components/ui/Skeleton';

export const ProductDetailSkeleton: React.FC = () => {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Breadcrumb Skeleton */}
      <div className="flex items-center gap-2 mb-6">
        <Skeleton className="h-4 w-16" />
        <Skeleton className="h-4 w-4" />
        <Skeleton className="h-4 w-24" />
        <Skeleton className="h-4 w-4" />
        <Skeleton className="h-4 w-48" />
      </div>

      <div className="bg-white rounded-2xl border border-gray-200 p-6 md:p-8 shadow-sm">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">
          {/* Gallery Skeleton (5 cols) */}
          <div className="lg:col-span-5 space-y-4">
            <Skeleton className="w-full aspect-square rounded-xl" />
            <div className="flex gap-3">
              <Skeleton className="w-16 h-16 rounded-lg" />
              <Skeleton className="w-16 h-16 rounded-lg" />
              <Skeleton className="w-16 h-16 rounded-lg" />
              <Skeleton className="w-16 h-16 rounded-lg" />
            </div>
          </div>

          {/* Product Info Skeleton (7 cols) */}
          <div className="lg:col-span-7 space-y-6">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Skeleton className="h-5 w-20 rounded-full" />
                <Skeleton className="h-4 w-28" />
              </div>
              <Skeleton className="h-8 w-4/5" />
              <Skeleton className="h-8 w-2/3" />
              <div className="flex items-center gap-3 pt-2">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-4 w-20" />
              </div>
            </div>

            {/* Price Box */}
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-100 space-y-2">
              <Skeleton className="h-4 w-20" />
              <Skeleton className="h-8 w-40" />
              <Skeleton className="h-3 w-32" />
            </div>

            {/* Actions */}
            <div className="flex gap-4 pt-2">
              <Skeleton className="h-12 flex-1 rounded-xl" />
              <Skeleton className="h-12 w-14 rounded-xl" />
              <Skeleton className="h-12 w-14 rounded-xl" />
            </div>

            {/* Specs Skeleton */}
            <div className="pt-6 border-t border-gray-100 space-y-3">
              <Skeleton className="h-5 w-32" />
              <div className="grid grid-cols-2 gap-3">
                <Skeleton className="h-10 rounded-lg" />
                <Skeleton className="h-10 rounded-lg" />
                <Skeleton className="h-10 rounded-lg" />
                <Skeleton className="h-10 rounded-lg" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
