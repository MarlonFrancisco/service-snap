import { SearchResults } from '@/components/features/search';
import { parseSearchFilters } from '@/components/features/search/search.helpers';
import { SearchService } from '@/service/search';
import { withBudget } from '@/utils/helpers/promise.helper';
import { CACHE_QUERY_KEYS, getQueryClient } from '@/utils/helpers/query.helper';
import { createPageMetadata } from '@/utils/helpers/site-metadata.helper';
import { dehydrate, HydrationBoundary } from '@tanstack/react-query';
import type { Metadata } from 'next';
import { permanentRedirect } from 'next/navigation';

type SearchPageProps = {
  searchParams: Promise<{
    query?: string;
    location?: string;
    category?: string;
    minRating?: string;
    availableToday?: string;
  }>;
};

const SEARCH_PREFETCH_MS = 4000;

export async function generateMetadata({
  searchParams,
}: SearchPageProps): Promise<Metadata> {
  const params = await searchParams;
  const query = params.query?.trim();
  const location = params.location?.trim();
  const category = params.category?.trim();

  if (!query) {
    return createPageMetadata({
      title: 'ServiceSnap',
      description:
        'Encontre e agende com profissionais perto de você. Simples, rápido e confiável.',
      path: '/',
    });
  }

  const qs = new URLSearchParams({ query });
  if (location) qs.set('location', location);
  if (category) qs.set('category', category);

  return createPageMetadata({
    title: 'Buscar serviços | ServiceSnap',
    description:
      'Busque profissionais e agende serviços perto de você no ServiceSnap.',
    path: `/booking?${qs.toString()}`,
    // Resultados de busca não entram no índice; os links das lojas sim.
    noindex: true,
  });
}

export default async function SearchPage({ searchParams }: SearchPageProps) {
  const queryClient = getQueryClient();
  const params = await searchParams;
  const query = params.query?.trim();
  const location = params.location?.trim() || undefined;
  const category = params.category?.trim() || undefined;

  if (!query) {
    permanentRedirect('/');
  }

  // Filtros inválidos na URL são ignorados; a chave igual à do cliente evita
  // refetch na hidratação.
  const searchKey = {
    query,
    location,
    category,
    ...parseSearchFilters(params),
  };

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
