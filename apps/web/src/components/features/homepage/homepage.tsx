import {
  Footer,
  HEADER_OFFSET_BARE_CLASS,
  MarketplaceHeader,
  MobileTabBar,
} from '@/components/layout';
import { plusJakartaSans } from '@/utils/fonts/plus-jakarta-sans';
import { cn } from '@repo/ui';
import { Suspense } from 'react';
import { CategoryTabs } from './components/category-tabs';
import { DiscoverySearch } from './components/discovery-search';
import { ExperienceRows } from './components/experience-rows';
import { ExperienceRowsSkeleton } from './components/experience-rows/experience-rows-skeleton';
import { PartnerBanner } from './components/partner-banner';

export const Homepage = () => {
  return (
    <div
      className={cn(
        plusJakartaSans.className,
        'min-h-screen bg-white text-[#0B0B0F] antialiased',
      )}
    >
      <MarketplaceHeader compactSearch />
      <main className={cn('pb-12 md:pb-20', HEADER_OFFSET_BARE_CLASS)}>
        <DiscoverySearch />
        <CategoryTabs />
        <Suspense fallback={<ExperienceRowsSkeleton />}>
          <ExperienceRows />
        </Suspense>
        <PartnerBanner />
      </main>
      <Footer />
      <MobileTabBar />
    </div>
  );
};
