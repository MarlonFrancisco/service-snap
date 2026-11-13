'use client';

import { useCustomersSearchTerm } from '@/hooks/partner/use-customers-query';
import { useAdminStoresQuery } from '@/hooks/use-query/use-admin-query';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useAuditLogPager } from '../../../partner/components/audit-logs-module/audit-logs-module.hook';
import { ADMIN_PAGE_SIZE, toAdminStoreRow } from '../../admin.helpers';

export const useAdminStores = () => {
  const [searchInput, setSearchInput] = useState('');
  const [page, setPage] = useState(1);
  const [selectedStoreId, setSelectedStoreId] = useState<string | null>(null);
  const detailsHeadingRef = useRef<HTMLHeadingElement | null>(null);
  const search = useCustomersSearchTerm(searchInput);

  // Busca nova volta para a primeira página
  useEffect(() => {
    setPage(1);
  }, [search]);

  const {
    stores,
    storesMeta,
    isLoadingStores,
    isFetchingStores,
    isStoresError,
    refetchStores,
  } = useAdminStoresQuery({
    page,
    limit: ADMIN_PAGE_SIZE,
    search: search || undefined,
  });

  const rows = useMemo(() => stores.map(toAdminStoreRow), [stores]);
  const pager = useAuditLogPager(storesMeta, setPage);

  const handleSelect = useCallback((id: string) => {
    setSelectedStoreId(id);
    // No celular os detalhes ficam abaixo da lista
    requestAnimationFrame(() => detailsHeadingRef.current?.focus());
  }, []);

  return {
    searchInput,
    setSearchInput,
    hasSearch: !!search,
    clearSearch: () => setSearchInput(''),
    rows,
    selectedStoreId,
    handleSelect,
    detailsHeadingRef,
    isLoading: isLoadingStores,
    isError: isStoresError,
    isRefreshing: isFetchingStores && !isLoadingStores,
    handleRetry: () => void refetchStores(),
    ...pager,
  };
};
