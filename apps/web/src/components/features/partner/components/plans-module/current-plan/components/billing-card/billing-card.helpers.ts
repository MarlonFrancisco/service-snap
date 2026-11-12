import type { IInvoice, IMySubscription } from '@/types/api/payment.types';
import { formatPlanDate, formatPlanPrice } from '../../../plans-module.utils';
import type { TBillingCharge } from './billing-card.types';

/** Última fatura de verdade; rascunho do Stripe não conta. */
export const getLatestInvoice = (
  invoices: readonly IInvoice[] = [],
): IInvoice | undefined =>
  [...invoices]
    .filter((invoice) => invoice.status !== 'draft')
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .at(0);

/** Cobrança recusada pendente ou a próxima cobrança do plano. */
export const getBillingCharge = (
  plan: IMySubscription | undefined,
  failedInvoice: IInvoice | undefined,
): TBillingCharge | null => {
  if (!plan) return null;

  if (failedInvoice) {
    const amount = formatPlanPrice(
      Number(failedInvoice.amount) || 0,
      plan.currency,
    );

    return {
      label: 'Cobrança pendente',
      value: `${amount} desde ${formatPlanDate(failedInvoice.date)}`,
    };
  }

  const nextDate = formatPlanDate(plan.nextBillingDate);

  if (plan.cancelAtPeriodEnd || !nextDate) return null;

  return {
    label: 'Próxima cobrança',
    value: `${formatPlanPrice(plan.price, plan.currency)} em ${nextDate}`,
  };
};
