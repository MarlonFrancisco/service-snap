import type {
  TAnalyticsEventName,
  TAnalyticsEventProperties,
} from '../events/analytics.events';

/** Finalidades de tratamento que o usuário aceita ou recusa (LGPD). */
export type TConsentCategory = 'analytics' | 'marketing';

export type TConsentState = Record<TConsentCategory, boolean>;

export type TPageView = {
  path: string;
  title?: string;
};

/** Atributos do usuário. Nunca coloque dados pessoais aqui. */
export type TUserTraits = Record<string, string | number | boolean | null>;

/**
 * O que a aplicação usa para registrar o comportamento do usuário.
 * Componentes e hooks dependem só desta interface.
 */
export interface IAnalyticsTracker {
  track<E extends TAnalyticsEventName>(
    event: E,
    properties: TAnalyticsEventProperties<E>,
  ): void;
  page(page: TPageView): void;
  identify(userId: string, traits?: TUserTraits): void;
  /** Esquece o usuário identificado, por exemplo no logout. */
  reset(): void;
}

/** Ciclo de vida e consentimento: usado só por quem monta a analytics. */
export interface IAnalytics extends IAnalyticsTracker {
  initialize(): Promise<void>;
  setConsent(consent: TConsentState): void;
}

/**
 * Contrato que toda ferramenta (GTM, Zaraz, PostHog...) implementa.
 * Para trocar ou somar uma ferramenta, crie um novo provider: nada mais muda.
 */
export interface IAnalyticsProvider {
  readonly name: string;
  initialize(): void | Promise<void>;
  track<E extends TAnalyticsEventName>(
    event: E,
    properties: TAnalyticsEventProperties<E>,
  ): void;
  page(page: TPageView): void;
  identify(userId: string, traits?: TUserTraits): void;
  reset(): void;
  setConsent(consent: TConsentState): void;
}

export const DENIED_CONSENT: TConsentState = {
  analytics: false,
  marketing: false,
};
