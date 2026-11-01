import { create } from 'zustand';
import { INITIAL_STORE } from '../admin/stores/stores.constants';
import { setActiveStoreAction } from './partner.actions';
import type { IPartnerStore } from './partner.types';

export const usePartnerStore = create<IPartnerStore>((set, get) => ({
  activeStore: INITIAL_STORE,
  setActiveStore: setActiveStoreAction(set, get),
}));
