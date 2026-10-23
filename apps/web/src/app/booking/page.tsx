import { SearchResults } from '@/components/features/search';
import { SearchService } from '@/service/search';
import { withBudget } from '@/utils/helpers/promise.helper';
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

const SEARCH_PREFETCH_MS = 4000;

export default async function SearchPage({ searchParams }: SearchPageProps) {
  const queryClient = getQueryClient();
  const params = await searchParams;
  const query = params.query;
  const location = params.location?.trim() || undefined;
  const category = params.category?.trim() || undefined;

  if (!query) {
    redirect('/');
  }

  const searchKey = { query, location, category };

  await withBudget(
    queryClient.prefetchQuery({
      queryKey: CACHE_QUERY_KEYS.search(searchKey),
      queryFn: () => SearchService.searchStores(searchKey),
    }),
    SEARCH_PREFETCH_MS,
  );

  const dehydratedState = dehydrate(queryClient);

  return (
    <HydrationBoundary state={dehydratedState}>
      <SearchResults />
    </HydrationBoundary>
  );
}
