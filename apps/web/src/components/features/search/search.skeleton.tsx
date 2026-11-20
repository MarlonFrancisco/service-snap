'use client';

import { Footer, Header, MobileTabBar } from '@/components/layout';
import { Skeleton } from '@repo/ui';
import { ResultsListSkeleton } from './components';

const FILTER_CHIP_WIDTHS = ['w-[104px]', 'w-[120px]'];

function FilterChipsSkeleton() {
  return (
    <div className="flex gap-2 py-3 md:gap-2.5 md:py-3.5">
      {FILTER_CHIP_WIDTHS.map((width) => (
        <Skeleton
          key={width}
          className={`h-[38px] shrink-0 rounded-full md:h-10 ${width}`}
        />
      ))}
    </div>
  );
}

/** Mesma estrutura da busca enquanto os resultados carregam. */
export function SearchSkeleton() {
  return (
    <Header showSearchBar>
      <div
        role="status"
        aria-busy="true"
        className="flex min-h-[calc(100dvh-5rem)] flex-col md:min-h-[calc(100dvh-6rem)]"
      >
        <span className="sr-only">Carregando resultados</span>

        <div
          aria-hidden="true"
          className="sticky top-16 z-40 -mt-4 border-b border-line bg-white/97 px-5 pt-3 md:hidden"
        >
          <Skeleton className="h-12 w-full rounded-full" />
          <FilterChipsSkeleton />
        </div>

        <div
          aria-hidden="true"
          className="mx-auto hidden w-full max-w-[82.5rem] px-10 md:block"
        >
          <FilterChipsSkeleton />
        </div>

        <div
          aria-hidden="true"
          className="mx-auto w-full max-w-[82.5rem] flex-1 px-5 md:px-10 lg:pt-4"
        >
          <ResultsListSkeleton />
        </div>

        <Footer compact />
        <MobileTabBar />
      </div>
    </Header>
  );
}
