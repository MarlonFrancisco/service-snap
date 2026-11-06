// @vitest-environment jsdom
import type { IAnalytics } from '@repo/analytics';
import { act, type ReactNode } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { AnalyticsProvider, useAnalytics } from './analytics.provider';

const navigation = vi.hoisted(() => ({ pathname: '', search: '' }));

vi.mock('next/navigation', () => ({
  usePathname: () => navigation.pathname,
  useSearchParams: () => new URLSearchParams(navigation.search),
}));

const analytics = vi.hoisted(
  () =>
    ({
      initialize: vi.fn(() => Promise.resolve()),
      setConsent: vi.fn(),
      track: vi.fn(),
      page: vi.fn(),
      identify: vi.fn(),
      reset: vi.fn(),
    }) satisfies IAnalytics,
);

vi.mock('@/utils/helpers/analytics.helper', () => ({
  createAnalytics: () => analytics,
}));

// Sem isto o React avisa que `act` não está habilitado no ambiente.
(
  globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }
).IS_REACT_ACT_ENVIRONMENT = true;

let root: Root;

const mount = async (ui: ReactNode) => {
  await act(async () => root.render(ui));
};

function TrackLogin() {
  const tracker = useAnalytics();
  tracker.track('login', { method: 'google' });
  return null;
}

beforeEach(() => {
  vi.clearAllMocks();
  navigation.pathname = '/booking';
  navigation.search = 'query=barbearia';
  root = createRoot(document.createElement('div'));
});

afterEach(() => act(() => root.unmount()));

describe('AnalyticsProvider', () => {
  it('initializes analytics and records the current page with its query', async () => {
    await mount(<AnalyticsProvider>conteúdo</AnalyticsProvider>);

    expect(analytics.initialize).toHaveBeenCalledOnce();
    expect(analytics.page).toHaveBeenCalledWith({
      path: '/booking?query=barbearia',
      title: document.title,
    });
  });

  it('records a new page view when the route changes', async () => {
    await mount(<AnalyticsProvider>a</AnalyticsProvider>);

    navigation.pathname = '/pricing';
    navigation.search = '';
    await mount(<AnalyticsProvider>b</AnalyticsProvider>);

    expect(analytics.page).toHaveBeenCalledTimes(2);
    expect(analytics.page).toHaveBeenLastCalledWith({
      path: '/pricing',
      title: document.title,
    });
    expect(analytics.initialize).toHaveBeenCalledOnce();
  });

  it('exposes the tracker to components', async () => {
    await mount(
      <AnalyticsProvider>
        <TrackLogin />
      </AnalyticsProvider>,
    );

    expect(analytics.track).toHaveBeenCalledWith('login', { method: 'google' });
  });

  it('is a no-op outside the provider', async () => {
    await mount(<TrackLogin />);

    expect(analytics.track).not.toHaveBeenCalled();
  });
});
