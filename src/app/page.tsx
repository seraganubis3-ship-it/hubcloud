import React from 'react';
import { HeroSection } from '@/components/home/HeroSection';
import { CategoryGrid } from '@/components/home/CategoryGrid';
import { DealsSection } from '@/components/home/DealsSection';
import { BestSellersSection } from '@/components/home/BestSellersSection';
import { BrandRow } from '@/components/home/BrandRow';
import { TrustBadgesRow } from '@/components/home/TrustBadgesRow';
import { OurClientsSection } from '@/components/home/OurClientsSection';
import { PromoBanners } from '@/components/home/PromoBanners';

export default function HomePage() {
  return (
    <div className="space-y-4 sm:space-y-6 pb-16 sm:pb-20 overflow-x-hidden w-full max-w-full">
      {/* 1. Hero Section (Widescreen Banner Slider) */}
      <HeroSection />

      {/* 2. Trust & Guarantee Badges Strip */}
      <TrustBadgesRow />

      {/* 3. Shop by Category (Mobile Circular Strip / Desktop Grid) */}
      <CategoryGrid />

      {/* 4. Today's Deals with Countdown & Discount Badges */}
      <DealsSection />

      {/* 5. Best Sellers Catalog */}
      <BestSellersSection />

      {/* 6. Official Brand Partners Strip */}
      <BrandRow />

      {/* 7. Our Valued Corporate Clients & Success Partners */}
      <OurClientsSection />

      {/* 8. Hubcloud Official Security & Cloud Solutions Closing Banner */}
      <PromoBanners />
    </div>
  );
}

