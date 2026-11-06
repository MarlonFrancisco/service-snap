import type { TCategoryCityLandingConfig } from '../../category-city-landing.types';

export type TCategoryCityTrackerConfig = {
  status: TCategoryCityLandingConfig['status'];
  categoryName: string;
  city: string;
  storeIds: string[];
};
