import { ReviewsService } from '@/service/reviews/reviews.service';
import { CACHE_QUERY_KEYS } from '@/utils/helpers/query.helper';
import { useQuery } from '@tanstack/react-query';

export const useReviewsQuery = ({ storeId }: { storeId: string }) => {
  const {
    data: reviews,
    isPending: isPendingReviews,
    isError: isReviewsError,
    isFetching: isReviewsFetching,
    refetch: refetchReviews,
  } = useQuery({
    queryKey: CACHE_QUERY_KEYS.reviews(storeId),
    queryFn: () => ReviewsService.getByStore(storeId),
    enabled: !!storeId,
  });

  return {
    reviews,
    isPendingReviews,
    isReviewsError,
    isReviewsFetching,
    refetchReviews,
  };
};

/** Só faz sentido logado: a API responde pelo cliente do token. */
export const useReviewableQuery = ({
  storeId,
  enabled,
}: {
  storeId: string;
  enabled: boolean;
}) => {
  const { data: reviewable, isPending: isPendingReviewable } = useQuery({
    queryKey: CACHE_QUERY_KEYS.reviewable(storeId),
    queryFn: () => ReviewsService.getReviewable(storeId),
    enabled: enabled && !!storeId,
  });

  return { reviewable: reviewable ?? null, isPendingReviewable };
};
