import {
  DENIED_CONSENT,
  type IAnalyticsProvider,
  type TConsentState,
  type TPageView,
  type TUserTraits,
} from '../../core/analytics.types';
import type {
  TAnalyticsEventName,
  TAnalyticsEventProperties,
} from '../../events/analytics.events';

export type TGtmProviderOptions = {
  /** ID do container, no formato `GTM-XXXXXXX`. */
  containerId: string;
  dataLayerName?: string;
  /** Consentimento antes de o usuário escolher. Padrão: tudo negado (LGPD). */
  defaultConsent?: TConsentState;
  /** Nonce da Content Security Policy, se houver. */
  nonce?: string;
};

type TDataLayer = unknown[];

const GTM_SCRIPT_URL = 'https://www.googletagmanager.com/gtm.js';
const DEFAULT_DATA_LAYER = 'dataLayer';

/** Traduz o consentimento para o Consent Mode v2 do Google. */
export function toGoogleConsent(consent: TConsentState) {
  const analytics = consent.analytics ? 'granted' : 'denied';
  const marketing = consent.marketing ? 'granted' : 'denied';

  return {
    analytics_storage: analytics,
    ad_storage: marketing,
    ad_user_data: marketing,
    ad_personalization: marketing,
  };
}

/**
 * Google Tag Manager: publica tudo no `dataLayer`. Quais tags disparam com
 * cada evento é configurado no painel do GTM, não no código.
 */
export class GtmProvider implements IAnalyticsProvider {
  readonly name = 'gtm';

  private readonly dataLayerName: string;

  constructor(private readonly options: TGtmProviderOptions) {
    this.dataLayerName = options.dataLayerName ?? DEFAULT_DATA_LAYER;
  }

  initialize(): void {
    if (typeof window === 'undefined') return;

    // O consentimento padrão tem de entrar no dataLayer antes do gtm.js.
    this.gtag('consent', 'default', {
      ...toGoogleConsent(this.options.defaultConsent ?? DENIED_CONSENT),
      wait_for_update: 500,
    });
    this.push({ 'gtm.start': Date.now(), event: 'gtm.js' });
    this.injectScript();
  }

  track<E extends TAnalyticsEventName>(
    event: E,
    properties: TAnalyticsEventProperties<E>,
  ): void {
    this.push({ event, ...properties });
  }

  page({ path, title }: TPageView): void {
    this.push({ event: 'page_view', page_path: path, page_title: title });
  }

  identify(userId: string, traits?: TUserTraits): void {
    this.push({ event: 'identify', user_id: userId, user_properties: traits });
  }

  reset(): void {
    this.push({ event: 'reset', user_id: null, user_properties: null });
  }

  setConsent(consent: TConsentState): void {
    this.gtag('consent', 'update', toGoogleConsent(consent));
  }

  private get dataLayer(): TDataLayer {
    const target = window as unknown as Record<string, TDataLayer | undefined>;
    target[this.dataLayerName] ??= [];
    return target[this.dataLayerName]!;
  }

  private push(entry: Record<string, unknown>): void {
    if (typeof window === 'undefined') return;
    this.dataLayer.push(entry);
  }

  /**
   * Comandos como `consent` só são reconhecidos pelo GTM quando chegam como o
   * objeto `arguments`, igual ao snippet oficial do gtag. Um array não serve.
   */
  private gtag(..._args: unknown[]): void {
    if (typeof window === 'undefined') return;
    // eslint-disable-next-line prefer-rest-params
    this.dataLayer.push(arguments);
  }

  private injectScript(): void {
    const scriptId = `gtm-${this.options.containerId}`;
    if (document.getElementById(scriptId)) return;

    const params = new URLSearchParams({ id: this.options.containerId });
    if (this.dataLayerName !== DEFAULT_DATA_LAYER) {
      params.set('l', this.dataLayerName);
    }

    const script = document.createElement('script');
    script.id = scriptId;
    script.async = true;
    script.src = `${GTM_SCRIPT_URL}?${params.toString()}`;
    if (this.options.nonce) script.nonce = this.options.nonce;

    document.head.appendChild(script);
  }
}
