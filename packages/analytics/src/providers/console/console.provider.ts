import type {
  IAnalyticsProvider,
  TConsentState,
  TPageView,
  TUserTraits,
} from '../../core/analytics.types';
import type {
  TAnalyticsEventName,
  TAnalyticsEventProperties,
} from '../../events/analytics.events';

type TLogger = Pick<Console, 'info'>;

/** Mostra no console o que seria enviado. Para desenvolvimento e debug. */
export class ConsoleProvider implements IAnalyticsProvider {
  readonly name = 'console';

  constructor(private readonly logger: TLogger = console) {}

  initialize(): void {
    this.log('initialize');
  }

  track<E extends TAnalyticsEventName>(
    event: E,
    properties: TAnalyticsEventProperties<E>,
  ): void {
    this.log('track', event, properties);
  }

  page(page: TPageView): void {
    this.log('page', page);
  }

  identify(userId: string, traits?: TUserTraits): void {
    this.log('identify', userId, traits);
  }

  reset(): void {
    this.log('reset');
  }

  setConsent(consent: TConsentState): void {
    this.log('consent', consent);
  }

  private log(action: string, ...details: unknown[]): void {
    this.logger.info(`[analytics] ${action}`, ...details);
  }
}
