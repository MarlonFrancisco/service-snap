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

/** Módulos liberados por plano: decididos no código, não no metadata do Stripe. */
export type TPlanModules = {
  COMMISSIONS_ACCESS: boolean;
  AUDIT_LOG_ACCESS: boolean;
  LOYALTY_ACCESS: boolean;
  CAMPAIGNS_ACCESS: boolean;
  API_ACCESS: boolean;
};

const NO_MODULES: TPlanModules = {
  COMMISSIONS_ACCESS: false,
  AUDIT_LOG_ACCESS: false,
  LOYALTY_ACCESS: false,
  CAMPAIGNS_ACCESS: false,
  API_ACCESS: false,
};

const TEAM_MODULES: TPlanModules = {
  COMMISSIONS_ACCESS: true,
  AUDIT_LOG_ACCESS: true,
  LOYALTY_ACCESS: true,
  CAMPAIGNS_ACCESS: true,
  API_ACCESS: false,
};

const ALL_MODULES: TPlanModules = { ...TEAM_MODULES, API_ACCESS: true };

export const PLAN_MODULES: Record<TPlanSlug, TPlanModules> = {
  solo: NO_MODULES,
  team: TEAM_MODULES,
  multi: ALL_MODULES,
  enterprise: ALL_MODULES,
};

export type TPlanModuleFlag = keyof TPlanModules;

type TDashboardFlags = {
  DASHBOARD_GENERAL_ACCESS?: boolean;
  DASHBOARD_SALES_ACCESS?: boolean;
};

/**
 * Plano de uma assinatura gravada antes dos módulos por plano, ou de um produto
 * sem `plan_slug` nem nome conhecido: os painéis de hoje separam os planos
 * (Solo nenhum, Equipe o geral, Multi e Enterprise todos).
 */
export const inferPlanSlugFromFeatures = (
  features: TDashboardFlags | null | undefined,
): TPlanSlug => {
  if (features?.DASHBOARD_SALES_ACCESS) return 'multi';
  if (features?.DASHBOARD_GENERAL_ACCESS) return 'team';
  return 'solo';
};

/** As flags gravadas mandam; as que faltam vêm do plano inferido. */
export const withPlanModules = <T extends TDashboardFlags>(
  features: T | null | undefined,
): (T & TPlanModules) | null => {
  if (!features) return null;

  return {
    ...PLAN_MODULES[inferPlanSlugFromFeatures(features)],
    ...features,
  };
};

/**
 * Plano assinável sem passar pelo comercial. O `self_serve` do metadata manda;
 * sem ele (antes do backfill), só o Enterprise fica de fora (#22).
 */
export const isSelfServePlan = (
  product: Pick<Stripe.Product, 'name' | 'metadata'>,
): boolean => {
  const selfServe = product.metadata?.self_serve;
  if (selfServe === 'true') return true;
  if (selfServe === 'false') return false;

  return resolvePlanSlug(product) !== 'enterprise';
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

export const normalizeSubscriptionMetadata = (
  metadata: Stripe.Metadata,
  planSlug?: TPlanSlug | null,
) => {
  const features = {
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

  return {
    ...features,
    ...PLAN_MODULES[planSlug ?? inferPlanSlugFromFeatures(features)],
  };
};
