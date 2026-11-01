import { useState, useCallback } from 'react';
import type { TInteractiveStarRatingConfig } from './interactive-star-rating.types';

export const useInteractiveStarRating = ({
  rating,
  onChange,
}: TInteractiveStarRatingConfig) => {
  const [hoverRating, setHoverRating] = useState(0);

  const stars = [1, 2, 3, 4, 5];

  const handleStarClick = useCallback(
    (star: number) => {
      onChange(star);
    },
    [onChange],
  );

  const handleMouseEnter = useCallback((star: number) => {
    setHoverRating(star);
  }, []);

  const handleMouseLeave = useCallback(() => {
    setHoverRating(0);
  }, []);

  const getStarClassName = (star: number) => {
    const isActive = star <= (hoverRating || rating);
    const fillColor = isActive
      ? 'fill-[#B45309] text-[#B45309]'
      : 'fill-[#E3E1EA] text-[#E3E1EA]';

    return `h-8 w-8 transition-colors ${fillColor}`;
  };

  return {
    stars,
    handleStarClick,
    handleMouseEnter,
    handleMouseLeave,
    getStarClassName,
  };
};
