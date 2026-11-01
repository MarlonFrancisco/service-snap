'use client';

import { Skeleton } from '@repo/ui';

function StoreCardSkeleton() {
  return (
    <div className="space-y-3">
      <Skeleton className="aspect-[4/3] w-full rounded-[20px] bg-[#EBE9F0] md:aspect-square md:rounded-[22px]" />

      <div className="space-y-2">
        <div className="flex items-start justify-between gap-2">
          <Skeleton className="h-5 w-3/4 bg-[#EBE9F0]" />
          <Skeleton className="h-4 w-12 bg-[#EBE9F0]" />
        </div>

        <Skeleton className="h-4 w-1/2 bg-[#EBE9F0]" />
        <Skeleton className="h-4 w-2/3 bg-[#EBE9F0]" />
        <Skeleton className="h-5 w-24 bg-[#EBE9F0]" />
      </div>
    </div>
  );
}

export function ResultsListSkeleton() {
  return (
    <div className="pt-6 lg:pt-0">
      <div className="mb-5 space-y-2 md:mb-6">
        <Skeleton className="h-4 w-24 bg-[#EBE9F0]" />
        <Skeleton className="h-8 w-72 max-w-full bg-[#EBE9F0]" />
      </div>

      <div className="grid grid-cols-1 gap-x-6 gap-y-8 sm:grid-cols-2 md:gap-y-9 xl:grid-cols-3">
        {Array.from({ length: 6 }).map((_, index) => (
          <StoreCardSkeleton key={index} />
        ))}
      </div>
    </div>
  );
}
