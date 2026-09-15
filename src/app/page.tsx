import React from 'react';
import { HeroSection } from '@/components/home/HeroSection';
import { CategoryGrid } from '@/components/home/CategoryGrid';
import { DealsSection } from '@/components/home/DealsSection';
import { PromoTriBanner } from '@/components/home/PromoTriBanner';
import { BestSellersSection } from '@/components/home/BestSellersSection';
import { BrandRow } from '@/components/home/BrandRow';
import { TrustBadgesRow } from '@/components/home/TrustBadgesRow';

export default function HomePage() {
  return (
    <div className="space-y-4 sm:space-y-6 pb-6">
      {/* 1. Hero Section (Widescreen Banner Slider + Dual Side Promo Cards) */}
      <HeroSection />

      {/* 2. Shop by Category (Mobile Circular Strip / Desktop Grid) */}
      <CategoryGrid />

      {/* 3. Today's Deals with Countdown & Discount Badges */}
      <DealsSection />

      {/* 4. Visual Triple Promotional Banners (Desktops, Scanners, Networking) */}
      <PromoTriBanner />

      {/* 5. Best Sellers Catalog */}
      <BestSellersSection />

      {/* 6. Official Brand Partners Strip */}
      <BrandRow />

      {/* 8. Trust & Guarantee Badges Strip */}
      <TrustBadgesRow />
    </div>
  );
}
