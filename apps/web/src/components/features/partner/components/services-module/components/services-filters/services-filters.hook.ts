import { useServicesStore } from '@/store';
import type { ChangeEvent } from 'react';
import { ALL_CATEGORIES_FILTER } from '../../utils/services-sections';

export const useServicesFilters = () => {
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

  const handleSearchChange = (event: ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(event.target.value);
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
    setFilterCategory,
    handleSearchChange,
    handleClearFilters,
    handleManageCategories,
    handleAddService,
  };
};
