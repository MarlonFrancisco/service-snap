import type { TFormatMoney } from '../../../cash-module.types';

export type TRegisterPaymentDialogConfig = {
  storeId: string;
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  formatMoney: TFormatMoney;
};

export type TUseRegisterPaymentDialogConfig = Omit<
  TRegisterPaymentDialogConfig,
  'formatMoney'
>;
