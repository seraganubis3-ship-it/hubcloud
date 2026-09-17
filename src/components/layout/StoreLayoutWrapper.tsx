'use client';

import React from 'react';
import { usePathname } from 'next/navigation';
import { TopUtilityBar } from '@/components/layout/TopUtilityBar';
import { MainHeader } from '@/components/layout/MainHeader';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { FloatingChat } from '@/components/layout/FloatingChat';
import { ToastNotification } from '@/components/ui/ToastNotification';
import { TopProgressBar } from '@/components/ui/TopProgressBar';
import { Suspense } from 'react';

export const StoreLayoutWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const pathname = usePathname();
  const isAdmin = pathname?.startsWith('/admin');

  if (isAdmin) {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-100 font-sans">
        <Suspense fallback={null}>
          <TopProgressBar />
        </Suspense>
        {children}
        <ToastNotification />
      </div>
    );
  }

  return (
    <>
      <Suspense fallback={null}>
        <TopProgressBar />
      </Suspense>
      <TopUtilityBar />
      <MainHeader />
      <Navbar />
      
      <main className="flex-1">
        {children}
      </main>

      <Footer />
      <FloatingChat />
      <ToastNotification />
    </>
  );
};
