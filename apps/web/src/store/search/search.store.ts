import { create } from 'zustand';
import {
  setMobileDrawerOpenAction,
  setSelectedStoreAction,
} from './search.actions';
import { ISearchStore } from './search.types';

const useSearchStore = create<ISearchStore>()((set, get) => ({
  mobileDrawerOpen: false,
  selectedStore: undefined,

  setMobileDrawerOpen: setMobileDrawerOpenAction(set, get),
  setSelectedStore: setSelectedStoreAction(set, get),
}));

export default useSearchStore;
