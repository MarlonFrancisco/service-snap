'use client';

import { useAdminMutations } from '@/hooks/use-query/use-admin-mutations';
import { useAdminStoreQuery } from '@/hooks/use-query/use-admin-query';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { toast } from 'sonner';
import {
  ADMIN_RECENT_ACTIVITY,
  describeAdminSubscription,
  formatPeopleCount,
  getAdminStoreStatus,
  toAdminActivityItem,
} from '../../../admin.helpers';
import type { TAdminStoreDetailsConfig } from './admin-store-details.types';

export const useAdminStoreDetails = ({ storeId }: TAdminStoreDetailsConfig) => {
  const [reason, setReason] = useState('');
  const { store, isLoadingStore, isStoreError, isFetchingStore, refetchStore } =
    useAdminStoreQuery({ storeId });
  const { updateStoreMutation } = useAdminMutations();

  // Motivo de uma loja não vale para outra
  useEffect(() => {
    setReason('');
  }, [storeId]);

  const activity = useMemo(
    () =>
      (store?.recentActivity ?? [])
        .slice(0, ADMIN_RECENT_ACTIVITY)
        .map(toAdminActivityItem),
    [store?.recentActivity],
  );

  const changeStatus = useCallback(
    (isActive: boolean) => {
      if (!store) return;

      const trimmedReason = reason.trim();

      updateStoreMutation.mutate(
        {
          storeId: store.id,
          changes: {
            isActive,
            ...(trimmedReason && { reason: trimmedReason }),
          },
        },
        {
          onSuccess: () => {
            setReason('');
            toast.success(isActive ? 'Loja reativada' : 'Loja suspensa');
          },
          onError: () =>
            toast.error(
              isActive
                ? 'Não foi possível reativar a loja'
                : 'Não foi possível suspender a loja',
            ),
        },
      );
    },
    [store, reason, updateStoreMutation],
  );

  return {
    store,
    status: store ? getAdminStoreStatus(store) : null,
    details: store
      ? [
          { term: 'Dono', value: store.owner?.email || 'Sem dono' },
          {
            term: 'Plano',
            value: describeAdminSubscription(store.subscription),
          },
          { term: 'Equipe', value: formatPeopleCount(store.membersCount) },
          { term: 'Serviços', value: String(store.servicesCount) },
          {
            term: 'Agendamentos em 30 dias',
            value: String(store.schedulesLast30Days),
          },
        ]
      : [],
    activity,
    reason,
    setReason,
    handleSuspend: () => changeStatus(false),
    handleReactivate: () => changeStatus(true),
    isSaving: updateStoreMutation.isPending,
    isLoading: isLoadingStore,
    isError: isStoreError,
    isRetrying: isFetchingStore,
    handleRetry: () => void refetchStore(),
  };
};
