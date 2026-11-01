import { useReviewsMutations } from '@/hooks/use-mutations/use-reviews-mutations';
import { useUserQuery } from '@/hooks/use-query/use-user-query';
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

      if (rating === 0) {
        toast.error('Por favor, selecione uma classificação');
        return;
      }

      if (!isCommentValid) {
        toast.error('Por favor, escreva pelo menos 10 caracteres');
        return;
      }

      if (!user?.id) {
        toast.error('Você precisa estar logado para avaliar');
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
        },
      );
    },
    [
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
