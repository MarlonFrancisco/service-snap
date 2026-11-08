import type { TCountryCode, TCurrencyCode } from '@repo/shared/constants';

/** Campos regionais da loja: qualquer um pode faltar em lojas antigas. */
export type TRegionSource = {
  country?: string | null;
  currency?: string | null;
  timezone?: string | null;
};

export type TRegionDefaults = {
  country: TCountryCode;
  currency: TCurrencyCode;
  timezone: string;
  locale: string;
};
