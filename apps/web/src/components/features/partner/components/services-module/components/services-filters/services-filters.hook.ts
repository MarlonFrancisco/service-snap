import { useAnalytics } from '@/providers/analytics.provider';
import { useServicesStore } from '@/store';
import type { ChangeEvent } from 'react';
import { ALL_CATEGORIES_FILTER } from '../../utils/services-sections';

export const useServicesFilters = () => {
  const analytics = useAnalytics();
  const searchQuery = useServicesStore((state) => state.searchQuery);
  const categories = useServicesStore((state) => state.categories);
  const filterCategory = useServicesStore((state) => state.filterCategory);
  const setSearchQuery = useServicesStore((state) => state.setSearchQuery);
  const setFilterCategory = useServicesStore(
    (state) => state.setFilterCategory,
  );
  const setCategoryModalParams = useServicesStore(
    (state) => state.setCategoryModalParams,
  );
  const setServiceModalParams = useServicesStore(
    (state) => state.setServiceModalParams,
  );

  const hasActiveFilters =
    searchQuery !== '' || filterCategory !== ALL_CATEGORIES_FILTER;

  const hasCategoryFilter = filterCategory !== ALL_CATEGORIES_FILTER;

  const handleSearchChange = (event: ChangeEvent<HTMLInputElement>) => {
    const { value } = event.target;

    // Só a transição vazio → preenchido conta; cada tecla não é um evento.
    if (searchQuery === '' && value !== '') {
      analytics.track('services_filtered', {
        has_query: true,
        has_category: hasCategoryFilter,
      });
    }

    setSearchQuery(value);
  };

  const handleFilterCategoryChange = (category: string) => {
    if (category !== filterCategory) {
      analytics.track('services_filtered', {
        has_query: searchQuery !== '',
        has_category: category !== ALL_CATEGORIES_FILTER,
      });
    }

    setFilterCategory(category);
  };

  const handleClearFilters = () => {
    setSearchQuery('');
    setFilterCategory(ALL_CATEGORIES_FILTER);
  };

  const handleManageCategories = () => {
    setCategoryModalParams({ isOpen: true });
  };

  const handleAddService = () => {
    setServiceModalParams({ isOpen: true });
  };

  return {
    searchQuery,
    categories,
    filterCategory,
    hasActiveFilters,
    setFilterCategory: handleFilterCategoryChange,
    handleSearchChange,
    handleClearFilters,
    handleManageCategories,
    handleAddService,
  };
};
