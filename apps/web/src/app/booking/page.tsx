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

export default async function SearchPage({ searchParams }: SearchPageProps) {
  const queryClient = getQueryClient();
  const params = await searchParams;
  const query = params.query;
  const location = params.location?.trim() || undefined;
  const category = params.category?.trim() || undefined;

  const { persistClient, restoreClient } =
    await createRedisPersister(queryClient);

  if (query) {
    await restoreClient();

    const searchKey = { query, location, category };

    await queryClient.prefetchQuery({
      queryKey: CACHE_QUERY_KEYS.search(searchKey),
      queryFn: () => SearchService.searchStores(searchKey),
    });

    await persistClient();
  } else {
    redirect('/');
  }

  const dehydratedState = dehydrate(queryClient);

  return (
    <HydrationBoundary state={dehydratedState}>
      <SearchResults />
    </HydrationBoundary>
  );
}
