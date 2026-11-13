import { ReviewsService } from '@/service/reviews/reviews.service';
import type {
  ICreateReviewPayload,
  IReplyReviewPayload,
  IReview,
} from '@/types/reviews.types';
import { CACHE_QUERY_KEYS } from '@/utils/helpers/query.helper';
import {
  getCreateReviewErrorMessage,
  getHttpStatus,
} from '@/utils/helpers/review.helper';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

export const useReviewsMutations = () => {
  const queryClient = useQueryClient();

  const invalidateStoreReviews = (storeId: string) => {
    void queryClient.invalidateQueries({
      queryKey: CACHE_QUERY_KEYS.reviews(storeId),
    });
    void queryClient.invalidateQueries({
      queryKey: CACHE_QUERY_KEYS.reviewable(storeId),
    });
  };

  const { mutate: createReview, isPending: isCreatingReview } = useMutation({
    mutationFn: async (payload: ICreateReviewPayload) =>
      ReviewsService.create(payload),
    onSuccess: (_data, payload) => {
      toast.success('Avaliação enviada com sucesso!', {
        description: 'Obrigado por compartilhar sua opinião.',
      });
      invalidateStoreReviews(payload.store.id);
    },
    onError: (error, payload) => {
      toast.error(getCreateReviewErrorMessage(error));
      // 403/409: o atendimento oferecido já não vale, a lista e o botão mudam
      if (getHttpStatus(error) === 403 || getHttpStatus(error) === 409) {
        invalidateStoreReviews(payload.store.id);
      }
    },
  });

  const { mutate: replyReview, isPending: isReplyingReview } = useMutation({
    mutationFn: async (payload: IReplyReviewPayload) =>
      ReviewsService.reply(payload),
    onSuccess: (review, { storeId, reply }) => {
      toast.success(reply.trim() ? 'Resposta publicada' : 'Resposta apagada');
      queryClient.setQueryData<IReview[]>(
        CACHE_QUERY_KEYS.reviews(storeId),
        (old) =>
          old?.map((item) =>
            item.id === review.id
              ? { ...item, reply: review.reply, repliedAt: review.repliedAt }
              : item,
          ),
      );
    },
    onError: (error) => {
      toast.error(
        getHttpStatus(error) === 403
          ? 'Só o dono ou o gerente da loja respondem avaliações'
          : 'Não foi possível salvar a resposta. Tente de novo.',
      );
    },
  });

  return {
    createReview,
    isCreatingReview,
    replyReview,
    isReplyingReview,
  };
};
