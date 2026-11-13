import { useReviewableQuery } from '@/hooks/use-query/use-reviews-query';
import { useUserQuery } from '@/hooks/use-query/use-user-query';
import { useAnalytics } from '@/providers/analytics.provider';
import { useAuthStore, useReviewsStore } from '@/store';
import { formatDayMonth } from '@/utils/helpers/review.helper';
import { useCallback, useMemo } from 'react';
import type { TReviewsShareState } from './reviews-content.types';

const RATING_VALUES = [5, 4, 3, 2, 1];

export const useReviewsContent = () => {
  const {
    reviews,
    showWriteReview,
    storeId,
    reviewTarget,
    setReviewsAttributesAction,
    toggleReviewsModalAction,
  } = useReviewsStore();
  const openAuthAction = useAuthStore((state) => state.openAuthAction);
  const analytics = useAnalytics();
  const { isLoggedIn } = useUserQuery();
  const { reviewable, isPendingReviewable } = useReviewableQuery({
    storeId,
    enabled: isLoggedIn,
  });

  // O atendimento vindo do perfil só vale enquanto ainda não tem avaliação
  const reviewableSchedule = useMemo(() => {
    const isTargetReviewed = reviews.some(
      (review) => review.schedule?.id === reviewTarget?.scheduleId,
    );
    return reviewTarget && !isTargetReviewed ? reviewTarget : reviewable;
  }, [reviews, reviewTarget, reviewable]);

  const getShareState = (): TReviewsShareState => {
    if (!isLoggedIn) return 'logged-out';
    if (reviewableSchedule) return 'reviewable';
    return isPendingReviewable ? 'loading' : 'not-served';
  };

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
    if (!reviewableSchedule) return;

    setReviewsAttributesAction({
      showWriteReview: true,
      reviewTarget: reviewableSchedule,
    });
    if (storeId) {
      analytics.track('review_started', {
        store_id: storeId,
        source: 'reviews_modal',
      });
    }
  }, [analytics, reviewableSchedule, setReviewsAttributesAction, storeId]);

  // O login abre por cima da página: o modal fecha e volta depois de entrar
  const handleLogin = useCallback(() => {
    void toggleReviewsModalAction(false);
    void openAuthAction({
      source: 'other',
      onAuth: () => void toggleReviewsModalAction(true),
    });
  }, [openAuthAction, toggleReviewsModalAction]);

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
    shareState: getShareState(),
    reviewableDateLabel: reviewableSchedule
      ? formatDayMonth(reviewableSchedule.date)
      : '',
    handleShowWriteReview,
    handleLogin,
  };
};
