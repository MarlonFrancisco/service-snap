import { IStore } from '@/types/api/stores.types';

export interface IPartnerStore {
  activeStore: IStore;

  // Actions
  setActiveStore: (store: IStore) => Promise<void>;
}
