'use client';
import { PlansService } from '@/service/plans';
import { useLocaleStore } from '@/store/locale';
import { CACHE_QUERY_KEYS } from '@/utils/helpers/query.helper';
import { useQuery } from '@tanstack/react-query';

export const usePlansQuery = ({
  enabled = true,
}: { enabled?: boolean } = {}) => {
  const { currency } = useLocaleStore();

  const {
    data,
    isPending: isPendingPlans,
    isError: isErrorPlans,
    isFetching: isFetchingPlans,
    refetch: refetchPlans,
  } = useQuery({
    queryKey: CACHE_QUERY_KEYS.plans(currency),
    queryFn: () => PlansService.getPlans(currency),
    enabled,
  });

  return { data, isPendingPlans, isErrorPlans, isFetchingPlans, refetchPlans };
};
