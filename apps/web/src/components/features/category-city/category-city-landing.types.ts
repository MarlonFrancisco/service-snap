import type {
  TCategoryCityBusiness,
  TResolvedCategoryCity,
} from '@/utils/helpers/category-city.helper';

export type TCategoryCityLandingConfig = {
  resolved: TResolvedCategoryCity;
  status: 'ok' | 'unavailable';
  displayCity: string;
  stores: TCategoryCityBusiness[];
};
