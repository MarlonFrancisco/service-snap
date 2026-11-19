// @vitest-environment jsdom
import { beforeEach, describe, expect, it } from 'vitest';
import {
  captureSignupAttribution,
  clearSignupAttribution,
  getSignupAttribution,
  syncSignupAttributionConsent,
} from './signup-attribution.helper';

const STORAGE_KEY = 'ssnap.signup-attribution';

const DAY = 24 * 60 * 60 * 1000;
const NOW = Date.UTC(2026, 10, 19);

describe('signup attribution', () => {
  beforeEach(() => {
    clearSignupAttribution();
    window.localStorage.clear();
  });

  it('keeps the UTMs and the landing path, without the query string', () => {
    captureSignupAttribution(
      '?utm_source=google&utm_medium=cpc&utm_campaign=sp&ref=abcd12&email=a@b.com',
      '/para-negocios/barbearia',
      true,
      NOW,
    );

    expect(getSignupAttribution(NOW)).toEqual({
      utmSource: 'google',
      utmMedium: 'cpc',
      utmCampaign: 'sp',
      ref: 'ABCD12',
      landingPath: '/para-negocios/barbearia',
    });
  });

  it('is first-touch: a later campaign does not replace the first one', () => {
    captureSignupAttribution('?utm_source=google', '/', true, NOW);
    captureSignupAttribution(
      '?utm_source=instagram',
      '/pricing',
      true,
      NOW + DAY,
    );

    expect(getSignupAttribution(NOW + DAY)?.utmSource).toBe('google');
  });

  it('lets a campaign replace a first visit that had none', () => {
    captureSignupAttribution('', '/', true, NOW);
    captureSignupAttribution(
      '?utm_source=instagram',
      '/pricing',
      true,
      NOW + DAY,
    );

    expect(getSignupAttribution(NOW + DAY)).toMatchObject({
      utmSource: 'instagram',
      landingPath: '/pricing',
    });
  });

  it('expires after 30 days', () => {
    captureSignupAttribution('?utm_source=google', '/', true, NOW);

    expect(getSignupAttribution(NOW + 31 * DAY)).toBeUndefined();

    captureSignupAttribution('?utm_source=bing', '/', true, NOW + 31 * DAY);
    expect(getSignupAttribution(NOW + 31 * DAY)?.utmSource).toBe('bing');
  });

  it('is cleared after sign-up', () => {
    captureSignupAttribution('?utm_source=google', '/', true, NOW);
    clearSignupAttribution();

    expect(getSignupAttribution(NOW)).toBeUndefined();
  });

  describe('without analytics consent', () => {
    it('keeps the origin only in memory, for this visit', () => {
      captureSignupAttribution('?utm_source=google', '/', false, NOW);

      expect(window.localStorage.getItem(STORAGE_KEY)).toBeNull();
      expect(getSignupAttribution(NOW)?.utmSource).toBe('google');
    });

    it('moves the visit origin to the device once consent is given', () => {
      captureSignupAttribution('?utm_source=google', '/', false, NOW);
      syncSignupAttributionConsent(true, NOW);

      expect(
        JSON.parse(window.localStorage.getItem(STORAGE_KEY) ?? '{}'),
      ).toMatchObject({ utmSource: 'google' });
    });

    it('removes the stored origin when consent is refused or withdrawn', () => {
      captureSignupAttribution('?utm_source=google', '/', true, NOW);
      syncSignupAttributionConsent(false, NOW);

      expect(window.localStorage.getItem(STORAGE_KEY)).toBeNull();
    });
  });
});
