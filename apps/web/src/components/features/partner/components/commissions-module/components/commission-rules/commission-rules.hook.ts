'use client';

import { useCommissionsMutations } from '@/hooks/partner/use-commissions-mutations';
import { useCommissionRulesQuery } from '@/hooks/partner/use-commissions-query';
import { useCallback, useMemo } from 'react';
import { toast } from 'sonner';
import {
  getErrorStatus,
  toDateKey,
} from '../../../cash-module/cash-module.helpers';
import { useManagementAccess } from '../../../cash-module/cash-module.hook';
import { groupCommissionRules } from '../../commissions-module.helpers';

const getDeleteError = (error: unknown) =>
  getErrorStatus(error) === 409
    ? 'Esta regra já começou a valer. Crie uma versão nova no lugar.'
    : 'Não foi possível apagar a regra. Tente de novo.';

export const useCommissionRules = () => {
  const { storeId, storeState, canManage, formatMoney } = useManagementAccess();
  const canQuery = storeState === 'ready' && canManage;
  const { rules, isLoadingRules, isRulesError, refetchRules } =
    useCommissionRulesQuery({ storeId, enabled: canQuery });
  const { deleteRuleMutation } = useCommissionsMutations({ storeId });

  const groups = useMemo(
    () => groupCommissionRules(rules, toDateKey(new Date()), formatMoney),
    [rules, formatMoney],
  );

  const handleDelete = useCallback(
    (id: string) => {
      deleteRuleMutation.mutate(id, {
        onSuccess: () => toast.success('Regra apagada'),
        onError: (error) => toast.error(getDeleteError(error)),
      });
    },
    [deleteRuleMutation],
  );

  return {
    storeId,
    groups,
    isLoading: storeState !== 'ready' || isLoadingRules,
    isError: isRulesError,
    handleRetry: () => void refetchRules(),
    handleDelete,
    deletingId: deleteRuleMutation.isPending
      ? deleteRuleMutation.variables
      : null,
  };
};
