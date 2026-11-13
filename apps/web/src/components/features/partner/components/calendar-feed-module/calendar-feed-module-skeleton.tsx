'use client';

import { Skeleton } from '@repo/ui';
import { MODULE_CARD_CLASS } from '../notifications-module/notifications-module.styles';

export const CalendarFeedModuleSkeleton = () => (
  <div
    role="status"
    aria-label="Carregando o link da agenda"
    className="grid gap-4"
  >
    <div className="flex flex-wrap items-center justify-between gap-3">
      <div className="grid w-full max-w-[620px] gap-2">
        <Skeleton className="h-7 w-72 max-w-full rounded-[14px]" />
        <Skeleton className="h-4 w-full rounded-[14px]" />
      </div>
      <Skeleton className="h-11 w-52 rounded-full" />
    </div>

    <div className={MODULE_CARD_CLASS}>
      <Skeleton className="h-5 w-36 rounded-[14px]" />
      <Skeleton className="h-4 w-full max-w-[520px] rounded-[14px]" />
      <Skeleton className="h-11 w-full rounded-full" />
    </div>

    <div className={MODULE_CARD_CLASS}>
      <Skeleton className="h-5 w-40 rounded-[14px]" />
      <Skeleton className="h-10 w-72 max-w-full rounded-full" />
      <Skeleton className="h-16 w-full rounded-[14px]" />
    </div>
  </div>
);
