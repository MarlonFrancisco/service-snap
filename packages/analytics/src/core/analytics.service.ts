import type {
  TAnalyticsEventName,
  TAnalyticsEventProperties,
} from '../events/analytics.events';
import type {
  IAnalytics,
  IAnalyticsProvider,
  TConsentState,
  TPageView,
  TUserTraits,
} from './analytics.types';

type TProviderCall = (provider: IAnalyticsProvider) => void;

export type TAnalyticsServiceOptions = {
  /** Chamado quando um provider falha. A falha nunca chega à aplicação. */
  onError?: (error: unknown, provider: IAnalyticsProvider) => void;
  /** Quantas chamadas guardar enquanto `initialize` não termina. */
  maxQueueSize?: number;
};

const DEFAULT_MAX_QUEUE_SIZE = 100;

/**
 * Distribui cada chamada para todos os providers configurados.
 *
 * - Chamadas feitas antes de `initialize` terminar ficam em fila. No React, os
 *   efeitos dos filhos rodam antes dos do provider, então isso acontece.
 * - A falha de um provider não impede os outros nem quebra a aplicação.
 * - Sem providers, funciona como um no-op (útil em testes e no servidor).
 */
export class AnalyticsService implements IAnalytics {
  private readonly queue: TProviderCall[] = [];
  private initialization?: Promise<void>;
  private ready = false;

  constructor(
    private readonly providers: IAnalyticsProvider[],
    private readonly options: TAnalyticsServiceOptions = {},
  ) {}

  initialize(): Promise<void> {
    this.initialization ??= this.initializeProviders();
    return this.initialization;
  }

  track<E extends TAnalyticsEventName>(
    event: E,
    properties: TAnalyticsEventProperties<E>,
  ): void {
    this.dispatch((provider) => provider.track(event, properties));
  }

  page(page: TPageView): void {
    this.dispatch((provider) => provider.page(page));
  }

  identify(userId: string, traits?: TUserTraits): void {
    this.dispatch((provider) => provider.identify(userId, traits));
  }

  reset(): void {
    this.dispatch((provider) => provider.reset());
  }

  setConsent(consent: TConsentState): void {
    this.dispatch((provider) => provider.setConsent(consent));
  }

  private async initializeProviders(): Promise<void> {
    await Promise.all(
      this.providers.map(async (provider) => {
        try {
          await provider.initialize();
        } catch (error) {
          this.options.onError?.(error, provider);
        }
      }),
    );

    this.ready = true;
    this.queue.splice(0).forEach((call) => this.run(call));
  }

  private dispatch(call: TProviderCall): void {
    if (this.ready) {
      this.run(call);
      return;
    }

    const maxQueueSize = this.options.maxQueueSize ?? DEFAULT_MAX_QUEUE_SIZE;
    if (this.queue.length < maxQueueSize) this.queue.push(call);
  }

  private run(call: TProviderCall): void {
    for (const provider of this.providers) {
      try {
        call(provider);
      } catch (error) {
        this.options.onError?.(error, provider);
      }
    }
  }
}
