import { cn } from '@repo/ui';
import { useStarRating } from './star-rating.hook';
import type { TStarRatingConfig } from './star-rating.types';

export const StarRating = ({ rating, size = 'default' }: TStarRatingConfig) => {
  const { stars, label, sizeClassName } = useStarRating({ rating, size });

  return (
    <span
      role="img"
      aria-label={label}
      className={cn(
        'block font-bold tracking-[2px] text-[#B45309]',
        sizeClassName,
      )}
    >
      {stars}
    </span>
  );
};
