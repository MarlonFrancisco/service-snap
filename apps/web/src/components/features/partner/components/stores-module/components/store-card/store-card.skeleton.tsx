import { cn, Skeleton } from '@repo/ui';

const BONE_CLASS = 'rounded-[14px] bg-[#EBE9F0]';
const ACTION_BONE_CLASS = 'h-11 rounded-full bg-[#EBE9F0]';

export const StoreCardSkeleton = () => (
  <div
    aria-hidden="true"
    className="grid overflow-hidden rounded-[28px] shadow-[0_12px_40px_rgba(15,12,30,0.1)] md:grid-cols-[minmax(0,320px)_minmax(0,1fr)]"
  >
    <Skeleton className="min-h-[220px] rounded-none bg-[#F4F3F7] md:min-h-[280px]" />

    <div className="grid content-start gap-4 p-5 md:p-[26px]">
      <div className="grid gap-2">
        <Skeleton className={cn(BONE_CLASS, 'h-7 w-3/5')} />
        <Skeleton className={cn(BONE_CLASS, 'h-4 w-4/5')} />
      </div>
      <div className="grid grid-cols-[repeat(auto-fit,minmax(min(170px,100%),1fr))] gap-3.5">
        <Skeleton className={cn(BONE_CLASS, 'h-11')} />
        <Skeleton className={cn(BONE_CLASS, 'h-11')} />
        <Skeleton className={cn(BONE_CLASS, 'h-11')} />
      </div>
      <Skeleton className={cn(BONE_CLASS, 'h-[60px]')} />
      <div className="flex flex-wrap gap-2">
        <Skeleton className={cn(ACTION_BONE_CLASS, 'w-20')} />
        <Skeleton className={cn(ACTION_BONE_CLASS, 'w-20')} />
        <Skeleton className={cn(ACTION_BONE_CLASS, 'w-28')} />
      </div>
    </div>
  </div>
);
