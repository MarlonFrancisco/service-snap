import type {
  TStarRatingConfig,
  TStarRatingSize,
} from './star-rating.types';

const MAX_STARS = 5;

const SIZE_CLASSES: Record<TStarRatingSize, string> = {
  small: 'text-xs',
  default: 'text-sm',
  large: 'text-base',
};

export const useStarRating = ({
  rating,
  size = 'default',
}: TStarRatingConfig) => {
  const filledStars = Math.max(0, Math.min(MAX_STARS, Math.floor(rating)));

  return {
    stars: '★'.repeat(filledStars) + '☆'.repeat(MAX_STARS - filledStars),
    label: `${rating} de ${MAX_STARS} estrelas`,
    sizeClassName: SIZE_CLASSES[size],
  };
};
