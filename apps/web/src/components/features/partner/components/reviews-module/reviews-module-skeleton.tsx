'use client';

import { Skeleton } from '@repo/ui';
import { REVIEWS_SUMMARY_CARD_CLASS } from './reviews-module.styles';

const SUMMARY_SKELETON_COUNT = 3;
const REVIEW_SKELETON_COUNT = 3;

export const ReviewsModuleSkeleton = () => (
  <div role="status" aria-label="Carregando avaliações" className="grid gap-4">
    <div className="grid gap-2">
      <Skeleton className="h-7 w-64 max-w-full rounded-[14px]" />
      <Skeleton className="h-4 w-full max-w-[560px] rounded-[14px]" />
    </div>

    <div className="flex flex-wrap gap-3">
      {Array.from({ length: SUMMARY_SKELETON_COUNT }).map((_, index) => (
        <div key={index} className={REVIEWS_SUMMARY_CARD_CLASS}>
          <Skeleton className="h-3 w-20 rounded-[14px]" />
          <Skeleton className="mt-2 h-7 w-16 rounded-[14px]" />
        </div>
      ))}
    </div>

    <Skeleton className="h-11 w-full max-w-[360px] rounded-full" />

    <div className="overflow-hidden rounded-[22px] border border-[#EBE9F0]">
      {Array.from({ length: REVIEW_SKELETON_COUNT }).map((_, index) => (
        <div
          key={index}
          className="grid gap-2 border-b border-[#F0EEF4] px-5 py-[18px] last:border-0"
        >
          <div className="flex justify-between gap-2">
            <Skeleton className="h-4 w-32 rounded-[14px]" />
            <Skeleton className="h-4 w-20 rounded-[14px]" />
          </div>
          <Skeleton className="h-3.5 w-24 rounded-[14px]" />
          <Skeleton className="h-3.5 w-56 max-w-full rounded-[14px]" />
          <Skeleton className="h-4 w-4/5 rounded-[14px]" />
        </div>
      ))}
    </div>
  </div>
);
