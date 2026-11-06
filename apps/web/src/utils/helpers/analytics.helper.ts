import {
  AnalyticsService,
  ConsoleProvider,
  GtmProvider,
  type IAnalytics,
  type IAnalyticsProvider,
} from '@repo/analytics';

type TAnalyticsEnv = {
  gtmId?: string;
  debug?: boolean;
};

/**
 * Único ponto do app que conhece as ferramentas concretas. Trocar o GTM por
 * outra ferramenta, ou somar uma nova, é mudar só a lista abaixo.
 */
export function createAnalytics({
  gtmId = process.env.NEXT_PUBLIC_GTM_ID,
  debug = process.env.NEXT_PUBLIC_ANALYTICS_DEBUG === 'true',
}: TAnalyticsEnv = {}): IAnalytics {
  const providers: IAnalyticsProvider[] = [];

  if (gtmId) providers.push(new GtmProvider({ containerId: gtmId }));
  if (debug) providers.push(new ConsoleProvider());

  return new AnalyticsService(providers, {
    onError: debug
      ? (error, provider) =>
          console.error(`[analytics] ${provider.name} falhou`, error)
      : undefined,
  });
}
