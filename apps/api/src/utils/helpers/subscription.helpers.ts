import type { Stripe } from 'stripe';

export const getSubscriptionPeriodDate = (
  periodStart: number,
  periodEnd: number,
) => {
  const currentPeriodStart = new Date(periodStart * 1000);
  const currentPeriodEnd = new Date(periodEnd * 1000);

  return {
    currentPeriodStart,
    currentPeriodEnd,
  };
};

/**
 * Limite do plano: 0 é ilimitado. O Stripe guarda "UNLIMITED" no Enterprise, e o
 * `parseInt` disso dá NaN, que vira `null` no JSON e escapa de quem testa `=== 0`.
 */
export const parsePlanLimit = (value?: string): number => {
  const limit = parseInt(value || '0', 10);

  return Number.isNaN(limit) ? 0 : limit;
};

export const normalizeSubscriptionMetadata = (metadata: Stripe.Metadata) => {
  return {
    PRO_LIMIT: parsePlanLimit(metadata.PRO_LIMIT),
    RANK_TIER: metadata.RANK_TIER as 'TIER_1' | 'TIER_2' | 'TIER_3',
    SMS_REMINDER: metadata.SMS_REMINDER === 'true',
    UNIT_LIMIT: parsePlanLimit(metadata.UNIT_LIMIT),
    WHATSAPP_INTEGRATION: metadata.WHATSAPP_INTEGRATION === 'true',
    DASHBOARD_GENERAL_ACCESS: metadata.DASHBOARD_GENERAL_ACCESS === 'true',
    DASHBOARD_SALES_ACCESS: metadata.DASHBOARD_SALES_ACCESS === 'true',
    DASHBOARD_OPERATIONAL_ACCESS:
      metadata.DASHBOARD_OPERATIONAL_ACCESS === 'true',
    DASHBOARD_CUSTOMERS_ACCESS: metadata.DASHBOARD_CUSTOMERS_ACCESS === 'true',
  };
};

/** Extrai o subscription ID de um Invoice (API com `parent.subscription_details`). */
export const getSubscriptionIdFromInvoice = (
  invoice: Stripe.Invoice,
): string | null => {
  const subscription = invoice.parent?.subscription_details?.subscription;
  if (!subscription) {
    return null;
  }
  return typeof subscription === 'string' ? subscription : subscription.id;
};
