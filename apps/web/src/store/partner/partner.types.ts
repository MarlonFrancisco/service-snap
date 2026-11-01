import { IStore } from '@/types/api/stores.types';

export type TModuleId =
  | 'dashboard'
  | 'sales'
  | 'operational'
  | 'customers'
  | 'stores'
  | 'services'
  | 'agenda'
  | 'plans'
  | 'notifications';

export interface IPartnerStore {
  activeStore: IStore;

  // Actions
  setActiveStore: (store: IStore) => Promise<void>;
}
