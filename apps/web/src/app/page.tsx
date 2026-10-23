import { Homepage } from '@/components/features/homepage';
import { RecomendationService } from '@/service/recomendation';
import { CACHE_QUERY_KEYS, getQueryClient } from '@/utils/helpers/query.helper';
import { dehydrate, HydrationBoundary } from '@tanstack/react-query';

const RECOMMENDATIONS_PREFETCH_MS = 2500;

async function prefetchRecommendationsWithBudget(
  queryClient: ReturnType<typeof getQueryClient>,
) {
  let timer: ReturnType<typeof setTimeout> | undefined;

  try {
    await Promise.race([
      queryClient.prefetchQuery({
        queryKey: CACHE_QUERY_KEYS.recommendationStores(),
        queryFn: () => RecomendationService.getRecommendationStores(),
      }),
      new Promise<void>((resolve) => {
        timer = setTimeout(resolve, RECOMMENDATIONS_PREFETCH_MS);
      }),
    ]);
  } catch {
    // API/DB outage must not block the home shell — empty state handles it.
  } finally {
    if (timer) clearTimeout(timer);
  }
}

export default async function HomePage() {
  const queryClient = getQueryClient();

  await prefetchRecommendationsWithBudget(queryClient);

  const dehydratedState = dehydrate(queryClient);

  return (
    <HydrationBoundary state={dehydratedState}>
      <Homepage />
    </HydrationBoundary>
  );
}
