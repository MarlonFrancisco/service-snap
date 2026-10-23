import { Homepage } from '@/components/features/homepage';
import { RecomendationService } from '@/service/recomendation';
import { withBudget } from '@/utils/helpers/promise.helper';
import { CACHE_QUERY_KEYS, getQueryClient } from '@/utils/helpers/query.helper';
import { dehydrate, HydrationBoundary } from '@tanstack/react-query';

const RECOMMENDATIONS_PREFETCH_MS = 2500;

export default async function HomePage() {
  const queryClient = getQueryClient();

  await withBudget(
    queryClient.prefetchQuery({
      queryKey: CACHE_QUERY_KEYS.recommendationStores(),
      queryFn: () => RecomendationService.getRecommendationStores(),
    }),
    RECOMMENDATIONS_PREFETCH_MS,
  );

  const dehydratedState = dehydrate(queryClient);

  return (
    <HydrationBoundary state={dehydratedState}>
      <Homepage />
    </HydrationBoundary>
  );
}
