import { Footer } from '@/components/layout';
import { Suspense } from 'react';
import { CategoryRail } from './components/category-rail';
import { DiscoverySearch } from './components/discovery-search';
import { ExperienceRows } from './components/experience-rows';
import { ExperienceRowsSkeleton } from './components/experience-rows/experience-rows-skeleton';
import { MarketplaceHeader } from './components/marketplace-header';
import { PartnerBanner } from './components/partner-banner';

export const Homepage = () => {
  return (
    <div className="min-h-screen bg-[#FAFAFA] font-[family-name:var(--font-mona-sans)] text-[#0A0A0A] antialiased">
      <MarketplaceHeader />
      <main className="min-h-[calc(100vh-80px)] bg-[#FAFAFA] pt-20">
        <CategoryRail />
        <DiscoverySearch />
        <Suspense fallback={<ExperienceRowsSkeleton />}>
          <ExperienceRows />
        </Suspense>
        <PartnerBanner />
      </main>
      <Footer />
    </div>
  );
};
