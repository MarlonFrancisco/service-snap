import { StoreMembersService } from '@/service/store/store-members.service';
import { CACHE_QUERY_KEYS } from '@/utils/helpers/query.helper';
import { useQuery } from '@tanstack/react-query';

export const useStoreMembersQuery = ({
  storeId,
  enabled = true,
}: {
  storeId?: string;
  enabled?: boolean;
}) => {
  const canFetch = enabled && !!storeId;

  const {
    data: storeMembers = [],
    isPending: isPendingStoreMembers,
    isError,
    isFetching,
    refetch,
  } = useQuery({
    queryKey: CACHE_QUERY_KEYS.storeMembers(storeId!),
    queryFn: () => StoreMembersService.get(storeId!),
    enabled: canFetch,
  });

  return {
    storeMembers,
    isPendingStoreMembers: canFetch && isPendingStoreMembers,
    isFetching,
    isError: canFetch && isError,
    refetch,
  };
};
