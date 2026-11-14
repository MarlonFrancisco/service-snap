import { LoyaltyService } from '@/service/partner/loyalty';
import type {
  ILoyaltyProgram,
  TSaveLoyaltyProgram,
} from '@/types/api/loyalty.types';
import { CACHE_QUERY_KEYS } from '@/utils/helpers/query.helper';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import type {
  TRedeemRewardVariables,
  TUseLoyaltyMutationsConfig,
} from './use-loyalty-mutations.types';

export const useLoyaltyMutations = ({
  storeId,
}: TUseLoyaltyMutationsConfig) => {
  const queryClient = useQueryClient();

  const saveProgramMutation = useMutation({
    mutationFn: (program: TSaveLoyaltyProgram) =>
      LoyaltyService.saveProgram(storeId, program),
    onSuccess: (program: ILoyaltyProgram) => {
      queryClient.setQueryData(
        CACHE_QUERY_KEYS.loyaltyProgram(storeId),
        program,
      );

      // Regra nova muda o progresso de todo cliente da loja
      const prefix = `partner/stores/${storeId}/loyalty/customers/`;

      return queryClient.invalidateQueries({
        predicate: ({ queryKey }) =>
          typeof queryKey[0] === 'string' && queryKey[0].startsWith(prefix),
      });
    },
  });

  const redeemRewardMutation = useMutation({
    mutationFn: ({ rewardId }: TRedeemRewardVariables) =>
      LoyaltyService.redeem(storeId, rewardId),
    onSuccess: (_, { customerId }) =>
      queryClient.invalidateQueries({
        queryKey: CACHE_QUERY_KEYS.loyaltyProgress(storeId, customerId),
      }),
  });

  return { saveProgramMutation, redeemRewardMutation };
};
