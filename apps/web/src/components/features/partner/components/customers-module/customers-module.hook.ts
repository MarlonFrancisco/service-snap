'use client';

import { useStoresQuery } from '@/hooks/use-query/use-stores-query/use-stores-query.hook';
import { usePartnerStore } from '@/store/partner';
import { formatStorePrice } from '@repo/shared/formatters';
import { useCallback } from 'react';
import type { TCustomersStoreState } from './customers-module.types';

/**
 * Loja ativa, papel de quem está logado e moeda. Clientes é só de dono e
 * gerente: o profissional nem chega a pedir a lista.
 */
export const useCustomersAccess = () => {
  const storeId = usePartnerStore((state) => state.activeStore?.id) ?? '';
  const currency = usePartnerStore((state) => state.activeStore?.currency);
  const country = usePartnerStore((state) => state.activeStore?.country);
  const { stores, isPendingStores, isError: isStoresError } = useStoresQuery();

  // O papel vem na lista de lojas, não no detalhe da loja ativa
  const memberRole = stores.find((store) => store.id === storeId)?.memberRole;
  const isProfessional = memberRole === 'professional';

  const getStoreState = (): TCustomersStoreState => {
    if (storeId) return 'ready';
    if (isStoresError) return 'error';
    if (!isPendingStores && stores.length === 0) return 'no-store';
    return 'loading';
  };

  const formatMoney = useCallback(
    (value: number) => formatStorePrice(value, currency, country),
    [currency, country],
  );

  return {
    storeId,
    country,
    storeState: getStoreState(),
    isProfessional,
    formatMoney,
  };
};
