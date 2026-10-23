import { SearchResults } from '@/components/features/search';
import { SearchService } from '@/service/search';
import { createRedisPersister } from '@/utils/helpers/query-server.helpers';
import { CACHE_QUERY_KEYS, getQueryClient } from '@/utils/helpers/query.helper';
import { dehydrate, HydrationBoundary } from '@tanstack/react-query';
import { redirect } from 'next/navigation';

type SearchPageProps = {
  searchParams: Promise<{
    query?: string;
    location?: string;
    category?: string;
  }>;
};

const REDIS_BUDGET_MS = 800;
const SEARCH_PREFETCH_MS = 4000;

async function withBudget<T>(promise: Promise<T>, ms: number): Promise<T | undefined> {
  let timer: ReturnType<typeof setTimeout> | undefined;
  try {
    return await Promise.race([
      promise,
      new Promise<undefined>((resolve) => {
        timer = setTimeout(() => resolve(undefined), ms);
      }),
    ]);
  } catch {
    return undefined;
  } finally {
    if (timer) clearTimeout(timer);
  }
}

export default async function SearchPage({ searchParams }: SearchPageProps) {
  const queryClient = getQueryClient();
  const params = await searchParams;
  const query = params.query;
  const location = params.location?.trim() || undefined;
  const category = params.category?.trim() || undefined;

  if (!query) {
    redirect('/');
  }

  const { persistClient, restoreClient } =
    await createRedisPersister(queryClient);

  // Redis is best-effort cache — never let a hung Redis dominate TTFB.
  await withBudget(restoreClient(), REDIS_BUDGET_MS);

  const searchKey = { query, location, category };
  await withBudget(
    queryClient.prefetchQuery({
      queryKey: CACHE_QUERY_KEYS.search(searchKey),
      queryFn: () => SearchService.searchStores(searchKey),
    }),
    SEARCH_PREFETCH_MS,
  );

  void withBudget(persistClient(), REDIS_BUDGET_MS);

  const dehydratedState = dehydrate(queryClient);

  return (
    <HydrationBoundary state={dehydratedState}>
      <SearchResults />
    </HydrationBoundary>
  );
}
