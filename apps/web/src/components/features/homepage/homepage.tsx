import {
  Footer,
  HEADER_OFFSET_CLASS,
  MarketplaceHeader,
} from '@/components/layout';
import { cn } from '@repo/ui';
import { Suspense } from 'react';
import { DiscoverySearch } from './components/discovery-search';
import { ExperienceRows } from './components/experience-rows';
import { ExperienceRowsSkeleton } from './components/experience-rows/experience-rows-skeleton';
import { PartnerBanner } from './components/partner-banner';

export const Homepage = () => {
  return (
    <div className="min-h-screen bg-[#FAFAFA] font-[family-name:var(--font-mona-sans)] text-[#0A0A0A] antialiased">
      <MarketplaceHeader />
      <main className={cn('min-h-screen bg-[#FAFAFA]', HEADER_OFFSET_CLASS)}>
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
