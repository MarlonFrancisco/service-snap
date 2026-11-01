import { IStore } from '@/types/api/stores.types';
import { TStoreAction } from '@/types/store.types';
import type { IPartnerStore } from './partner.types';

export const setActiveStoreAction: TStoreAction<IPartnerStore, IStore> =
  (set) => async (store) => {
    set({ activeStore: store });
  };
