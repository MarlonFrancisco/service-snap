import type { TPaymentsQuery } from '@/types/api/cash.types';

export type TUseCashQueryConfig = {
  storeId?: string;
  enabled?: boolean;
};

export type TUseCashSessionsQueryConfig = TUseCashQueryConfig & {
  page: number;
};

export type TUseCashSessionQueryConfig = TUseCashQueryConfig & {
  sessionId?: string | null;
};

export type TUsePaymentsQueryConfig = TUseCashQueryConfig & {
  query: TPaymentsQuery;
};
