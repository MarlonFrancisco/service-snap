import {
  roundMoney,
  splitMoney,
  sumMoney,
} from '../../../../utils/helpers/money.helpers';
import type { TCheckoutLine, TCheckoutTotals } from './checkout.types';

/**
 * Totais da visita. Atendimento de pacote não entra no subtotal e tem como base
 * de comissão o valor da sessão; os demais dividem o valor recebido na
 * proporção do preço (com desconto, a comissão segue o que entrou de fato).
 */
export const calculateCheckout = (
  lines: TCheckoutLine[],
  discount: number,
  received: number,
): TCheckoutTotals => {
  const charged = lines.filter((line) => line.sessionValue === null);
  const subtotal = sumMoney(charged.map((line) => line.price));
  const shares = splitMoney(
    received,
    charged.map((line) => line.price),
  );
  let next = 0;

  return {
    subtotal,
    discount: roundMoney(Math.min(discount, subtotal)),
    total: roundMoney(Math.max(subtotal - discount, 0)),
    received,
    baseAmounts: lines.map((line) =>
      line.sessionValue === null ? shares[next++] : line.sessionValue,
    ),
  };
};
