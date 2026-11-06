import { afterEach, describe, expect, it } from 'vitest';
import { GtmProvider } from './gtm.provider';

type TWindowWithLayers = Window & Record<string, unknown[] | undefined>;

const dataLayer = (name = 'dataLayer') =>
  (window as unknown as TWindowWithLayers)[name] ?? [];

/** Converte `arguments` em array para comparar com facilidade. */
const entries = (name?: string) =>
  dataLayer(name).map((entry) =>
    Object.prototype.toString.call(entry) === '[object Arguments]'
      ? Array.from(entry as ArrayLike<unknown>)
      : entry,
  );

afterEach(() => {
  delete (window as unknown as TWindowWithLayers).dataLayer;
  delete (window as unknown as TWindowWithLayers).customLayer;
  document.head.innerHTML = '';
});

describe('GtmProvider', () => {
  it('sets denied consent before loading the GTM script', () => {
    new GtmProvider({ containerId: 'GTM-TEST' }).initialize();

    expect(entries()[0]).toEqual([
      'consent',
      'default',
      {
        analytics_storage: 'denied',
        ad_storage: 'denied',
        ad_user_data: 'denied',
        ad_personalization: 'denied',
        wait_for_update: 500,
      },
    ]);
    expect(entries()[1]).toMatchObject({ event: 'gtm.js' });

    const script = document.getElementById('gtm-GTM-TEST') as HTMLScriptElement;
    expect(script.src).toBe(
      'https://www.googletagmanager.com/gtm.js?id=GTM-TEST',
    );
    expect(script.async).toBe(true);
  });

  it('pushes consent commands as an Arguments object, as gtag does', () => {
    new GtmProvider({ containerId: 'GTM-TEST' }).initialize();

    expect(Object.prototype.toString.call(dataLayer()[0])).toBe(
      '[object Arguments]',
    );
  });

  it('injects the script only once', () => {
    const provider = new GtmProvider({ containerId: 'GTM-TEST' });

    provider.initialize();
    provider.initialize();

    expect(document.querySelectorAll('script')).toHaveLength(1);
  });

  it('publishes events, page views and identity in the dataLayer', () => {
    const provider = new GtmProvider({ containerId: 'GTM-TEST' });

    provider.track('search', { search_term: 'barbearia', results_count: 3 });
    provider.page({ path: '/booking?query=barbearia', title: 'Busca' });
    provider.identify('user-1', { plan: 'starter' });
    provider.reset();

    expect(entries()).toEqual([
      { event: 'search', search_term: 'barbearia', results_count: 3 },
      {
        event: 'page_view',
        page_path: '/booking?query=barbearia',
        page_title: 'Busca',
      },
      {
        event: 'identify',
        user_id: 'user-1',
        user_properties: { plan: 'starter' },
      },
      { event: 'reset', user_id: null, user_properties: null },
    ]);
  });

  it('maps consent categories to Google Consent Mode v2', () => {
    new GtmProvider({ containerId: 'GTM-TEST' }).setConsent({
      analytics: true,
      marketing: false,
    });

    expect(entries()[0]).toEqual([
      'consent',
      'update',
      {
        analytics_storage: 'granted',
        ad_storage: 'denied',
        ad_user_data: 'denied',
        ad_personalization: 'denied',
      },
    ]);
  });

  it('supports a custom dataLayer name and CSP nonce', () => {
    new GtmProvider({
      containerId: 'GTM-TEST',
      dataLayerName: 'customLayer',
      nonce: 'abc123',
    }).initialize();

    const script = document.getElementById('gtm-GTM-TEST') as HTMLScriptElement;
    expect(script.src).toContain('l=customLayer');
    expect(script.nonce).toBe('abc123');
    expect(dataLayer('customLayer')).toHaveLength(2);
    expect(dataLayer()).toHaveLength(0);
  });
});
