'use client';

import { useStoresQuery } from '@/hooks/use-query/use-stores-query/use-stores-query.hook';
import type { IService } from '@/types/api/service.types';
import type { IProfessional } from '@/types/api/users.types';
import { usePartnerStore } from '@/store/partner';
import { useMemo } from 'react';
import type {
  TAnamnesisServiceOption,
  TAnamnesisStoreState,
} from './anamnesis-module.types';

const EMPTY_SERVICES: IService[] = [];
const EMPTY_MEMBERS: IProfessional[] = [];

/**
 * Loja ativa e papel de quem está logado. Formulários e exclusão são de dono
 * e gerente; a equipe toda gera o link e vê a lista.
 */
export const useAnamnesisAccess = () => {
  const storeId = usePartnerStore((state) => state.activeStore?.id) ?? '';
  const storeName = usePartnerStore((state) => state.activeStore?.name) ?? '';
  const services = usePartnerStore(
    (state) => state.activeStore?.services ?? EMPTY_SERVICES,
  );
  const members = usePartnerStore(
    (state) => state.activeStore?.storeMembers ?? EMPTY_MEMBERS,
  );
  const { stores, isPendingStores, isError: isStoresError } = useStoresQuery();

  // O papel vem na lista de lojas, não no detalhe da loja ativa
  const memberRole = stores.find((store) => store.id === storeId)?.memberRole;
  const isManagement = memberRole === 'owner' || memberRole === 'manager';

  const serviceOptions = useMemo<TAnamnesisServiceOption[]>(
    () =>
      services
        .filter((service) => service.isActive !== false)
        .map(({ id, name }) => ({ id, name })),
    [services],
  );

  const getStoreState = (): TAnamnesisStoreState => {
    if (storeId) return 'ready';
    if (isStoresError) return 'error';
    if (!isPendingStores && stores.length === 0) return 'no-store';
    return 'loading';
  };

  return {
    storeId,
    storeName,
    members,
    serviceOptions,
    memberRole,
    isManagement,
    storeState: getStoreState(),
  };
};
