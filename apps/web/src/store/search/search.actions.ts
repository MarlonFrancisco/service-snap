import { TStoreAction } from '@/types/store.types';
import { ISearchStore, IStoreSearchListItem } from './search.types';

export const setMobileDrawerOpenAction: TStoreAction<ISearchStore, boolean> =
  (set) => async (isOpen) => {
    set({ mobileDrawerOpen: isOpen });
  };

export const setSelectedStoreAction: TStoreAction<
  ISearchStore,
  IStoreSearchListItem
> = (set) => async (selectedStore) => {
  set({ selectedStore });
};
