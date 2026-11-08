import {
  COUNTRIES,
  CURRENCIES,
  type ICountry,
  type TCountryCode,
  type TCurrencyCode,
} from '@repo/shared';
import { parsePhoneNumberFromString } from 'libphonenumber-js';
import type { TRegionDefaults, TRegionSource } from './region.types';

/** País assumido quando a loja ou o usuário não informam um. */
export const DEFAULT_COUNTRY: TCountryCode = 'BR';

export const SUPPORTED_COUNTRY_CODES = Object.keys(COUNTRIES) as TCountryCode[];

export const SUPPORTED_CURRENCY_CODES = Object.keys(
  CURRENCIES,
) as TCurrencyCode[];

export const isSupportedCountry = (
  code?: string | null,
): code is TCountryCode =>
  !!code && SUPPORTED_COUNTRY_CODES.includes(code as TCountryCode);

export const isSupportedCurrency = (
  code?: string | null,
): code is TCurrencyCode =>
  !!code && SUPPORTED_CURRENCY_CODES.includes(code as TCurrencyCode);

/** Fuso IANA que o runtime reconhece; "GMT-3" ou texto livre não passam. */
export const isValidTimeZone = (timezone?: string | null): boolean => {
  if (!timezone) return false;

  try {
    new Intl.DateTimeFormat('en-US', { timeZone: timezone });
    return true;
  } catch {
    return false;
  }
};

const getCountry = (code?: string | null): ICountry =>
  COUNTRIES[isSupportedCountry(code) ? code : DEFAULT_COUNTRY];

/** Moeda, fuso e locale padrão de um país; país desconhecido cai no padrão. */
export const getCountryDefaults = (code?: string | null): TRegionDefaults => {
  const country = getCountry(code);

  return {
    country: country.code as TCountryCode,
    currency: country.currency,
    timezone: country.timezone,
    locale: country.locale,
  };
};

/** Fuso da loja; sem um válido, o padrão do país dela. */
export const getStoreTimezone = (store?: TRegionSource | null): string =>
  isValidTimeZone(store?.timezone)
    ? store.timezone
    : getCountryDefaults(store?.country).timezone;

export const getStoreCurrency = (store?: TRegionSource | null): string =>
  store?.currency?.trim().toUpperCase() ||
  getCountryDefaults(store?.country).currency;

/** Locale de formatação de número e moeda: segue o país da loja. */
export const getStoreLocale = (store?: TRegionSource | null): string =>
  getCountryDefaults(store?.country).locale;

/**
 * Valida o CEP / código postal no formato do país. Países sem formato
 * cadastrado aceitam qualquer valor não vazio.
 */
export const isValidPostalCodeFor = (
  postalCode: string,
  countryCode?: string | null,
): boolean => {
  const { postalCodeFormat } = getCountry(countryCode);
  const value = postalCode?.trim();

  if (!value) return false;
  return postalCodeFormat
    ? new RegExp(postalCodeFormat, 'i').test(value)
    : true;
};

/** Países com lista de estados (BR, US) exigem a sigla; os outros aceitam texto. */
export const isValidStateFor = (
  state: string,
  countryCode?: string | null,
): boolean => {
  const { states } = getCountry(countryCode);
  const value = state?.trim();

  if (!states?.length) return !value || value.length <= 100;
  return states.some(({ code }) => code === value?.toUpperCase());
};

/** Sigla em maiúsculas onde há lista de estados; texto aparado nos demais. */
export const normalizeStateFor = (
  state: string | null | undefined,
  countryCode?: string | null,
): string | null => {
  const value = state?.trim();

  if (!value) return null;
  return getCountry(countryCode).states?.length ? value.toUpperCase() : value;
};

/**
 * Telefone em E.164 (+5511999999999). Número sem DDI é lido como do país
 * informado; se não for válido lá, tenta como se o DDI já viesse nos dígitos
 * (caso do WhatsApp, que manda "5511999999999").
 */
export const toE164 = (
  phone?: string | null,
  countryCode?: string | null,
): string | null => {
  if (!phone?.trim()) return null;

  const country = getCountry(countryCode).code as TCountryCode;
  const asNational = parsePhoneNumberFromString(phone, country);

  if (asNational?.isValid()) return asNational.number;

  const digits = phone.replace(/\D/g, '');
  const asInternational = digits && parsePhoneNumberFromString(`+${digits}`);

  return asInternational?.isValid() ? asInternational.number : null;
};

export const isValidPhoneFor = (
  phone: string,
  countryCode?: string | null,
): boolean => toE164(phone, countryCode) !== null;
