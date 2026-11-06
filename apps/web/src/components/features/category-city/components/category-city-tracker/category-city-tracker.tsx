'use client';

import { useCategoryCityTracker } from './category-city-tracker.hook';
import type { TCategoryCityTrackerConfig } from './category-city-tracker.types';

/** Só efeitos de analytics: a página em si continua server component. */
export const CategoryCityTracker = (config: TCategoryCityTrackerConfig) => {
  useCategoryCityTracker(config);

  return null;
};
