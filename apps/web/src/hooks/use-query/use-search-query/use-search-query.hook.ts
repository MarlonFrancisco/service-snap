import { SearchService } from '@/service/search';
import { CACHE_QUERY_KEYS } from '@/utils/helpers/query.helper';
import { useQuery } from '@tanstack/react-query';

interface UseSearchQueryParams {
  query: string;
  location?: string | null;
  category?: string | null;
}

export const useSearchQuery = ({
  query,
  location,
  category,
}: UseSearchQueryParams) => {
  const normalized = {
    query,
    location: location?.trim() || undefined,
    category: category?.trim() || undefined,
  };

  const { data, isPending, isError } = useQuery({
    queryKey: CACHE_QUERY_KEYS.search(normalized),
    queryFn: () => SearchService.searchStores(normalized),
    enabled: Boolean(query?.trim()),
  });

  return { data, isPending, isError };
};
