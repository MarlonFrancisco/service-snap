import type { TFormatMoney } from '../../../cash-module.types';

export type TCashSessionDialogConfig = {
  storeId: string;
  /** Caixa a mostrar; `null` deixa o diálogo fechado. */
  sessionId: string | null;
  onClose: () => void;
  formatMoney: TFormatMoney;
};

export type TCashSessionDetailRow = {
  label: string;
  value: string;
  isTotal?: boolean;
};
