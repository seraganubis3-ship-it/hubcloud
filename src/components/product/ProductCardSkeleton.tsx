import React from 'react';
import { Skeleton } from '@/components/ui/Skeleton';

interface ProductCardSkeletonProps {
  viewMode?: 'grid' | 'list';
}

export const ProductCardSkeleton: React.FC<ProductCardSkeletonProps> = ({ viewMode = 'grid' }) => {
  if (viewMode === 'list') {
    return (
      <div className="bg-white rounded-xl border border-gray-100 p-4 flex flex-col sm:flex-row items-center gap-6">
        <Skeleton className="w-full sm:w-48 h-48 flex-shrink-0 rounded-lg" />
        <div className="flex-1 w-full space-y-3">
          <div className="flex items-center gap-2">
            <Skeleton className="h-3 w-16" />
            <Skeleton className="h-3 w-20" />
          </div>
          <Skeleton className="h-5 w-3/4" />
          <Skeleton className="h-3.5 w-full" />
          <Skeleton className="h-3.5 w-2/3" />
          <div className="flex items-center gap-2 pt-1">
            <Skeleton className="h-4 w-24" />
          </div>
        </div>
        <div className="w-full sm:w-52 flex flex-col justify-between items-end border-t sm:border-t-0 sm:border-l rtl:sm:border-l-0 rtl:sm:border-r border-gray-100 pt-4 sm:pt-0 sm:px-4 space-y-3">
          <div className="w-full flex flex-col items-end gap-1">
            <Skeleton className="h-3 w-14" />
            <Skeleton className="h-6 w-24" />
          </div>
          <div className="flex items-center gap-2 w-full">
            <Skeleton className="w-10 h-10 rounded-lg flex-shrink-0" />
            <Skeleton className="flex-1 h-10 rounded-lg" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl border border-gray-100 p-3.5 flex flex-col justify-between space-y-3">
      {/* Product Image Area Skeleton */}
      <Skeleton className="w-full aspect-square rounded-lg" />

      {/* Content Skeleton */}
      <div className="space-y-2 flex-1 flex flex-col justify-between">
        <div className="space-y-1.5">
          {/* Brand */}
          <Skeleton className="h-2.5 w-16" />
          {/* Title Lines */}
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-4/5" />
          {/* Spec Badges */}
          <div className="flex gap-1.5 pt-1">
            <Skeleton className="h-4 w-12 rounded" />
            <Skeleton className="h-4 w-14 rounded" />
            <Skeleton className="h-4 w-10 rounded" />
          </div>
          {/* Rating */}
          <div className="flex items-center gap-1.5 pt-1">
            <Skeleton className="h-3 w-20" />
            <Skeleton className="h-3 w-6" />
          </div>
        </div>

        {/* Pricing & Button Skeleton */}
        <div className="pt-2 border-t border-gray-50 flex items-center justify-between gap-2">
          <div className="space-y-1">
            <Skeleton className="h-2.5 w-12" />
            <Skeleton className="h-5 w-20" />
          </div>
          <Skeleton className="h-8 w-20 rounded-lg" />
        </div>
      </div>
    </div>
  );
};
