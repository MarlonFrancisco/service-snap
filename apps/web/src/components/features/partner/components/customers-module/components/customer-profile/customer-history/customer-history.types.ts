import type { TAppointmentStatusBadge } from '../../../customers-module.types';

export type TCustomerHistoryRow = {
  id: string;
  day: string;
  time: string;
  service: string;
  professional: string;
  status: TAppointmentStatusBadge;
};

export type TCustomerHistoryConfig = {
  rows: TCustomerHistoryRow[];
  rangeLabel: string;
  hasPrevious: boolean;
  hasNext: boolean;
  onPrevious: () => void;
  onNext: () => void;
  isLoading: boolean;
  isError: boolean;
  isRefreshing: boolean;
  onRetry: () => void;
};
