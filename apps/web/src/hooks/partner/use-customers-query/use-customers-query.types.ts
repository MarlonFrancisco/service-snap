import type { TCustomerQuery } from '@/types/api/customers.types';

export type TUseCustomersQueryConfig = TCustomerQuery & {
  storeId?: string;
  enabled?: boolean;
};

export type TUseCustomerQueryConfig = {
  storeId?: string;
  userId?: string;
  enabled?: boolean;
};

export type TUseCustomerHistoryQueryConfig = TUseCustomerQueryConfig & {
  page: number;
  limit?: number;
};
