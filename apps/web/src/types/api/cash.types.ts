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

/** Totais do caixa, sem os pagamentos estornados. */
export interface ICashSummary {
  totals: TPaymentTotals;
  received: number;
  paymentsCount: number;
  /** Troco inicial mais o dinheiro recebido: o que deveria estar na gaveta. */
  expectedCash: number;
}

/** Linha de `GET cash-sessions`: só o que foi gravado na sessão. */
export interface ICashSession {
  id: string;
  createdAt: string;
  openedAt: string;
  openedById: string | null;
  openedByName: string | null;
  openingAmount: number;
  closedAt: string | null;
  closedById: string | null;
  closedByName: string | null;
  countedCash: number | null;
  expectedCash: number | null;
  /** Por forma de pagamento, gravado no fechamento. */
  totals: TPaymentTotals | null;
  notes: string | null;
}

export interface IPaymentCustomer {
  id: string;
  firstName: string | null;
  lastName: string | null;
}

export interface IStorePayment {
  id: string;
  method: TPaymentMethod;
  amount: number;
  paidAt: string;
  registeredById: string | null;
  notes: string | null;
  voidedAt: string | null;
  voidedById: string | null;
  voidReason: string | null;
  customer: IPaymentCustomer | null;
  /** Só na listagem por período (`GET payments`). */
  checkout?: { id: string } | null;
  customerPackage?: { id: string; name: string } | null;
}

/** Caixa com os totais até agora (`current`) ou com os pagamentos (`findOne`). */
export interface ICashSessionDetail extends ICashSession {
  summary: ICashSummary;
  /** Contado menos esperado; `null` enquanto o caixa está aberto. */
  difference: number | null;
  payments?: IStorePayment[];
}

export interface ICashSessionsPage {
  data: ICashSession[];
  meta: { total: number; page: number; limit: number; totalPages: number };
}

export interface IPaymentsList {
  summary: ICashSummary;
  payments: IStorePayment[];
}

export type TPaymentInput = {
  method: TPaymentMethod;
  amount: number;
  notes?: string;
};

export type TRegisterPayment = TPaymentInput & { customerId?: string };

export type TOpenCashSession = { openingAmount: number };

export type TCloseCashSession = { countedCash: number; notes?: string };

/** Período em `YYYY-MM-DD`, no fuso da loja. */
export type TPaymentsQuery = {
  from: string;
  to: string;
  method?: TPaymentMethod;
};
