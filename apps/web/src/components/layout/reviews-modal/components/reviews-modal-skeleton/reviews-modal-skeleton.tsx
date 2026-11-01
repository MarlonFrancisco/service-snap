import { Skeleton } from '@repo/ui';
import { REVIEWS_SCROLL_AREA_CLASS } from '../../reviews-modal.styles';
import { useReviewsModalSkeleton } from './reviews-modal-skeleton.hook';

export function SkeletonRatingBar() {
  return (
    <div className="mb-2 grid grid-cols-[16px_1fr_38px] items-center gap-2.5">
      <Skeleton className="h-4 w-4" />
      <Skeleton className="h-2 rounded-full" />
      <Skeleton className="h-4 w-[38px]" />
    </div>
  );
}

export function SkeletonReviewCard() {
  return (
    <div className="grid grid-cols-[44px_1fr] gap-3 rounded-[14px] bg-[#F7F6FA] p-3.5">
      <Skeleton className="size-11 rounded-full" />

      <div className="min-w-0 space-y-2">
        <div className="flex justify-between gap-3">
          <Skeleton className="h-4 w-32" />
          <Skeleton className="h-4 w-16" />
        </div>
        <Skeleton className="h-3 w-24" />
        <Skeleton className="h-4 w-4/5" />
      </div>
    </div>
  );
}

export function ReviewsModalSkeleton() {
  const { skeletonItems } = useReviewsModalSkeleton();

  return (
    <div aria-busy="true" className={REVIEWS_SCROLL_AREA_CLASS}>
      <Skeleton className="h-8 w-64 max-w-[calc(100%-3rem)]" />
      <Skeleton className="mt-2.5 h-4 w-48" />

      <div className="mt-6 grid grid-cols-1 gap-6 border-b border-[#EBE9F0] pb-6 md:grid-cols-2 md:gap-8">
        <div>
          <Skeleton className="mb-3 h-4 w-28" />
          {skeletonItems.ratingBars.map((i) => (
            <SkeletonRatingBar key={i} />
          ))}
        </div>

        <div>
          <Skeleton className="mb-3 h-4 w-48" />
          <Skeleton className="mb-2 h-4 w-full" />
          <Skeleton className="mb-3.5 h-4 w-3/4" />
          <Skeleton className="h-12 w-full rounded-full md:w-56" />
        </div>
      </div>

      <Skeleton className="mt-6 mb-3 h-4 w-40" />
      <div className="grid gap-2.5">
        {skeletonItems.reviewCards.map((i) => (
          <SkeletonReviewCard key={i} />
        ))}
      </div>
    </div>
  );
}
