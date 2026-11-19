'use client';

import { plusJakartaSans } from '@/utils/fonts/plus-jakarta-sans';
import { cn, Skeleton } from '@repo/ui';
import { OnboardingHeader } from './components/onboarding-header';

/** Etapa do onboarding enquanto o servidor busca o progresso salvo. */
export const PartnerOnboardingSkeleton = () => (
  <div
    role="status"
    aria-busy="true"
    className={cn(
      plusJakartaSans.className,
      'flex min-h-dvh flex-col bg-white text-ink',
    )}
  >
    <span className="sr-only">Carregando seu progresso</span>
    <div inert>
      <OnboardingHeader />
    </div>

    <main
      aria-hidden="true"
      className="mx-auto w-full max-w-[688px] flex-1 px-5 pt-[22px] pb-7 md:px-6 md:pt-7 md:pb-9"
    >
      <Skeleton className="h-4 w-24" />
      <Skeleton className="mt-2 h-1 w-full rounded-full" />
      <Skeleton className="mt-[18px] h-8 w-72 max-w-full md:mt-[22px] md:h-9" />
      <Skeleton className="mt-2 mb-[18px] h-4 w-96 max-w-full md:mb-[22px]" />

      <div className="space-y-4">
        {Array.from({ length: 3 }, (_, index) => (
          <div key={index}>
            <Skeleton className="h-4 w-28" />
            <Skeleton className="mt-[7px] h-[52px] w-full rounded-full" />
          </div>
        ))}
      </div>
    </main>

    <footer
      aria-hidden="true"
      className="sticky bottom-0 flex items-center justify-between gap-2.5 border-t border-line bg-white/97 px-5 pt-3 pb-[calc(12px+env(safe-area-inset-bottom,0px))] md:px-8 md:py-3.5"
    >
      <Skeleton className="h-11 w-24 rounded-full" />
      <Skeleton className="h-11 w-36 rounded-full" />
    </footer>
  </div>
);
