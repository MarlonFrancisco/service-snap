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

/**
 * Moedas em que os planos existem no Stripe. O seletor só mostra estas, para
 * nunca exibir uma moeda diferente da dos planos (#24).
 * Acrescentar 'EUR' quando os preços em euros estiverem ativos (#23).
 */
export const SUPPORTED_CURRENCIES: TCurrencyCode[] = ['BRL'];

export const toSupportedCurrency = (
  currency: TCurrencyCode | undefined,
): TCurrencyCode =>
  currency && SUPPORTED_CURRENCIES.includes(currency)
    ? currency
    : DEFAULT_CURRENCY;

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
          // A moeda segue o país, se houver planos nela.
          currency: toSupportedCurrency(countryData?.currency),
        });
      },

      setCurrency: (currency) =>
        set({ currency: toSupportedCurrency(currency) }),

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
      // Quem já tinha guardado uma moeda sem planos (ex.: EUR) volta à suportada.
      merge: (persisted, current) => {
        const state = { ...current, ...(persisted as Partial<ILocaleStore>) };
        return { ...state, currency: toSupportedCurrency(state.currency) };
      },
    },
  ),
);
