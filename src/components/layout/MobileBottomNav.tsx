'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useStore } from '@/context/StoreContext';
import { Home, LayoutGrid, Tag, ShoppingCart, User } from 'lucide-react';

export const MobileBottomNav: React.FC = () => {
  const pathname = usePathname();
  const { isRtl, cartCount } = useStore();

  const navs = [
    { name: 'Home', nameAr: 'الرئيسية', href: '/', icon: Home },
    { name: 'Categories', nameAr: 'الأقسام', href: '/products', icon: LayoutGrid },
    { name: 'Deals', nameAr: 'العروض', href: '/deals', icon: Tag },
    { name: 'Cart', nameAr: 'السلة', href: '/cart', icon: ShoppingCart, badge: cartCount },
    { name: 'Account', nameAr: 'حسابي', href: '/account', icon: User },
  ];

  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-gray-200 px-3 pt-2 pb-[max(0.5rem,env(safe-area-inset-bottom))] shadow-[0_-4px_20px_rgba(0,0,0,0.08)]">
      <div className="flex items-center justify-around">
        {navs.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href;

          return (
            <Link
              key={item.name}
              href={item.href}
              className={`flex flex-col items-center justify-center p-1 rounded-xl transition-all relative ${
                isActive
                  ? 'text-blue-600 font-black'
                  : 'text-gray-500 hover:text-gray-900 font-medium'
              }`}
            >
              <div className="relative">
                <Icon className={`w-5 h-5 ${isActive ? 'stroke-[2.5] text-blue-600' : 'text-gray-500'}`} />
                {item.badge && item.badge > 0 ? (
                  <span className="absolute -top-1.5 -right-2.5 bg-blue-600 text-white text-[9px] font-black w-4 h-4 rounded-full flex items-center justify-center border-2 border-white shadow-2xs">
                    {item.badge}
                  </span>
                ) : null}
              </div>
              <span className="text-[10px] mt-1 tracking-tight">
                {isRtl ? item.nameAr : item.name}
              </span>
            </Link>
          );
        })}
      </div>
    </div>
  );
};
