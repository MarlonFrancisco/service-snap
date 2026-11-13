import type { TFormatMoney } from '../../../cash-module.types';

export type TOpenCashDialogConfig = {
  storeId: string;
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  formatMoney: TFormatMoney;
};

export type TUseOpenCashDialogConfig = Omit<
  TOpenCashDialogConfig,
  'formatMoney'
>;
