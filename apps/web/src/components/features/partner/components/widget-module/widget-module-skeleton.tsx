'use client';

import { Skeleton } from '@repo/ui';
import { MODULE_CARD_CLASS } from '../notifications-module/notifications-module.styles';

export const WidgetModuleSkeleton = () => (
  <div
    role="status"
    aria-label="Carregando o widget do site"
    className="grid gap-4"
  >
    <div className="grid gap-2">
      <Skeleton className="h-7 w-72 max-w-full rounded-[14px]" />
      <Skeleton className="h-4 w-full max-w-[620px] rounded-[14px]" />
    </div>

    <div className="grid grid-cols-[repeat(auto-fit,minmax(min(340px,100%),1fr))] gap-4">
      <div className={MODULE_CARD_CLASS}>
        <Skeleton className="h-5 w-44 rounded-[14px]" />
        <Skeleton className="h-[50px] w-full max-w-[360px] rounded-[14px]" />
        <Skeleton className="h-11 w-52 rounded-full" />
        <Skeleton className="h-10 w-64 rounded-full" />
      </div>
      <div className={MODULE_CARD_CLASS}>
        <Skeleton className="h-5 w-24 rounded-[14px]" />
        <Skeleton className="h-[220px] w-full rounded-[18px]" />
      </div>
    </div>

    <div className={MODULE_CARD_CLASS}>
      <Skeleton className="h-5 w-52 rounded-[14px]" />
      <Skeleton className="h-24 w-full rounded-[14px]" />
    </div>
  </div>
);
