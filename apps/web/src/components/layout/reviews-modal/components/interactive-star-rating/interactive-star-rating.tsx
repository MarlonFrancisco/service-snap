import { cn } from '@repo/ui';
import { Star } from 'lucide-react';
import { REVIEWS_FOCUS_RING_CLASS } from '../../reviews-modal.styles';
import { useInteractiveStarRating } from './interactive-star-rating.hook';
import type { TInteractiveStarRatingConfig } from './interactive-star-rating.types';

export const InteractiveStarRating = ({
  rating,
  onChange,
}: TInteractiveStarRatingConfig) => {
  const {
    stars,
    handleStarClick,
    handleMouseEnter,
    handleMouseLeave,
    getStarClassName,
  } = useInteractiveStarRating({ rating, onChange });

  return (
    <div className="flex items-center gap-1">
      {stars.map((star) => (
        <button
          key={star}
          type="button"
          aria-label={`${star} de 5 estrelas`}
          aria-pressed={star === rating}
          onClick={() => handleStarClick(star)}
          onMouseEnter={() => handleMouseEnter(star)}
          onMouseLeave={handleMouseLeave}
          className={cn(
            'grid size-11 cursor-pointer place-items-center rounded-full',
            REVIEWS_FOCUS_RING_CLASS,
          )}
        >
          <Star aria-hidden="true" className={getStarClassName(star)} />
        </button>
      ))}
    </div>
  );
};
