import type { IReview } from '@/types/reviews.types';
import type { TReviewsFilter, TReviewsSummary } from './reviews-module.types';

export const hasReply = (review: IReview) => Boolean(review.reply?.trim());

export const filterReviews = (reviews: IReview[], filter: TReviewsFilter) => {
  if (filter === 'all') return reviews;
  const wantsReply = filter === 'answered';
  return reviews.filter((review) => hasReply(review) === wantsReply);
};

export const getReviewsSummary = (reviews: IReview[]): TReviewsSummary => {
  const total = reviews.length;
  const average = total
    ? reviews.reduce((sum, review) => sum + review.rating, 0) / total
    : 0;

  return {
    averageLabel: total
      ? `★ ${average.toLocaleString('pt-BR', {
          minimumFractionDigits: 1,
          maximumFractionDigits: 1,
        })}`
      : '—',
    total,
    unanswered: reviews.filter((review) => !hasReply(review)).length,
  };
};
