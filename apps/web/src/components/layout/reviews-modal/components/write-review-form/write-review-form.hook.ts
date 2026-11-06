import { useReviewsMutations } from '@/hooks/use-mutations/use-reviews-mutations';
import { useUserQuery } from '@/hooks/use-query/use-user-query';
import { useAnalytics } from '@/providers/analytics.provider';
import { useReviewsStore } from '@/store';
import { IReview } from '@/types/reviews.types';
import { CACHE_QUERY_KEYS, getQueryClient } from '@/utils/helpers/query.helper';
import { useCallback, useMemo, useState } from 'react';
import { toast } from 'sonner';

export const useWriteReviewForm = () => {
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const storeId = useReviewsStore((state) => state.storeId);
  const businessName = useReviewsStore((state) => state.businessName);
  const setReviewsAttributesAction = useReviewsStore(
    (state) => state.setReviewsAttributesAction,
  );
  const { createReview, isCreatingReview } = useReviewsMutations();
  const { user } = useUserQuery();
  const analytics = useAnalytics();

  const isCommentValid = useMemo(() => comment.trim().length >= 10, [comment]);

  const isFormValid = useMemo(
    () => rating > 0 && isCommentValid,
    [rating, isCommentValid],
  );

  const handleRatingChange = useCallback((newRating: number) => {
    setRating(newRating);
  }, []);

  const handleCommentChange = useCallback(
    (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      setComment(e.target.value);
    },
    [],
  );

  const handleCancel = useCallback(() => {
    setReviewsAttributesAction({ showWriteReview: false });
  }, [setReviewsAttributesAction]);

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      const queryClient = getQueryClient();
      const trackFailure = (reason: string) =>
        analytics.track('review_failed', {
          reason,
          store_id: storeId || undefined,
        });

      if (rating === 0) {
        toast.error('Por favor, selecione uma classificação');
        trackFailure('missing_rating');
        return;
      }

      if (!isCommentValid) {
        toast.error('Por favor, escreva pelo menos 10 caracteres');
        trackFailure('comment_too_short');
        return;
      }

      if (!user?.id) {
        toast.error('Você precisa estar logado para avaliar');
        trackFailure('not_logged_in');
        return;
      }

      createReview(
        {
          store: { id: storeId },
          user: { id: user.id },
          rating,
          comment,
        },
        {
          onSuccess: (data: IReview) => {
            // Só o tamanho do comentário: o texto é livre e pode ter dados pessoais
            analytics.track('review_submitted', {
              store_id: storeId,
              rating,
              comment_length: comment.trim().length,
            });
            queryClient.setQueryData(
              CACHE_QUERY_KEYS.reviews(storeId),
              (old: IReview[]) => {
                setReviewsAttributesAction({ reviews: [data, ...old] });
                return [...old, data];
              },
            );
            setRating(0);
            setComment('');
            handleCancel();
          },
          onError: () => trackFailure('api_error'),
        },
      );
    },
    [
      analytics,
      rating,
      isCommentValid,
      user,
      comment,
      createReview,
      storeId,
      setReviewsAttributesAction,
      handleCancel,
    ],
  );

  return {
    rating,
    comment,
    businessName,
    isCreatingReview,
    isFormValid,
    commentLength: comment.length,
    handleRatingChange,
    handleCommentChange,
    handleSubmit,
    handleCancel,
  };
};
