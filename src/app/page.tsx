import React from 'react';
import { HeroSection } from '@/components/home/HeroSection';
import { CategoryGrid } from '@/components/home/CategoryGrid';
import { DealsSection } from '@/components/home/DealsSection';
import { BestSellersSection } from '@/components/home/BestSellersSection';
import { BrandRow } from '@/components/home/BrandRow';
import { TrustBadgesRow } from '@/components/home/TrustBadgesRow';

import { ConsultationStrip } from '@/components/home/ConsultationStrip';
import { PromoBanners } from '@/components/home/PromoBanners';
import { OurClientsSection } from '@/components/home/OurClientsSection';

export default function HomePage() {
  return (
    <div className="space-y-4 sm:space-y-6 pb-16 sm:pb-20 overflow-x-hidden w-full max-w-full">
      {/* 1. Hero Section (Widescreen Banner Slider) */}
      <HeroSection />

      {/* 2. Trust & Guarantee Badges Strip */}
      <TrustBadgesRow />

      {/* 3. Shop by Category (Mobile Circular Strip / Desktop Grid) */}
      <CategoryGrid />

      {/* 4. Official Brand Partners Strip */}
      <BrandRow />

      {/* 5. Our Valued Corporate Clients & Success Partners */}
      <OurClientsSection />

      {/* 6. Today's Deals with Countdown & Discount Badges */}
      <DealsSection />

      {/* 7. Simple & Beautiful Promotional Banners */}
      <PromoBanners />

      {/* 8. Best Sellers Catalog */}
      <BestSellersSection />

      {/* 9. Corporate Solutions & IT Consultation Transition Banner */}
      <ConsultationStrip />
    </div>
  );
}
