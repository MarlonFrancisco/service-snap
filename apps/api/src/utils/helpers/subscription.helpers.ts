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

export const normalizeSubscriptionMetadata = (metadata: Stripe.Metadata) => {
  return {
    PRO_LIMIT: parseInt(metadata.PRO_LIMIT || '0'),
    RANK_TIER: metadata.RANK_TIER as 'TIER_1' | 'TIER_2' | 'TIER_3',
    SMS_REMINDER: metadata.SMS_REMINDER === 'true',
    UNIT_LIMIT: parseInt(metadata.UNIT_LIMIT || '0'),
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
