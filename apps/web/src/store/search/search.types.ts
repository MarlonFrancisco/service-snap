import { IStore } from '@/types/api/stores.types';

export interface IStoreSearchListItem
  extends Omit<
    IStore,
    | 'ownerId'
    | 'createdAt'
    | 'notificationsHistory'
    | 'notificationsSettings'
    | 'storeMembers'
    | 'schedules'
    | 'categories'
    | 'lunchStartTime'
    | 'lunchEndTime'
    | 'gallery'
  > {
  gallery: string[];
  price: string;
  averagePrice: string | null;
  location: string;
  rating: number;
  reviewCount: number;
}

export interface ISearchStore {
  mobileDrawerOpen: boolean;
  setMobileDrawerOpen: (isOpen: boolean) => void;

  selectedStore?: IStoreSearchListItem;
  setSelectedStore: (store: IStoreSearchListItem) => void;
}
