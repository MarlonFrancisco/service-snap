import { sumMoney } from '../../../../utils/helpers/money.helpers';
import {
  PAYMENT_METHODS,
  type TCashSessionSummary,
  type TPaymentTotals,
} from './cash.types';
import type { StorePayment } from './store-payment.entity';

/** Totais por forma de pagamento, sem os estornados. */
export const summarizePayments = (
  payments: Pick<StorePayment, 'method' | 'amount' | 'voidedAt'>[],
  openingAmount = 0,
): TCashSessionSummary => {
  const valid = payments.filter((payment) => !payment.voidedAt);
  const totals = Object.fromEntries(
    PAYMENT_METHODS.map((method) => [
      method,
      sumMoney(
        valid
          .filter((payment) => payment.method === method)
          .map((payment) => payment.amount),
      ),
    ]),
  ) as TPaymentTotals;

  return {
    totals,
    received: sumMoney(valid.map((payment) => payment.amount)),
    paymentsCount: valid.length,
    expectedCash: sumMoney([openingAmount, totals.cash]),
  };
};
