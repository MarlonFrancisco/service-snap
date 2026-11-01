import { useStoreMutations } from '@/hooks/partner/store/use-store-mutations/use-store-mutations.hook';
import type { IStore } from '@/types/api/stores.types';
import { CACHE_QUERY_KEYS } from '@/utils/helpers/query.helper';
import { zodResolver } from '@hookform/resolvers/zod';
import { useQueryClient } from '@tanstack/react-query';
import { useCallback, useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { parseMoneyInput } from '../utils/metrics.helpers';
import { salesGoalSchema, type TSalesGoalFormData } from './sales-goal-card.schema';
import type { TUseSalesGoalCardConfig } from './sales-goal-card.types';

const MAX_PROGRESS = 100;

export const useSalesGoalCard = ({
  storeId,
  period,
  goal,
}: TUseSalesGoalCardConfig) => {
  const queryClient = useQueryClient();
  const { updateStoreMutation } = useStoreMutations();
  const [isEditing, setIsEditing] = useState(false);

  const hasGoal = goal.target > 0;
  const isMonthly = period === 'month';
  const currentGoalInput = hasGoal && isMonthly ? String(goal.target) : '';

  const form = useForm<TSalesGoalFormData>({
    resolver: zodResolver(salesGoalSchema),
    defaultValues: { monthlyGoal: currentGoalInput },
  });
  const { reset } = form;

  useEffect(() => {
    reset({ monthlyGoal: currentGoalInput });
    setIsEditing(false);
  }, [currentGoalInput, reset, storeId]);

  const handleSubmit = form.handleSubmit(async ({ monthlyGoal }) => {
    const amount = parseMoneyInput(monthlyGoal);
    if (amount === null) return;

    try {
      await updateStoreMutation.mutateAsync({
        id: storeId,
        monthlyGoal: amount,
      });
    } catch {
      // A mutação já avisa o erro em toast; o formulário segue aberto.
      return;
    }

    // Mantém o detalhe em cache coerente: quem editar a loja depois não reenvia
    // a meta antiga.
    queryClient.setQueryData<IStore>(CACHE_QUERY_KEYS.store(storeId), (store) =>
      store ? { ...store, monthlyGoal: amount } : store,
    );
    await queryClient.invalidateQueries({
      queryKey: CACHE_QUERY_KEYS.metricsSales(storeId).slice(0, 1),
    });
    setIsEditing(false);
  });

  const handleStartEditing = useCallback(() => setIsEditing(true), []);
  const handleCancelEditing = useCallback(() => {
    reset({ monthlyGoal: currentGoalInput });
    setIsEditing(false);
  }, [currentGoalInput, reset]);

  return {
    form,
    handleSubmit,
    handleStartEditing,
    handleCancelEditing,
    isSaving: updateStoreMutation.isPending,
    hasGoal,
    isMonthly,
    showForm: isMonthly && (!hasGoal || isEditing),
    isEditing,
    isGoalReached: hasGoal && goal.remaining === 0,
    progress: Math.min(goal.percentage, MAX_PROGRESS),
  };
};
