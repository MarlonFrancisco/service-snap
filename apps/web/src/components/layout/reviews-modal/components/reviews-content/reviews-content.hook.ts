import { useReviewsStore } from '@/store';
import { useCallback, useMemo } from 'react';

const RATING_VALUES = [5, 4, 3, 2, 1];

export const useReviewsContent = () => {
  const { reviews, showWriteReview, setReviewsAttributesAction } =
    useReviewsStore();

  const averageRating = useMemo(() => {
    if (reviews.length === 0) return 0;
    return (
      reviews.reduce((acc, review) => acc + review.rating, 0) / reviews.length
    );
  }, [reviews]);

  const totalReviews = reviews.length;

  const ratingBars = useMemo(() => {
    const distribution = reviews.reduce<Record<number, number>>(
      (acc, review) => {
        const rating = Math.floor(review.rating);
        acc[rating] = (acc[rating] || 0) + 1;
        return acc;
      },
      {},
    );

    return RATING_VALUES.map((rating) => ({
      rating,
      percentage:
        totalReviews > 0
          ? Math.round(((distribution[rating] || 0) / totalReviews) * 100)
          : 0,
    }));
  }, [reviews, totalReviews]);

  const handleShowWriteReview = useCallback(() => {
    setReviewsAttributesAction({ showWriteReview: true });
  }, [setReviewsAttributesAction]);

  return {
    reviews,
    showWriteReview,
    hasReviews: totalReviews > 0,
    formattedAverage: averageRating.toLocaleString('pt-BR', {
      minimumFractionDigits: 1,
      maximumFractionDigits: 1,
    }),
    totalLabel: `${totalReviews} ${totalReviews === 1 ? 'avaliação' : 'avaliações'}`,
    ratingBars,
    handleShowWriteReview,
  };
};
