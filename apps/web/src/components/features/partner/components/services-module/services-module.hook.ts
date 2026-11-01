import { useStoresQuery } from '@/hooks/use-query/use-stores-query/use-stores-query.hook';
import { CategoryService } from '@/service/partner/category';
import { usePartnerStore, useServicesStore } from '@/store';
import { CACHE_QUERY_KEYS } from '@/utils/helpers/query.helper';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useEffect, useMemo } from 'react';
import type { TServicesView } from './services-module.types';
import {
  ALL_CATEGORIES_FILTER,
  buildServiceSections,
  formatServiceCount,
} from './utils/services-sections';

export const useServicesModule = () => {
  const searchQuery = useServicesStore((state) => state.searchQuery);
  const filterCategory = useServicesStore((state) => state.filterCategory);
  const setSearchQuery = useServicesStore((state) => state.setSearchQuery);
  const setFilterCategory = useServicesStore(
    (state) => state.setFilterCategory,
  );
  const setServiceModalParams = useServicesStore(
    (state) => state.setServiceModalParams,
  );
  const setServices = useServicesStore((state) => state.setServices);
  const setCategories = useServicesStore((state) => state.setCategories);
  const activeStore = usePartnerStore((state) => state.activeStore);

  const queryClient = useQueryClient();
  const {
    stores,
    isPendingStores,
    isError: isStoresError,
  } = useStoresQuery();

  const {
    data: categories,
    isError: isCategoriesError,
    isFetching,
    refetch,
  } = useQuery({
    queryKey: CACHE_QUERY_KEYS.categories(activeStore.id),
    queryFn: () => CategoryService.getAll(activeStore.id),
    enabled: !!activeStore?.id,
  });

  useEffect(() => {
    if (!categories) return;

    setCategories(categories);
    setServices(
      categories.flatMap((category) =>
        category.services.map((service) => ({
          ...service,
          category,
        })),
      ),
    );
  }, [categories, setCategories, setServices]);

  // A categoria filtrada pode deixar de existir ao excluí-la ou ao trocar de loja.
  useEffect(() => {
    if (
      categories &&
      filterCategory !== ALL_CATEGORIES_FILTER &&
      !categories.some((category) => category.id === filterCategory)
    ) {
      setFilterCategory(ALL_CATEGORIES_FILTER);
    }
  }, [categories, filterCategory, setFilterCategory]);

  const sections = useMemo(
    () =>
      buildServiceSections({
        categories: categories ?? [],
        searchQuery,
        filterCategory,
      }),
    [categories, searchQuery, filterCategory],
  );

  const allServices = useMemo(
    () => (categories ?? []).flatMap((category) => category.services),
    [categories],
  );

  const totalServices = allServices.length;
  const activeServices = allServices.filter(
    (service) => service.isActive,
  ).length;
  const visibleServices = sections.reduce(
    (total, section) => total + section.services.length,
    0,
  );
  const isFiltering =
    searchQuery.trim() !== '' || filterCategory !== ALL_CATEGORIES_FILTER;

  const getView = (): TServicesView => {
    if (!activeStore.id) {
      if (isPendingStores) return 'loading';
      if (isStoresError) return 'error';
      return stores.length === 0 ? 'no-store' : 'loading';
    }
    if (!categories) return isCategoriesError ? 'error' : 'loading';
    if (totalServices === 0 && !isFiltering) return 'empty';
    return sections.length === 0 ? 'no-results' : 'list';
  };

  const getResultsLabel = () => {
    if (!isFiltering) return '';
    if (visibleServices === 0) return 'Nenhum serviço encontrado';

    return `${formatServiceCount(visibleServices)} ${
      visibleServices === 1 ? 'encontrado' : 'encontrados'
    }`;
  };

  const handleAddService = () => {
    setServiceModalParams({ isOpen: true });
  };

  const handleClearFilters = () => {
    setSearchQuery('');
    setFilterCategory(ALL_CATEGORIES_FILTER);
  };

  const handleRetry = () => {
    if (activeStore.id) {
      refetch();
      return;
    }

    queryClient.invalidateQueries({ queryKey: CACHE_QUERY_KEYS.stores() });
  };

  return {
    view: getView(),
    storeName: activeStore.name,
    sections,
    totalServices,
    activeServices,
    resultsLabel: getResultsLabel(),
    isRetrying: isFetching,
    handleAddService,
    handleClearFilters,
    handleRetry,
  };
};
