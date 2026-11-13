import type { ICashSessionDetail } from '@/types/api/cash.types';
import type { TFormatMoney } from '../../../cash-module.types';

export type TCloseCashDialogConfig = {
  storeId: string;
  session: ICashSessionDetail;
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  formatMoney: TFormatMoney;
};

export type TCashDifferenceTone = 'success' | 'warning' | 'info';

/** Diferença entre o contado e o esperado, já pronta para a nota. */
export type TCashDifference = {
  tone: TCashDifferenceTone;
  title: string;
  description: string;
};
