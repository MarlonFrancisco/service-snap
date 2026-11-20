import { describe, expect, it } from 'vitest';
import { sanitizeSignupAttribution } from './signup-attribution';

describe('sanitizeSignupAttribution', () => {
  it('normalizes the UTMs, the referral code and the landing path', () => {
    expect(
      sanitizeSignupAttribution({
        utmSource: ' Google ',
        utmMedium: 'CPC',
        utmCampaign: 'barbearia-sp_2026',
        ref: 'abcd12',
        landingPath: '/para-negocios/barbearia?utm_source=google#top',
      }),
    ).toEqual({
      signupUtmSource: 'google',
      signupUtmMedium: 'cpc',
      signupUtmCampaign: 'barbearia-sp_2026',
      signupRef: 'ABCD12',
      signupLandingPath: '/para-negocios/barbearia',
    });
  });

  it('drops invalid values instead of failing the sign-up', () => {
    expect(
      sanitizeSignupAttribution({
        utmSource: 'a@b.com',
        utmMedium: 42,
        ref: 'x',
        landingPath: 'https://evil.example/path',
        utmCampaign: 'newsletter',
      }),
    ).toEqual({
      signupUtmSource: null,
      signupUtmMedium: null,
      signupUtmCampaign: 'newsletter',
      signupRef: null,
      signupLandingPath: null,
    });
  });

  it('caps the UTM length', () => {
    const result = sanitizeSignupAttribution({ utmSource: 'a'.repeat(300) });

    expect(result?.signupUtmSource).toHaveLength(100);
  });

  it('returns null when nothing is left', () => {
    expect(sanitizeSignupAttribution(undefined)).toBeNull();
    expect(sanitizeSignupAttribution({ utmSource: '' })).toBeNull();
  });
});
