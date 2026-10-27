'use client';

import { useStoreQuery } from '@/hooks/use-query/use-store-query';
import { useStoresQuery } from '@/hooks/use-query/use-stores-query/use-stores-query.hook';
import { usePartnerStore } from '@/store/partner';
import { useCallback, useEffect, useMemo, useState } from 'react';

const DISMISS_KEY = 'ssnap.partner-onboarding.dismissed';

export type TOnboardingStep = {
  id: 'store' | 'service' | 'professional';
  label: string;
  href: string;
  done: boolean;
};

export const useOnboardingChecklist = () => {
  const { stores, isPendingStores } = useStoresQuery();
  const activeStore = usePartnerStore((state) => state.activeStore);
  const storeId = activeStore?.id || stores[0]?.id || '';
  const { store } = useStoreQuery({ storeId });

  const [ready, setReady] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    try {
      setDismissed(window.localStorage.getItem(DISMISS_KEY) === '1');
    } catch {
      setDismissed(false);
    }
    setReady(true);
  }, []);

  const hasStore = stores.length > 0;
  const hasService = (store?.services?.length || 0) > 0;
  const hasProfessional = (store?.storeMembers?.length || 0) > 0;

  const steps = useMemo<TOnboardingStep[]>(
    () => [
      {
        id: 'store',
        label: 'Criar sua primeira loja',
        href: '/partner/stores',
        done: hasStore,
      },
      {
        id: 'service',
        label: 'Cadastrar um serviço',
        href: '/partner/services',
        done: hasService,
      },
      {
        id: 'professional',
        label: 'Adicionar um profissional',
        href: '/partner/stores',
        done: hasProfessional,
      },
    ],
    [hasStore, hasService, hasProfessional],
  );

  const completedCount = steps.filter((step) => step.done).length;
  const isComplete = completedCount === steps.length;
  const isVisible = ready && !isPendingStores && !dismissed && !isComplete;

  const handleDismiss = useCallback(() => {
    try {
      window.localStorage.setItem(DISMISS_KEY, '1');
    } catch {
      // ignore quota / private mode
    }
    setDismissed(true);
  }, []);

  return {
    steps,
    completedCount,
    totalCount: steps.length,
    isVisible,
    handleDismiss,
  };
};
