import type { ICategory, IService } from '@/types/api/service.types';

export type TServiceSection = {
  category: ICategory;
  services: IService[];
  activeCount: number;
};

export type TServicesView =
  | 'loading'
  | 'error'
  | 'no-store'
  | 'empty'
  | 'no-results'
  | 'list';
