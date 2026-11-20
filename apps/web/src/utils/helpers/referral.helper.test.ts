// @vitest-environment jsdom
import { beforeEach, describe, expect, it } from 'vitest';
import {
  captureReferralCodeFromSearch,
  clearStoredReferralCode,
  getStoredReferralCode,
  syncReferralConsent,
} from './referral.helper';

const STORAGE_KEY = 'ssnap.referral';

describe('referral code', () => {
  beforeEach(() => {
    clearStoredReferralCode();
    window.localStorage.clear();
  });

  it('stores a valid code on the device with consent', () => {
    expect(captureReferralCodeFromSearch('?ref=abcd12', true)).toBe('ABCD12');
    expect(window.localStorage.getItem(STORAGE_KEY)).toBe('ABCD12');
  });

  it('ignores an invalid code', () => {
    expect(captureReferralCodeFromSearch('?ref=a!', true)).toBeNull();
    expect(getStoredReferralCode()).toBeUndefined();
  });

  describe('without analytics consent', () => {
    it('keeps the code only in memory, for this visit', () => {
      captureReferralCodeFromSearch('?ref=abcd12', false);

      expect(window.localStorage.getItem(STORAGE_KEY)).toBeNull();
      expect(getStoredReferralCode()).toBe('ABCD12');
    });

    it('moves the visit code to the device once consent is given', () => {
      captureReferralCodeFromSearch('?ref=abcd12', false);
      syncReferralConsent(true);

      expect(window.localStorage.getItem(STORAGE_KEY)).toBe('ABCD12');
    });

    it('removes the stored code when consent is refused or withdrawn', () => {
      captureReferralCodeFromSearch('?ref=abcd12', true);
      syncReferralConsent(false);

      expect(window.localStorage.getItem(STORAGE_KEY)).toBeNull();
    });
  });

  it('is cleared after sign-up', () => {
    captureReferralCodeFromSearch('?ref=abcd12', false);
    clearStoredReferralCode();

    expect(getStoredReferralCode()).toBeUndefined();
  });
});
