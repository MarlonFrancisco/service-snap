'use client';

import { Skeleton } from '@repo/ui';
import { MODULE_CARD_CLASS } from '../notifications-module/notifications-module.styles';

const FIELD_SKELETON_COUNT = 3;

export const WhatsappSettingsModuleSkeleton = () => {
  return (
    <div
      role="status"
      aria-label="Carregando configurações do WhatsApp"
      className="grid max-w-[960px] gap-4"
    >
      <div className="grid gap-2">
        <Skeleton className="h-7 w-40 rounded-[14px]" />
        <Skeleton className="h-4 w-full max-w-[620px] rounded-[14px]" />
      </div>

      <div className={MODULE_CARD_CLASS}>
        <Skeleton className="h-5 w-44 rounded-[14px]" />
        <Skeleton className="h-11 w-full rounded-[14px]" />
      </div>

      <div className={MODULE_CARD_CLASS}>
        <Skeleton className="h-5 w-36 rounded-[14px]" />
        <Skeleton className="h-[50px] w-full rounded-[14px]" />
      </div>

      <div className={MODULE_CARD_CLASS}>
        <Skeleton className="h-5 w-52 rounded-[14px]" />
        {Array.from({ length: FIELD_SKELETON_COUNT }).map((_, index) => (
          <Skeleton key={index} className="h-[50px] w-full rounded-[14px]" />
        ))}
      </div>
    </div>
  );
};
