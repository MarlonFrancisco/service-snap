'use client';

import { useNotificationsQuery } from '@/hooks/use-query/use-notifications-query/use-notifications-query.hook';
import { useStoreQuery } from '@/hooks/use-query/use-store-query';
import { useStoresQuery } from '@/hooks/use-query/use-stores-query/use-stores-query.hook';
import { usePartnerStore } from '@/store';
import { CACHE_QUERY_KEYS } from '@/utils/helpers/query.helper';
import { useQueryClient } from '@tanstack/react-query';
import { useCallback, useEffect, useState } from 'react';
import type { FieldValues, UseFormReset } from 'react-hook-form';
import type {
  TNotificationsSettingsData,
  TReminderLoadState,
  TStoreAvailability,
} from './notifications-module.types';

/**
 * A loja ativa só existe depois que o casco carrega a lista. Sem esta leitura, uma
 * conta sem loja (ou uma falha nessa carga) deixaria as telas em skeleton para sempre.
 */
export const useStoreAvailability = () => {
  const queryClient = useQueryClient();
  const storeId = usePartnerStore((state) => state.activeStore?.id) ?? '';
  const { stores, isPendingStores, isError: isStoresError } = useStoresQuery();
  const fallbackStoreId = storeId || stores[0]?.id || '';
  const { isError: isStoreError } = useStoreQuery({
    storeId: fallbackStoreId,
  });

  const getAvailability = (): TStoreAvailability => {
    if (storeId) return 'ready';
    if (isStoresError || isStoreError) return 'error';
    if (!isPendingStores && stores.length === 0) return 'no-store';
    return 'loading';
  };

  const retryStore = useCallback(() => {
    void queryClient.invalidateQueries({
      queryKey: CACHE_QUERY_KEYS.stores(),
    });
    if (fallbackStoreId) {
      void queryClient.invalidateQueries({
        queryKey: CACHE_QUERY_KEYS.store(fallbackStoreId),
      });
    }
  }, [queryClient, fallbackStoreId]);

  return { storeId, storeAvailability: getAvailability(), retryStore };
};

/**
 * Carrega as configurações de lembrete e só libera o formulário depois de aplicá-las,
 * para ele não aparecer desligado até os dados chegarem.
 */
export const useReminderSettingsLoad = <TFormValues extends FieldValues>({
  reset,
  getFormValues,
}: {
  reset: UseFormReset<TFormValues>;
  getFormValues: (settings: TNotificationsSettingsData) => TFormValues;
}) => {
  const { storeId, storeAvailability, retryStore } = useStoreAvailability();
  const {
    notificationsSettings,
    isNotificationsSettingsError,
    isNotificationsSettingsFetching,
    refetchNotificationsSettings,
  } = useNotificationsQuery({ storeId, includeNotificationsSettings: true });

  const [syncedSettings, setSyncedSettings] = useState<
    TNotificationsSettingsData | undefined
  >(undefined);

  useEffect(() => {
    if (notificationsSettings === undefined) return;

    reset(getFormValues(notificationsSettings));
    setSyncedSettings(notificationsSettings);
  }, [notificationsSettings, reset, getFormValues]);

  const getLoadState = (): TReminderLoadState => {
    if (storeAvailability !== 'ready') return storeAvailability;
    if (notificationsSettings === undefined) {
      return isNotificationsSettingsError ? 'error' : 'loading';
    }
    return syncedSettings === notificationsSettings ? 'ready' : 'loading';
  };

  const handleRetry = useCallback(() => {
    if (storeAvailability !== 'ready') {
      retryStore();
      return;
    }
    void refetchNotificationsSettings();
  }, [storeAvailability, retryStore, refetchNotificationsSettings]);

  return {
    storeId,
    notificationsSettings,
    loadState: getLoadState(),
    handleRetry,
    isRetrying: isNotificationsSettingsFetching,
  };
};
