'use client';

import type { TCountryCode, TCurrencyCode } from '@repo/shared/constants';
import { COUNTRIES } from '@repo/shared/constants';
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface ILocaleStore {
  // State
  country: TCountryCode;
  currency: TCurrencyCode;
  locale: string;
  autoTranslate: boolean;

  // Actions
  setCountry: (country: TCountryCode) => void;
  setCurrency: (currency: TCurrencyCode) => void;
  setAutoTranslate: (autoTranslate: boolean) => void;
  reset: () => void;
}

const DEFAULT_COUNTRY: TCountryCode = 'BR';
const DEFAULT_CURRENCY: TCurrencyCode = 'BRL';
const DEFAULT_LOCALE = 'pt-BR';

export const useLocaleStore = create<ILocaleStore>()(
  persist(
    (set) => ({
      // Initial State
      country: DEFAULT_COUNTRY,
      currency: DEFAULT_CURRENCY,
      locale: DEFAULT_LOCALE,
      autoTranslate: true,

      // Actions
      setCountry: (country) => {
        const countryData = COUNTRIES[country];
        set({
          country,
          locale: countryData?.locale || DEFAULT_LOCALE,
          // Auto-update currency when country changes
          currency: countryData?.currency || DEFAULT_CURRENCY,
        });
      },

      setCurrency: (currency) => set({ currency }),

      setAutoTranslate: (autoTranslate) => set({ autoTranslate }),

      reset: () =>
        set({
          country: DEFAULT_COUNTRY,
          currency: DEFAULT_CURRENCY,
          locale: DEFAULT_LOCALE,
          autoTranslate: true,
        }),
    }),
    {
      name: 'servicesnap-locale',
    },
  ),
);
