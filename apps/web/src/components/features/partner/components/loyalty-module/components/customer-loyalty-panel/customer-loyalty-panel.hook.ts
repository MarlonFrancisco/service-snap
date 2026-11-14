'use client';

import { useLoyaltyMutations } from '@/hooks/partner/use-loyalty-mutations';
import {
  useLoyaltyProgramQuery,
  useLoyaltyProgressQuery,
} from '@/hooks/partner/use-loyalty-query';
import { isApiHttpError } from '@/service/api';
import { useCallback, useMemo, useState } from 'react';
import { toast } from 'sonner';
import { useRetentionAccess } from '../../../packages-module/packages-module.hook';
import {
  describeReward,
  getProgressDots,
  getVisitsLeftLabel,
  toRewardView,
} from '../../loyalty-module.helpers';
import type { TLoyaltyRewardView } from '../../loyalty-module.types';
import type { TUseCustomerLoyaltyPanelConfig } from './customer-loyalty-panel.types';

const getRedeemError = (error: unknown) => {
  if (isApiHttpError(error) && error.status === 409) {
    return 'Esta recompensa já foi usada ou venceu';
  }

  return 'Não foi possível usar a recompensa';
};

export const useCustomerLoyaltyPanel = ({
  customerId,
}: TUseCustomerLoyaltyPanelConfig) => {
  const { storeId, timeZone, formatMoney } = useRetentionAccess();
  const [redeemTarget, setRedeemTarget] = useState<TLoyaltyRewardView | null>(
    null,
  );

  // Mesma chave da ficha: já vem do cache quando o painel está nela
  const { program } = useLoyaltyProgramQuery({ storeId });
  const {
    progress,
    isLoadingProgress,
    isProgressError,
    isFetchingProgress,
    refetchProgress,
  } = useLoyaltyProgressQuery({ storeId, customerId });
  const { redeemRewardMutation } = useLoyaltyMutations({ storeId });

  const rewards = useMemo(
    () =>
      (progress?.rewards ?? []).map((reward) => toRewardView(reward, timeZone)),
    [progress, timeZone],
  );

  const handleConfirmRedeem = useCallback(() => {
    if (!redeemTarget) return;

    redeemRewardMutation.mutate(
      { rewardId: redeemTarget.id, customerId },
      {
        onSuccess: () => {
          toast.success('Recompensa usada');
          setRedeemTarget(null);
        },
        onError: (error) => toast.error(getRedeemError(error)),
      },
    );
  }, [redeemTarget, redeemRewardMutation, customerId]);

  const visitsDone = progress
    ? progress.visitsRequired - progress.visitsToNextReward
    : 0;
  const nextReward = program ? describeReward(program, formatMoney) : null;

  return {
    title: 'Fidelidade',
    isLoading: isLoadingProgress,
    isError: isProgressError,
    isRetrying: isFetchingProgress,
    handleRetry: () => void refetchProgress(),
    hasProgram: !!progress,
    isPaused: progress ? !progress.isActive : false,
    dots: progress ? getProgressDots(progress) : [],
    dotsLabel: progress
      ? `${visitsDone} de ${progress.visitsRequired} visitas`
      : '',
    visitsLeftLabel: progress
      ? getVisitsLeftLabel(progress.visitsToNextReward)
      : '',
    nextRewardLabel: nextReward
      ? `para ganhar ${nextReward}.`
      : 'para ganhar a recompensa.',
    rewards,
    handleAskRedeem: setRedeemTarget,
    handleCloseRedeem: () => setRedeemTarget(null),
    handleConfirmRedeem,
    redeemDialog: {
      isOpen: !!redeemTarget,
      title: redeemTarget
        ? `Usar ${redeemTarget.description} agora?`
        : 'Usar recompensa?',
      description:
        'Para um brinde entregue no balcão. Num atendimento, use a recompensa no fechamento: o desconto já entra na conta.',
      isPending: redeemRewardMutation.isPending,
    },
  };
};
