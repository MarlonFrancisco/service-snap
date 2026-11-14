'use client';

import { useCustomerQuery } from '@/hooks/partner/use-customers-query';
import { usePackagesMutations } from '@/hooks/partner/use-packages-mutations';
import { useCustomerPackagesQuery } from '@/hooks/partner/use-packages-query';
import { useCallback, useMemo, useState } from 'react';
import { toast } from 'sonner';
import { getCustomerName } from '../../../customers-module/customers-module.helpers';
import {
  formatSessions,
  toCustomerPackageView,
} from '../../packages-module.helpers';
import { useRetentionAccess } from '../../packages-module.hook';
import type { TCustomerPackageView } from '../../packages-module.types';
import type { TUseCustomerPackagesPanelConfig } from './customer-packages-panel.types';

export const useCustomerPackagesPanel = ({
  customerId,
}: TUseCustomerPackagesPanelConfig) => {
  const { storeId, timeZone } = useRetentionAccess();
  const [cancelTarget, setCancelTarget] = useState<TCustomerPackageView | null>(
    null,
  );

  // Mesma chave da ficha: já vem do cache quando o painel está nela
  const { customer } = useCustomerQuery({ storeId, userId: customerId });
  const {
    customerPackages,
    isLoadingCustomerPackages,
    isCustomerPackagesError,
    isFetchingCustomerPackages,
    refetchCustomerPackages,
  } = useCustomerPackagesQuery({ storeId, customerId });
  const { cancelCustomerPackageMutation } = usePackagesMutations({ storeId });

  const views = useMemo(
    () =>
      customerPackages.map((balance) =>
        toCustomerPackageView(balance, timeZone),
      ),
    [customerPackages, timeZone],
  );

  const handleConfirmCancel = useCallback(() => {
    if (!cancelTarget) return;

    cancelCustomerPackageMutation.mutate(
      { customerPackageId: cancelTarget.id, customerId },
      {
        onSuccess: () => {
          toast.success('Saldo cancelado');
          setCancelTarget(null);
        },
        onError: () => toast.error('Não foi possível cancelar o saldo'),
      },
    );
  }, [cancelTarget, cancelCustomerPackageMutation, customerId]);

  const remainingToCancel =
    cancelTarget?.source.items.reduce(
      (total, item) => total + item.remaining,
      0,
    ) ?? 0;

  return {
    title: customer ? `Pacotes de ${getCustomerName(customer)}` : 'Pacotes',
    activePackages: views.filter((view) => view.isUsable),
    pastPackages: views.filter((view) => !view.isUsable),
    isEmpty: !isLoadingCustomerPackages && views.length === 0,
    isLoading: isLoadingCustomerPackages,
    isError: isCustomerPackagesError,
    isRetrying: isFetchingCustomerPackages,
    handleRetry: () => void refetchCustomerPackages(),
    handleAskCancel: setCancelTarget,
    handleCloseCancel: () => setCancelTarget(null),
    handleConfirmCancel,
    cancelDialog: {
      isOpen: !!cancelTarget,
      title: cancelTarget
        ? `Cancelar o saldo de ${cancelTarget.name}?`
        : 'Cancelar saldo?',
      description: `Tira ${formatSessions(remainingToCancel)} que ${remainingToCancel === 1 ? 'sobrou' : 'sobraram'}. O que já foi usado fica no histórico.`,
      isPending: cancelCustomerPackageMutation.isPending,
    },
  };
};
