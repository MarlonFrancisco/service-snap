'use client';

import { Footer, Header } from '@/components/layout';
import { cn, Skeleton } from '@repo/ui';
import { PricingHero } from './components/pricing-hero';
import { PRICING_PLAN_COLUMNS_CLASS } from './pricing.constants';

const PLAN_PLACEHOLDERS = 4;

/** Cartões de plano enquanto a lista de preços chega. */
export const PricingPlansSkeleton = () => (
  <div
    aria-hidden="true"
    className={cn('grid gap-3.5 md:gap-4', PRICING_PLAN_COLUMNS_CLASS)}
  >
    {Array.from({ length: PLAN_PLACEHOLDERS }, (_, index) => (
      <div
        key={index}
        className={cn(
          'rounded-3xl border border-line-strong bg-white p-6 md:rounded-[1.625rem] md:p-7',
          index > 0 && 'max-md:hidden',
        )}
      >
        <Skeleton className="h-6 w-28" />
        <Skeleton className="mt-2 h-4 w-44 max-w-full" />
        <Skeleton className="mt-6 h-9 w-36" />
        <Skeleton className="mt-6 h-11 w-full rounded-full" />
        <div className="mt-6 space-y-3">
          {Array.from({ length: 5 }, (_, item) => (
            <Skeleton key={item} className="h-4 w-4/5" />
          ))}
        </div>
      </div>
    ))}
  </div>
);

/** Página de preços enquanto o servidor busca os planos. */
export const PricingSkeleton = () => (
  <Header>
    <main
      role="status"
      aria-busy="true"
      className="mx-auto w-full max-w-[82.5rem] px-5 pb-12 md:px-10 md:pb-[5.5rem]"
    >
      <span className="sr-only">Carregando planos</span>
      <PricingHero>
        <Skeleton className="mx-auto h-[54px] w-[11.5rem] rounded-full" />
      </PricingHero>
      <div className="mt-8 md:mt-11">
        <PricingPlansSkeleton />
      </div>
    </main>
    <Footer />
  </Header>
);
