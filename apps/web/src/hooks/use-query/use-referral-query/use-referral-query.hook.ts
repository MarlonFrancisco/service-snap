import { ReferralService } from '@/service/referral/referral.service';
import { CACHE_QUERY_KEYS } from '@/utils/helpers/query.helper';
import { useQuery } from '@tanstack/react-query';
import { cookies } from '@/utils/helpers/cookie.helper';

export const useReferralQuery = (enabled = true) => {
  const userId = cookies.get('user_identification');

  const { data, isPending, isError, refetch } = useQuery({
    queryKey: CACHE_QUERY_KEYS.referral(),
    queryFn: () => ReferralService.getMine(),
    enabled: enabled && !!userId,
  });

  return {
    referral: data,
    isPendingReferral: isPending,
    isErrorReferral: isError,
    refetchReferral: refetch,
  };
};
