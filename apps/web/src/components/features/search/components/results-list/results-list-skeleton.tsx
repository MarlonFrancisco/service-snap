'use client';

import { Skeleton } from '@repo/ui';

function StoreCardSkeleton() {
  return (
    <div className="space-y-3">
      <Skeleton className="aspect-square w-full rounded-2xl bg-[#F4F4F5]" />

      <div className="space-y-2">
        <div className="flex items-start justify-between gap-2">
          <Skeleton className="h-5 w-3/4 bg-[#F4F4F5]" />
          <Skeleton className="h-4 w-12 bg-[#F4F4F5]" />
        </div>

        <Skeleton className="h-4 w-1/2 bg-[#F4F4F5]" />
        <Skeleton className="h-4 w-2/3 bg-[#F4F4F5]" />
        <Skeleton className="h-5 w-24 bg-[#F4F4F5]" />
      </div>
    </div>
  );
}

export function ResultsListSkeleton() {
  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <Skeleton className="h-4 w-24 bg-[#F4F4F5]" />
        <Skeleton className="h-8 w-72 bg-[#F4F4F5]" />
      </div>

      <div className="grid grid-cols-1 gap-x-6 gap-y-8 sm:grid-cols-2 sm:gap-y-10 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, index) => (
          <StoreCardSkeleton key={index} />
        ))}
      </div>
    </div>
  );
}
