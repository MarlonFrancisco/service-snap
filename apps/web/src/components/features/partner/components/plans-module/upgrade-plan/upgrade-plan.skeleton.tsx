'use client';

import { Skeleton } from '@repo/ui';

const PLAN_SKELETON_COUNT = 4;

export function UpgradePlanSkeleton() {
  return (
    <div
      role="status"
      aria-label="Carregando planos"
      className="grid gap-[22px]"
    >
      <Skeleton className="h-12 w-full rounded-[14px]" />
      <Skeleton className="h-[54px] w-44 justify-self-center rounded-full" />

      <div className="grid grid-cols-[repeat(auto-fit,minmax(min(240px,100%),1fr))] gap-3.5">
        {Array.from({ length: PLAN_SKELETON_COUNT }).map((_, index) => (
          <Skeleton key={index} className="h-[28rem] rounded-[26px]" />
        ))}
      </div>

      <Skeleton className="h-16 w-full max-w-xl justify-self-center rounded-[14px]" />
      <Skeleton className="h-96 w-full rounded-[28px]" />
    </div>
  );
}
