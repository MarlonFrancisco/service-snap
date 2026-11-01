import { formatPrice } from '@/utils/helpers/price.helper';
import type { TCurrencyCode } from '@repo/shared/constants';

const PLAN_LOCALE = 'pt-BR';
const DEFAULT_PLAN_CURRENCY = 'BRL';

/** Painel em pt-BR: o locale não depende da moeda; a Stripe pode enviar `brl` minúsculo. */
export const formatPlanPrice = (value: number, currency?: string | null) =>
  formatPrice(value, {
    currency: (currency?.toUpperCase() ||
      DEFAULT_PLAN_CURRENCY) as TCurrencyCode,
    locale: PLAN_LOCALE,
  });

export const formatPlanDate = (date?: Date | string | null) =>
  date ? new Date(date).toLocaleDateString(PLAN_LOCALE) : null;
