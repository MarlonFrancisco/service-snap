'use client';

import { useServicePackagesQuery } from '@/hooks/partner/use-packages-query';
import { CategoryService } from '@/service/partner/category';
import { usePartnerStore } from '@/store/partner';
import type { IServicePackage } from '@/types/api/packages.types';
import { CACHE_QUERY_KEYS } from '@/utils/helpers/query.helper';
import { useQuery } from '@tanstack/react-query';
import { useCallback, useMemo, useState } from 'react';
import { useCustomersAccess } from '../customers-module/customers-module.hook';
import {
  formatValidity,
  getPackageChip,
  getPackageItemsLabel,
} from './packages-module.helpers';
import type { TPackageRow, TRetentionView } from './packages-module.types';

/**
 * Loja ativa, papel, moeda e fuso. Pacotes, fidelidade e campanhas são
 * telas de dono e gerente: o profissional nem chega a pedir os dados.
 */
export const useRetentionAccess = () => {
  const access = useCustomersAccess();
  const timeZone = usePartnerStore((state) => state.activeStore?.timezone);
  const storeName = usePartnerStore((state) => state.activeStore?.name) ?? '';

  return { ...access, timeZone, storeName };
};

/** Serviços da loja, para montar pacote e regra de fidelidade. */
export const useStoreServiceOptions = (storeId: string, enabled = true) => {
  const { data: categories, isPending } = useQuery({
    queryKey: CACHE_QUERY_KEYS.categories(storeId),
    queryFn: () => CategoryService.getAll(storeId),
    enabled: enabled && !!storeId,
  });

  const serviceOptions = useMemo(
    () =>
      (categories ?? [])
        .flatMap((category) => category.services)
        .map((service) => ({
          id: service.id,
          name: service.name,
          isActive: service.isActive,
        }))
        .sort((a, b) => a.name.localeCompare(b.name, 'pt-BR')),
    [categories],
  );

  return {
    serviceOptions,
    isLoadingServices: enabled && !!storeId && isPending,
  };
};

type TPackageFormTarget = { servicePackage: IServicePackage | null } | null;

export const usePackagesModule = () => {
  const { storeId, storeState, isProfessional, formatMoney } =
    useRetentionAccess();
  const [formTarget, setFormTarget] = useState<TPackageFormTarget>(null);
  const [sellTarget, setSellTarget] = useState<IServicePackage | null>(null);
  const canQuery = storeState === 'ready' && !isProfessional;

  const {
    packages,
    isLoadingPackages,
    isFetchingPackages,
    isPackagesError,
    isPackagesForbidden,
    refetchPackages,
  } = useServicePackagesQuery({ storeId, enabled: canQuery });

  const rows = useMemo<TPackageRow[]>(
    () =>
      packages.map((servicePackage) => ({
        id: servicePackage.id,
        name: servicePackage.name,
        summary: `${getPackageItemsLabel(servicePackage)} · ${formatValidity(servicePackage.validityDays)}`,
        price: formatMoney(servicePackage.price),
        chip: getPackageChip(servicePackage.isActive),
        isActive: servicePackage.isActive,
        source: servicePackage,
      })),
    [packages, formatMoney],
  );

  const getView = (): TRetentionView => {
    if (storeState === 'no-store') return 'no-store';
    if (isProfessional || isPackagesForbidden) return 'no-access';
    if (storeState === 'error' || isPackagesError) return 'error';
    if (storeState === 'loading' || isLoadingPackages) return 'loading';
    return 'ready';
  };

  const handleCreate = useCallback(
    () => setFormTarget({ servicePackage: null }),
    [],
  );

  const handleEdit = useCallback(
    (servicePackage: IServicePackage) => setFormTarget({ servicePackage }),
    [],
  );

  const handleFormOpenChange = useCallback((isOpen: boolean) => {
    if (!isOpen) setFormTarget(null);
  }, []);

  const handleSellOpenChange = useCallback((isOpen: boolean) => {
    if (!isOpen) setSellTarget(null);
  }, []);

  const handleRetry = useCallback(() => {
    void refetchPackages();
  }, [refetchPackages]);

  return {
    storeId,
    view: getView(),
    rows,
    isRetrying: isFetchingPackages,
    handleRetry,
    handleCreate,
    handleEdit,
    handleSell: setSellTarget,
    formTarget,
    handleFormOpenChange,
    sellTarget,
    handleSellOpenChange,
  };
};
