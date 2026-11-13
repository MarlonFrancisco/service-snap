'use client';

import {
  useCustomersQuery,
  useCustomersSearchTerm,
  useCustomerTagsQuery,
} from '@/hooks/partner/use-customers-query';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useCustomersAccess } from '../../customers-module.hook';
import {
  CUSTOMER_ROW_TAGS,
  CUSTOMERS_PAGE_SIZE,
  formatCustomersCount,
  formatDay,
  formatPageRange,
  getCustomerContactLines,
  getCustomerName,
} from '../../customers-module.helpers';
import type { TCustomerRow } from './customers-table';

export const useCustomersList = () => {
  const { storeId, country, storeState, isProfessional, formatMoney } =
    useCustomersAccess();
  const [searchInput, setSearchInput] = useState('');
  const [tag, setTag] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [isNewCustomerOpen, setIsNewCustomerOpen] = useState(false);
  const search = useCustomersSearchTerm(searchInput);

  const canQuery = storeState === 'ready' && !isProfessional;

  // Busca, etiqueta ou loja nova voltam para a primeira página
  useEffect(() => {
    setPage(1);
  }, [search, tag, storeId]);

  // A etiqueta de outra loja não vale aqui
  useEffect(() => {
    setTag(null);
  }, [storeId]);

  const {
    customers,
    customersMeta,
    isLoadingCustomers,
    isFetchingCustomers,
    isCustomersError,
    isCustomersForbidden,
    refetchCustomers,
  } = useCustomersQuery({
    storeId,
    page,
    limit: CUSTOMERS_PAGE_SIZE,
    search,
    tag: tag ?? undefined,
    enabled: canQuery,
  });
  const { tags } = useCustomerTagsQuery({ storeId, enabled: canQuery });

  const rows = useMemo<TCustomerRow[]>(
    () =>
      customers.map((customer) => ({
        id: customer.id,
        name: getCustomerName(customer),
        href: `/partner/clientes/${customer.id}`,
        contact: getCustomerContactLines(customer, country),
        visits: customer.visits,
        lastVisit: formatDay(customer.lastVisit) || 'Ainda não veio',
        isLastVisitEmpty: !customer.lastVisit,
        nextVisit: formatDay(customer.nextVisit) || 'Sem horário marcado',
        isNextVisitEmpty: !customer.nextVisit,
        totalSpent: formatMoney(customer.totalSpent),
        tags: customer.tags.slice(0, CUSTOMER_ROW_TAGS),
        hiddenTags: Math.max(customer.tags.length - CUSTOMER_ROW_TAGS, 0),
      })),
    [customers, country, formatMoney],
  );

  const totalPages = customersMeta?.totalPages ?? 1;
  const total = customersMeta?.total ?? 0;
  const hasActiveFilters = !!search || !!tag;

  const handleTagChange = useCallback((nextTag: string | null) => {
    setTag(nextTag);
  }, []);

  const clearFilters = useCallback(() => {
    setSearchInput('');
    setTag(null);
  }, []);

  const handleRetry = useCallback(() => {
    void refetchCustomers();
  }, [refetchCustomers]);

  return {
    storeId,
    storeState,
    hasNoAccess: isProfessional || isCustomersForbidden,
    searchInput,
    setSearchInput,
    tags,
    activeTag: tag,
    handleTagChange,
    hasActiveFilters,
    clearFilters,
    rows,
    countLabel: customersMeta ? formatCustomersCount(total) : null,
    rangeLabel: formatPageRange(customersMeta, CUSTOMERS_PAGE_SIZE),
    hasPrevious: page > 1,
    hasNext: page < totalPages,
    goToPrevious: () => setPage((current) => Math.max(1, current - 1)),
    goToNext: () => setPage((current) => Math.min(totalPages, current + 1)),
    isLoading: storeState === 'loading' || isLoadingCustomers,
    isError:
      storeState === 'error' || (isCustomersError && !isCustomersForbidden),
    isRefreshing: isFetchingCustomers && !isLoadingCustomers,
    handleRetry,
    isNewCustomerOpen,
    setIsNewCustomerOpen,
  };
};
