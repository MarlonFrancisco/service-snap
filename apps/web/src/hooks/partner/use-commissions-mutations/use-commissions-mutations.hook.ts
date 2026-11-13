import { CommissionsService } from '@/service/partner/commissions';
import type { TCreateCommissionRule } from '@/types/api/commissions.types';
import { CACHE_QUERY_KEYS } from '@/utils/helpers/query.helper';
import { useMutation, useQueryClient } from '@tanstack/react-query';

/** Regra nova muda o relatório de quem atendeu a partir da data dela. */
export const useCommissionsMutations = ({ storeId }: { storeId: string }) => {
  const queryClient = useQueryClient();

  const refresh = () =>
    Promise.all(
      [
        CACHE_QUERY_KEYS.commissionRules(storeId),
        CACHE_QUERY_KEYS.commissionReport(storeId),
        CACHE_QUERY_KEYS.myCommissions(storeId),
      ].map((key) =>
        queryClient.invalidateQueries({ queryKey: key.slice(0, 1) }),
      ),
    );

  const createRuleMutation = useMutation({
    mutationFn: (rule: TCreateCommissionRule) =>
      CommissionsService.createRule(storeId, rule),
    onSuccess: refresh,
  });

  const deleteRuleMutation = useMutation({
    mutationFn: (id: string) => CommissionsService.deleteRule(storeId, id),
    onSuccess: refresh,
  });

  return { createRuleMutation, deleteRuleMutation };
};
