import { Skeleton } from '@repo/ui';

export function SkeletonTimeSlots() {
  return (
    <div>
      <Skeleton className="mb-3 h-5 w-56 max-w-full" />
      <Skeleton className="mb-2 h-3.5 w-16" />
      <div className="grid grid-cols-3 gap-2">
        {Array.from({ length: 9 }).map((_, i) => (
          <Skeleton key={i} className="h-12 w-full rounded-full" />
        ))}
      </div>
    </div>
  );
}
