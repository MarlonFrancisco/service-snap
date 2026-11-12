import type { IPage } from '@/types/api/pagination.types';
import type { TAppointmentStatus } from '@/types/api/schedule.types';

/** Situação da loja ativa antes de carregar os clientes. */
export type TCustomersStoreState = 'loading' | 'ready' | 'no-store' | 'error';

export type TCustomerContactLines = {
  primary: string;
  secondary: string;
};

export type TAppointmentStatusBadge = {
  label: string;
  className: string;
};

export type TAppointmentStatusBadgeMap = Record<
  TAppointmentStatus,
  TAppointmentStatusBadge
>;

export type TPageMeta = IPage<unknown>['meta'];
