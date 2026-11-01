import { create } from 'zustand';
import {
  setCategoriesAction,
  setCategoryModalParamsAction,
  setFilterCategoryAction,
  setSearchQueryAction,
  setServiceModalParamsAction,
  setServicesAction,
} from './services.actions';
import { INITIAL_CATEGORY, INITIAL_SERVICE } from './services.constants';
import type { IServicesStore } from './services.types';

export const useServicesStore = create<IServicesStore>((set, get) => ({
  // State
  isCategoryModalOpen: false,
  category: INITIAL_CATEGORY,
  service: INITIAL_SERVICE,
  services: [],
  categories: [],
  searchQuery: '',
  filterCategory: 'all',
  isServiceModalOpen: false,

  // Actions
  setCategoryModalParams: setCategoryModalParamsAction(set, get),
  setSearchQuery: setSearchQueryAction(set, get),
  setFilterCategory: setFilterCategoryAction(set, get),
  setServiceModalParams: setServiceModalParamsAction(set, get),
  setServices: setServicesAction(set, get),
  setCategories: setCategoriesAction(set, get),
}));
