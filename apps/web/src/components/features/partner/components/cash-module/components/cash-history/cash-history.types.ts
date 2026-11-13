/** Linha do histórico de caixas, já formatada. */
export type TCashHistoryRow = {
  id: string;
  openedAt: string;
  closedAt: string | null;
  openingAmount: string;
  received: string;
  expectedCash: string;
  countedCash: string;
  difference: string;
  differenceTone: 'ok' | 'warning' | 'info' | 'neutral';
};
