import type { TStoreAvailability } from '../notifications-module/notifications-module.types';

export type TReviewsFilter = 'unanswered' | 'answered' | 'all';

export type TReviewsFilterOption = {
  value: TReviewsFilter;
  label: string;
};

export type TReviewsLoadState = TStoreAvailability;

export type TReviewsSummary = {
  /** "★ 4,5", ou "—" sem avaliações. */
  averageLabel: string;
  total: number;
  unanswered: number;
};

export type TReviewsEmptyState = {
  title: string;
  description: string;
};
