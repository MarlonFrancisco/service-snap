import { HomepageV2 } from '@/components/features/homepage-v2';
import { EXPERIENCE_ROW_CONFIGS } from '@/components/features/homepage-v2/homepage-v2.mock';
import { RecomendationService } from '@/service/recomendation';
import { SearchService } from '@/service/search';
import { withBudget } from '@/utils/helpers/promise.helper';
import { CACHE_QUERY_KEYS, getQueryClient } from '@/utils/helpers/query.helper';
import { createPageMetadata } from '@/utils/helpers/site-metadata.helper';
import { dehydrate, HydrationBoundary } from '@tanstack/react-query';
import { Plus_Jakarta_Sans } from 'next/font/google';

const plusJakarta = Plus_Jakarta_Sans({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
});

const PREFETCH_MS = 2500;

export const metadata = createPageMetadata({
  title: 'ServiceSnap — Agende cuidados perto de você',
  description:
    'Encontre barbearias, salões, spas e terapeutas com horário confirmado na hora.',
  path: '/v2',
});

export default async function HomeV2Page() {
  const queryClient = getQueryClient();

  const searchRows = EXPERIENCE_ROW_CONFIGS.filter(
    (row) => row.source === 'search',
  );

  await Promise.all([
    withBudget(
      queryClient.prefetchQuery({
        queryKey: CACHE_QUERY_KEYS.recommendationStores(),
        queryFn: () => RecomendationService.getRecommendationStores(),
      }),
      PREFETCH_MS,
    ),
    ...searchRows.map((row) => {
      const params = {
        query: row.query,
        category: row.category,
      };

      return withBudget(
        queryClient.prefetchQuery({
          queryKey: CACHE_QUERY_KEYS.search(params),
          queryFn: () => SearchService.searchStores(params),
        }),
        PREFETCH_MS,
      );
    }),
  ]);

  const dehydratedState = dehydrate(queryClient);

  return (
    <div className={plusJakarta.className}>
      <HydrationBoundary state={dehydratedState}>
        <HomepageV2 />
      </HydrationBoundary>
    </div>
  );
}
