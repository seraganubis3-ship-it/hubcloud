'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useStore } from '@/context/StoreContext';
import { Package, Layers, SlidersHorizontal, Boxes } from 'lucide-react';

export function CatalogNavTabs() {
  const pathname = usePathname();
  const { isRtl } = useStore();

  const tabs = [
    {
      name: 'Products Catalog',
      nameAr: 'كتالوج المنتجات',
      href: '/admin/products',
      icon: Package,
    },
    {
      name: 'Categories',
      nameAr: 'الأقسام والتصنيفات',
      href: '/admin/categories',
      icon: Layers,
    },
    {
      name: 'Attribute Engine',
      nameAr: 'محرك الخصائص والمواصفات',
      href: '/admin/attributes',
      icon: SlidersHorizontal,
    },
  ];

  return (
    <div className="flex items-center gap-1.5 p-1 bg-slate-900/90 border border-slate-800 rounded-xl overflow-x-auto scrollbar-none w-fit">
      {tabs.map((tab) => {
        const Icon = tab.icon;
        const isActive = pathname === tab.href;

        return (
          <Link
            key={tab.href}
            href={tab.href}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap transition-all ${
              isActive
                ? 'bg-blue-600 text-white shadow-xs'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/80'
            }`}
          >
            <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-white' : 'text-slate-400'}`} />
            <span>{isRtl ? tab.nameAr : tab.name}</span>
          </Link>
        );
      })}
    </div>
  );
}
