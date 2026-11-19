// @vitest-environment jsdom
import { beforeEach, describe, expect, it } from 'vitest';
import {
  captureSignupAttribution,
  clearSignupAttribution,
  getSignupAttribution,
} from './signup-attribution.helper';

const DAY = 24 * 60 * 60 * 1000;
const NOW = Date.UTC(2026, 10, 19);

describe('signup attribution', () => {
  beforeEach(() => window.localStorage.clear());

  it('keeps the UTMs and the landing path, without the query string', () => {
    captureSignupAttribution(
      '?utm_source=google&utm_medium=cpc&utm_campaign=sp&ref=abcd12&email=a@b.com',
      '/para-negocios/barbearia',
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
    captureSignupAttribution('?utm_source=google', '/', NOW);
    captureSignupAttribution('?utm_source=instagram', '/pricing', NOW + DAY);

    expect(getSignupAttribution(NOW + DAY)?.utmSource).toBe('google');
  });

  it('lets a campaign replace a first visit that had none', () => {
    captureSignupAttribution('', '/', NOW);
    captureSignupAttribution('?utm_source=instagram', '/pricing', NOW + DAY);

    expect(getSignupAttribution(NOW + DAY)).toMatchObject({
      utmSource: 'instagram',
      landingPath: '/pricing',
    });
  });

  it('expires after 30 days', () => {
    captureSignupAttribution('?utm_source=google', '/', NOW);

    expect(getSignupAttribution(NOW + 31 * DAY)).toBeUndefined();

    captureSignupAttribution('?utm_source=bing', '/', NOW + 31 * DAY);
    expect(getSignupAttribution(NOW + 31 * DAY)?.utmSource).toBe('bing');
  });

  it('is cleared after sign-up', () => {
    captureSignupAttribution('?utm_source=google', '/', NOW);
    clearSignupAttribution();

    expect(getSignupAttribution(NOW)).toBeUndefined();
  });
});
