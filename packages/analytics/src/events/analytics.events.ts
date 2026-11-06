/**
 * Catálogo de eventos do produto: o contrato entre quem dispara e quem coleta.
 *
 * Os nomes seguem os eventos recomendados do GA4 quando existe um equivalente
 * (`search`, `login`, `sign_up`, `begin_checkout`, `purchase`), para que os
 * relatórios padrão funcionem sem mapeamento extra. Os demais usam snake_case.
 *
 * Nunca envie dados pessoais (e-mail, telefone, nome) nas propriedades.
 */
export interface IAnalyticsEventMap {
  search: {
    search_term: string;
    category?: string;
    location?: string;
    results_count?: number;
  };
  login: { method: TAuthMethod };
  sign_up: { method: TAuthMethod };
  booking_started: {
    store_id: string;
    service_id?: string;
  };
  booking_completed: {
    store_id: string;
    service_ids: string[];
    value: number;
    currency: string;
  };
  begin_checkout: {
    plan_id: string;
    billing_period: TBillingPeriod;
    value: number;
    currency: string;
  };
  purchase: {
    transaction_id: string;
    plan_id: string;
    billing_period: TBillingPeriod;
    value: number;
    currency: string;
  };
  partner_onboarding_completed: { store_id: string };
}

export type TAuthMethod = 'google' | 'email';

export type TBillingPeriod = 'monthly' | 'yearly';

export type TAnalyticsEventName = keyof IAnalyticsEventMap;

export type TAnalyticsEventProperties<E extends TAnalyticsEventName> =
  IAnalyticsEventMap[E];
