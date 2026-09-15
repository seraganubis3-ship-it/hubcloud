import React from 'react';

export default function Loading() {
  return (
    <div className="max-w-7xl mx-auto px-4 py-8 space-y-6 animate-pulse">
      {/* Hero / Banner Skeleton */}
      <div className="w-full h-64 sm:h-96 bg-gray-200/80 rounded-2xl" />

      {/* Grid Skeleton */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-5 gap-4">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="bg-white p-4 rounded-2xl border border-gray-100 space-y-3">
            <div className="w-full aspect-square bg-gray-200/70 rounded-xl" />
            <div className="h-4 bg-gray-200/70 rounded w-3/4" />
            <div className="h-3 bg-gray-200/70 rounded w-1/2" />
            <div className="h-5 bg-gray-200/70 rounded w-2/3" />
          </div>
        ))}
      </div>
    </div>
  );
}
