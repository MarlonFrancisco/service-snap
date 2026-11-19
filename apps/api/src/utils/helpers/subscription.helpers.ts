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

export const PLAN_SLUGS = ['solo', 'team', 'multi', 'enterprise'] as const;
export type TPlanSlug = (typeof PLAN_SLUGS)[number];

/** Nomes de hoje no Stripe, para produtos ainda sem `plan_slug` no metadata. */
const PLAN_SLUG_BY_LEGACY_NAME: Record<string, TPlanSlug> = {
  Starter: 'solo',
  Professional: 'team',
  Business: 'multi',
  Enterprise: 'enterprise',
};

/**
 * Identificador estável do plano: o nome visível pode mudar (#22), o slug não.
 * Vem do metadata `plan_slug`; sem ele, cai no nome atual do produto.
 */
export const resolvePlanSlug = (
  product: Pick<Stripe.Product, 'name' | 'metadata'>,
): TPlanSlug | null => {
  const slug = product.metadata?.plan_slug as TPlanSlug | undefined;
  if (slug && PLAN_SLUGS.includes(slug)) return slug;

  return PLAN_SLUG_BY_LEGACY_NAME[product.name] ?? null;
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
