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
  const {
    data: storeMembers = [],
    isPending: isPendingStoreMembers,
    isError,
    isFetching,
  } = useQuery({
    queryKey: CACHE_QUERY_KEYS.storeMembers(storeId || ''),
    queryFn: () => StoreMembersService.get(storeId!),
    enabled: enabled && !!storeId,
  });

  return { storeMembers, isPendingStoreMembers, isFetching, isError };
};
