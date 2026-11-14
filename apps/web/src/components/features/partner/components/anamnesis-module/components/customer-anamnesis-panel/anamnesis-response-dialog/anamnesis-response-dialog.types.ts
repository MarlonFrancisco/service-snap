import type { TCustomerAnamnesisRow } from '../customer-anamnesis-panel.types';

export type TAnamnesisResponseDialogConfig = {
  storeId: string;
  customerId: string;
  /** Ficha aberta; `null` fecha a janela. */
  row: TCustomerAnamnesisRow | null;
  canDelete: boolean;
  onClose: () => void;
};

/** Pergunta e resposta prontas para ler. */
export type TAnamnesisAnswerRow = {
  id: string;
  label: string;
  answer: string;
  isEmpty: boolean;
};
