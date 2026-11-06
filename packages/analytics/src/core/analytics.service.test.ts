import { describe, expect, it, vi } from 'vitest';
import { AnalyticsService } from './analytics.service';
import type { IAnalyticsProvider } from './analytics.types';

const createProvider = (
  overrides: Partial<IAnalyticsProvider> = {},
): IAnalyticsProvider => ({
  name: 'fake',
  initialize: vi.fn(),
  track: vi.fn(),
  page: vi.fn(),
  identify: vi.fn(),
  reset: vi.fn(),
  setConsent: vi.fn(),
  ...overrides,
});

describe('AnalyticsService', () => {
  it('sends every call to all providers', async () => {
    const gtm = createProvider({ name: 'gtm' });
    const posthog = createProvider({ name: 'posthog' });
    const analytics = new AnalyticsService([gtm, posthog]);
    await analytics.initialize();

    analytics.track('login', { method: 'google' });
    analytics.page({ path: '/booking' });

    for (const provider of [gtm, posthog]) {
      expect(provider.track).toHaveBeenCalledWith('login', {
        method: 'google',
      });
      expect(provider.page).toHaveBeenCalledWith({ path: '/booking' });
    }
  });

  it('queues calls made before initialize and flushes them in order', async () => {
    const calls: string[] = [];
    const provider = createProvider({
      page: () => calls.push('page'),
      track: () => calls.push('track'),
    });
    const analytics = new AnalyticsService([provider]);

    analytics.page({ path: '/' });
    analytics.track('sign_up', { method: 'email' });
    expect(calls).toEqual([]);

    await analytics.initialize();

    expect(calls).toEqual(['page', 'track']);
  });

  it('initializes each provider only once', async () => {
    const provider = createProvider();
    const analytics = new AnalyticsService([provider]);

    await Promise.all([analytics.initialize(), analytics.initialize()]);

    expect(provider.initialize).toHaveBeenCalledTimes(1);
  });

  it('caps the queue so a provider that never initializes cannot leak memory', async () => {
    const provider = createProvider();
    const analytics = new AnalyticsService([provider], { maxQueueSize: 2 });

    analytics.page({ path: '/1' });
    analytics.page({ path: '/2' });
    analytics.page({ path: '/3' });
    await analytics.initialize();

    expect(provider.page).toHaveBeenCalledTimes(2);
  });

  it('isolates a failing provider from the others and from the app', async () => {
    const onError = vi.fn();
    const broken = createProvider({
      name: 'broken',
      initialize: () => Promise.reject(new Error('blocked by adblock')),
      track: () => {
        throw new Error('boom');
      },
    });
    const healthy = createProvider({ name: 'healthy' });
    const analytics = new AnalyticsService([broken, healthy], { onError });

    await analytics.initialize();
    expect(() => analytics.track('login', { method: 'google' })).not.toThrow();

    expect(healthy.track).toHaveBeenCalled();
    expect(onError).toHaveBeenCalledTimes(2);
    expect(onError).toHaveBeenCalledWith(expect.any(Error), broken);
  });

  it('works as a no-op without providers', async () => {
    const analytics = new AnalyticsService([]);

    await analytics.initialize();

    expect(() => analytics.reset()).not.toThrow();
  });
});
