import type { IStorePayment } from '@/types/api/cash.types';
import type { TFormatMoney } from '../../../cash-module.types';

export type TVoidPaymentDialogConfig = {
  storeId: string;
  /** Pagamento a estornar; `null` deixa o diálogo fechado. */
  payment: IStorePayment | null;
  onClose: () => void;
  formatMoney: TFormatMoney;
};
