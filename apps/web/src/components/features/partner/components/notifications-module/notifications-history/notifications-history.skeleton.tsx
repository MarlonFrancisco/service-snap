'use client';

import { Skeleton } from '@repo/ui';

const SKELETON_ROWS = 4;

export function NotificationsHistorySkeleton({
  rows = SKELETON_ROWS,
}: {
  rows?: number;
}) {
  return (
    <div
      role="status"
      aria-label="Carregando notificações"
      className="overflow-hidden rounded-[22px] border border-[#EBE9F0]"
    >
      {Array.from({ length: rows }).map((_, index) => (
        <div
          key={`notification-skeleton-${index}`}
          className="flex flex-wrap justify-between gap-3 border-b border-[#F0EEF4] px-5 py-4 last:border-0"
        >
          <div className="grid min-w-0 flex-1 gap-2">
            <Skeleton className="h-4 w-1/3 rounded-[14px]" />
            <Skeleton className="h-3.5 w-2/3 rounded-[14px]" />
            <Skeleton className="h-3.5 w-1/2 rounded-[14px]" />
          </div>
          <div className="flex gap-1.5">
            <Skeleton className="h-11 w-36 rounded-full" />
            <Skeleton className="h-11 w-20 rounded-full" />
          </div>
        </div>
      ))}
    </div>
  );
}
