'use client';

import { useAgendaMemberRole } from '@/hooks/partner/use-agenda-member-role';
import { useStoresQuery } from '@/hooks/use-query/use-stores-query/use-stores-query.hook';
import { usePartnerStore } from '@/store/partner';
import { formatStorePrice } from '@repo/shared/formatters';
import { useCallback, useMemo } from 'react';
import { buildMemberNames } from './cash-module.helpers';
import type { TManagementStoreState } from './cash-module.types';

/**
 * Loja ativa, papel de quem está logado, moeda e nomes da equipe. Caixa,
 * comissões e fechamento partem daqui.
 */
export const useManagementAccess = () => {
  const storeId = usePartnerStore((state) => state.activeStore?.id) ?? '';
  const currency = usePartnerStore((state) => state.activeStore?.currency);
  const country = usePartnerStore((state) => state.activeStore?.country);
  const storeMembers = usePartnerStore(
    (state) => state.activeStore?.storeMembers,
  );
  const storeServices = usePartnerStore((state) => state.activeStore?.services);
  const { stores, isPendingStores, isError: isStoresError } = useStoresQuery();
  const { role, isProfessional, canManageStore, ownMember } =
    useAgendaMemberRole();

  const getStoreState = (): TManagementStoreState => {
    if (storeId) return 'ready';
    if (isStoresError) return 'error';
    if (!isPendingStores && stores.length === 0) return 'no-store';
    return 'loading';
  };

  const formatMoney = useCallback(
    (value: number) => formatStorePrice(value, currency, country),
    [currency, country],
  );

  const memberNames = useMemo(
    () => buildMemberNames(storeMembers),
    [storeMembers],
  );

  return {
    storeId,
    storeState: getStoreState(),
    role,
    isProfessional,
    canManage: canManageStore,
    ownMember,
    storeMembers: storeMembers ?? [],
    storeServices: storeServices ?? [],
    memberNames,
    formatMoney,
  };
};
