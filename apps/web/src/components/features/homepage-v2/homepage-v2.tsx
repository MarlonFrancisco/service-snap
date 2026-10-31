'use client';

import { Footer } from '@/components/layout';
import { CategoryRail } from './components/category-rail';
import { DiscoverySearch } from './components/discovery-search';
import { ExperienceRows } from './components/experience-rows';
import { MarketplaceHeader } from './components/marketplace-header';
import { PartnerBanner } from './components/partner-banner';

export const HomepageV2 = () => {
  return (
    <div className="min-h-screen bg-[#FAFAFA] text-[#0A0A0A] antialiased">
      <MarketplaceHeader />
      <main className="min-h-[calc(100vh-80px)] bg-[#FAFAFA] pt-20">
        <CategoryRail />
        <DiscoverySearch />
        <ExperienceRows />
        <PartnerBanner />
      </main>
      <Footer />
    </div>
  );
};
