'use client';

import { captureReferralCodeFromSearch } from '@/utils/helpers/referral.helper';
import { useEffect } from 'react';

/** Side-effect shell: capture `?ref=` for the bilateral referral program. */
export const Config = () => {
  useEffect(() => {
    captureReferralCodeFromSearch(window.location.search);
  }, []);

  return null;
};
