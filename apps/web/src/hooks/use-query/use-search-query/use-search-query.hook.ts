import { SearchService } from '@/service/search';
import { CACHE_QUERY_KEYS } from '@/utils/helpers/query.helper';
import { useQuery } from '@tanstack/react-query';

interface UseSearchQueryParams {
  query: string;
  location?: string | null;
  category?: string | null;
  minRating?: string | null;
  availableToday?: boolean | null;
}

export const useSearchQuery = ({
  query,
  location,
  category,
  minRating,
  availableToday,
}: UseSearchQueryParams) => {
  // Mesmo formato da chave do prefetch em `app/booking/page.tsx`: campos
  // vazios viram `undefined` para o cache hidratado bater.
  const normalized = {
    query: query.trim(),
    location: location?.trim() || undefined,
    category: category?.trim() || undefined,
    minRating: minRating?.trim() || undefined,
    availableToday: availableToday || undefined,
  };

  const { data, isPending, isError } = useQuery({
    queryKey: CACHE_QUERY_KEYS.search(normalized),
    queryFn: () => SearchService.searchStores(normalized),
    enabled: Boolean(normalized.query),
  });

  return { data, isPending, isError };
};
