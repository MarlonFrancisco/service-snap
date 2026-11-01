import { ICategory, IService } from '@/types/api/service.types';
import { TStoreAction } from '@/types/store.types';
import { INITIAL_CATEGORY, INITIAL_SERVICE } from './services.constants';
import { IServicesStore } from './services.types';

export const setCategoryModalParamsAction: TStoreAction<
  IServicesStore,
  { isOpen: boolean; category?: ICategory }
> =
  (set) =>
  async ({ isOpen, category }) => {
    set({
      isCategoryModalOpen: isOpen,
      category: category || INITIAL_CATEGORY,
    });
  };

export const setSearchQueryAction: TStoreAction<IServicesStore, string> =
  (set) => async (searchQuery) => {
    set({ searchQuery });
  };

export const setFilterCategoryAction: TStoreAction<IServicesStore, string> =
  (set) => async (filterCategory) => {
    set({ filterCategory });
  };

export const setServiceModalParamsAction: TStoreAction<
  IServicesStore,
  { isOpen: boolean; service?: IService }
> =
  (set) =>
  async ({ isOpen, service }) => {
    set({
      isServiceModalOpen: isOpen,
      service: service || INITIAL_SERVICE,
    });
  };

export const setServicesAction: TStoreAction<IServicesStore, IService[]> =
  (set) => async (services) => {
    set({ services });
  };

export const setCategoriesAction: TStoreAction<IServicesStore, ICategory[]> =
  (set) => async (categories) => {
    set({ categories });
  };
