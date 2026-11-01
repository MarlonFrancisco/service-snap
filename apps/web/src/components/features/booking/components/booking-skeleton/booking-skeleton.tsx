import { HEADER_STICKY_TOP_CLASS } from '@/components/layout';
import { cn, Skeleton } from '@repo/ui';

/** Espelha o layout da etapa de serviços, a primeira exibida ao abrir a página. */
export function BookingSkeleton() {
  return (
    <div className="flex min-h-[calc(100dvh-5rem)] flex-col md:min-h-[calc(100dvh-6rem)]">
      <BusinessShowcaseSkeleton />

      <div className="mx-auto w-full max-w-[82.5rem] px-5 pb-5 md:px-10 md:pb-0">
        <div className="grid grid-cols-1 gap-10 pt-4 md:pt-8 lg:grid-cols-[minmax(0,1fr)_420px]">
          <div className="min-w-0">
            <BusinessInfoSkeleton />
            <StepIndicatorSkeleton />
            <StepContentSkeleton />
          </div>

          <div className="hidden md:block">
            <BookingSidebarSkeleton />
          </div>
        </div>
      </div>

      {/* Barra inferior do mobile */}
      <div className="sticky bottom-0 z-20 mt-auto border-t border-[#EBE9F0] bg-white px-5 pt-2.5 pb-[calc(12px+env(safe-area-inset-bottom,0px))] md:hidden">
        <div className="flex min-h-11 flex-col justify-center gap-1.5">
          <Skeleton className="h-3 w-24" />
          <Skeleton className="h-5 w-32" />
        </div>
        <Skeleton className="mt-1.5 h-[54px] w-full rounded-full" />
      </div>
    </div>
  );
}

function BusinessShowcaseSkeleton() {
  return (
    <div className="mx-auto -mt-4 w-full max-w-[82.5rem] md:mt-0 md:px-10">
      <div className="flex flex-col">
        <div className="order-2 flex flex-wrap items-end justify-between gap-6 px-5 pt-5 md:order-1 md:px-0 md:pt-4">
          <div className="space-y-2.5">
            <Skeleton className="h-8 w-64 md:h-10 md:w-96" />
            <Skeleton className="h-4 w-56" />
          </div>
          <div className="hidden gap-2.5 md:flex">
            <Skeleton className="h-11 w-32 rounded-full" />
            <Skeleton className="h-11 w-24 rounded-full" />
          </div>
        </div>

        {/* Galeria: grade no desktop, foto de ponta a ponta no mobile */}
        <div className="order-1 md:order-2 md:mt-6">
          <div className="hidden grid-cols-[2fr_1fr_1fr] grid-rows-[220px_220px] gap-2 overflow-hidden rounded-[28px] md:grid">
            <Skeleton className="row-span-2 h-full w-full rounded-none" />
            {Array.from({ length: 4 }).map((_, index) => (
              <Skeleton key={index} className="h-full w-full rounded-none" />
            ))}
          </div>
          <Skeleton className="aspect-[4/3] w-full rounded-none md:hidden" />
        </div>
      </div>
    </div>
  );
}

function BusinessInfoSkeleton() {
  return (
    <div>
      <div className="space-y-2">
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-3/4" />
      </div>

      <div className="mt-3.5 flex gap-2 overflow-hidden md:mt-4 md:flex-wrap">
        {Array.from({ length: 4 }).map((_, index) => (
          <Skeleton key={index} className="h-8 w-24 shrink-0 rounded-full" />
        ))}
      </div>

      <div className="mt-[18px] grid gap-4 border-y border-[#EBE9F0] py-4 md:mt-6 md:grid-cols-3 md:gap-6 md:py-5">
        {Array.from({ length: 3 }).map((_, index) => (
          <div key={index} className="space-y-2">
            <Skeleton className="h-3 w-16" />
            <Skeleton className="h-4 w-full" />
          </div>
        ))}
      </div>
    </div>
  );
}

function StepIndicatorSkeleton() {
  return (
    <div className="mt-7 mb-1.5 md:mt-9 md:mb-7">
      <Skeleton className="h-4 w-full md:hidden" />
      <div className="hidden gap-2 md:flex">
        {Array.from({ length: 4 }).map((_, index) => (
          <div
            key={index}
            className="flex flex-1 items-center gap-2.5 border-t-[3px] border-[#EBE9F0] pt-3"
          >
            <Skeleton className="h-[26px] w-[26px] shrink-0 rounded-full" />
            <Skeleton className="h-3.5 w-20" />
          </div>
        ))}
      </div>
    </div>
  );
}

function StepContentSkeleton() {
  return (
    <div>
      <Skeleton className="mt-1.5 h-7 w-56 md:mt-0 md:h-8" />
      <Skeleton className="mt-2 h-4 w-72 max-w-full" />

      <div className="mt-4 mb-1 flex gap-2 md:mt-5 md:mb-2">
        <Skeleton className="h-11 w-20 rounded-full" />
        <Skeleton className="h-11 w-24 rounded-full" />
      </div>

      {Array.from({ length: 3 }).map((_, index) => (
        <div
          key={index}
          className="flex items-center justify-between gap-4 border-b border-[#EBE9F0] py-[18px] md:gap-6 md:py-5"
        >
          <div className="min-w-0 flex-1 space-y-2">
            <Skeleton className="h-4 w-40" />
            <Skeleton className="h-3.5 w-56 max-w-full" />
            <Skeleton className="h-3.5 w-28" />
          </div>
          <Skeleton className="h-11 w-24 shrink-0 rounded-full" />
        </div>
      ))}
    </div>
  );
}

function BookingSidebarSkeleton() {
  return (
    <div
      className={cn(
        'rounded-[28px] bg-white p-7 shadow-[0_12px_40px_rgba(15,12,30,0.1)] lg:sticky',
        HEADER_STICKY_TOP_CLASS,
      )}
    >
      <Skeleton className="h-6 w-48" />
      <Skeleton className="mt-2 h-4 w-40" />

      <div className="mt-5 border-t border-[#F0EEF4] pt-5">
        <Skeleton className="h-4 w-full" />
      </div>

      <div className="mt-5 flex items-baseline justify-between border-t border-[#F0EEF4] pt-5">
        <Skeleton className="h-4 w-14" />
        <Skeleton className="h-7 w-28" />
      </div>
      <Skeleton className="mt-5 h-[54px] w-full rounded-full" />
    </div>
  );
}
