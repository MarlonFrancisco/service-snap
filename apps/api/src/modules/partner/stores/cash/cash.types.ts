/** Como a loja recebeu, fora do app: o ServiceSnap não cobra o cliente. */
export const PAYMENT_METHODS = [
  'cash',
  'pix',
  'credit_card',
  'debit_card',
  'other',
] as const;

export type TPaymentMethod = (typeof PAYMENT_METHODS)[number];

export type TPaymentTotals = Record<TPaymentMethod, number>;

export type TCashSessionSummary = {
  totals: TPaymentTotals;
  received: number;
  paymentsCount: number;
  /** Abertura + dinheiro recebido: o que deveria estar na gaveta. */
  expectedCash: number;
};

/** O que vem junto quando um pagamento nasce de um fechamento ou de uma venda. */
export type TPaymentLinks = {
  checkoutId?: string | null;
  customerPackageId?: string | null;
  customerId?: string | null;
};
