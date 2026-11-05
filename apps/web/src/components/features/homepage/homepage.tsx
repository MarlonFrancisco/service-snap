import {
  Footer,
  HEADER_OFFSET_BARE_CLASS,
  MarketplaceHeader,
  MobileTabBar,
} from '@/components/layout';
import { plusJakartaSans } from '@/utils/fonts/plus-jakarta-sans';
import { cn } from '@repo/ui';
import { CategoryTabs } from './components/category-tabs';
import { DiscoverySearch } from './components/discovery-search';
import { ExperienceRows } from './components/experience-rows';
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
        {/* Sem Suspense: as vitrines vêm no HTML inicial. Com streaming, o
            esqueleto sumia quando não havia lojas e empurrava o resto (CLS). */}
        <ExperienceRows />
        <PartnerBanner />
      </main>
      <Footer />
      <MobileTabBar />
    </div>
  );
};
