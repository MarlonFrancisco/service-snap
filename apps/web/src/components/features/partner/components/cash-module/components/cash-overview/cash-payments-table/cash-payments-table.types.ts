import type { IStorePayment } from '@/types/api/cash.types';

/** Linha da tabela já formatada. */
export type TCashPaymentRow = {
  id: string;
  time: string;
  customer: string;
  origin: string;
  method: string;
  amount: string;
  registeredBy: string;
  isVoided: boolean;
  voidReason: string | null;
  payment: IStorePayment;
};

export type TCashPaymentsTableConfig = {
  rows: TCashPaymentRow[];
  isRefreshing?: boolean;
  /** Sem a ação, a tabela só mostra (ex.: caixa já fechado). */
  onVoid?: (payment: IStorePayment) => void;
  label?: string;
};
