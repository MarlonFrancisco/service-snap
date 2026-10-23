/**
 * Currency formatting utilities
 */

import { COUNTRIES, type TCountryCode } from '../constants/countries';
import { CURRENCIES, type TCurrencyCode } from '../constants/currencies';

export interface FormatPriceOptions {
  /** Currency code (ISO 4217) */
  currency?: TCurrencyCode;
  /** Locale for formatting (e.g., 'pt-BR', 'en-US') */
  locale?: string;
  /** Whether to show currency symbol */
  showSymbol?: boolean;
  /** Whether to show currency code instead of symbol */
  showCode?: boolean;
  /** Minimum fraction digits */
  minimumFractionDigits?: number;
  /** Maximum fraction digits */
  maximumFractionDigits?: number;
}

/**
 * Format a price value according to locale and currency
 * @param value - The price value (in major units, e.g., 10.99)
 * @param options - Formatting options
 * @returns Formatted price string
 */
export function formatPrice(
  value: number,
  options: FormatPriceOptions = {},
): string {
  const {
    currency = 'USD',
    locale = 'en-US',
    showSymbol = true,
    showCode = false,
    minimumFractionDigits,
    maximumFractionDigits,
  } = options;

  const currencyInfo = CURRENCIES[currency];

  const formatOptions: Intl.NumberFormatOptions = {
    style: showSymbol || showCode ? 'currency' : 'decimal',
    currency: currency,
    currencyDisplay: showCode ? 'code' : 'symbol',
    minimumFractionDigits:
      minimumFractionDigits ?? currencyInfo?.decimalPlaces ?? 2,
    maximumFractionDigits:
      maximumFractionDigits ?? currencyInfo?.decimalPlaces ?? 2,
  };

  try {
    return new Intl.NumberFormat(locale, formatOptions).format(value);
  } catch {
    // Fallback for unsupported locales
    return new Intl.NumberFormat('en-US', formatOptions).format(value);
  }
}

/**
 * Format a price using a country's default locale and currency
 * @param value - The price value
 * @param countryCode - ISO 3166-1 alpha-2 country code
 * @returns Formatted price string
 */
export function formatPriceByCountry(
  value: number,
  countryCode: TCountryCode = 'BR',
): string {
  const country = COUNTRIES[countryCode];
  if (!country) {
    return formatPrice(value);
  }

  return formatPrice(value, {
    currency: country.currency,
    locale: country.locale,
  });
}

export function formatPriceByCurrency(
  value: number,
  currency: TCurrencyCode = 'BRL',
): string {
  const country = Object.values(COUNTRIES).find((c) => c.currency === currency);
  return formatPrice(value, {
    currency,
    locale: country?.locale || 'en-US',
  });
}
/**
 * Format price for a store based on its currency setting
 * @param value - The price value
 * @param storeCurrency - Store's currency code
 * @param storeCountry - Store's country code (for locale)
 * @returns Formatted price string
 */
export function formatStorePrice(
  value: number,
  storeCurrency: TCurrencyCode = 'BRL',
  storeCountry: TCountryCode = 'BR',
): string {
  const country = COUNTRIES[storeCountry];
  return formatPrice(value, {
    currency: storeCurrency,
    locale: country?.locale || 'en-US',
  });
}

/**
 * Get currency symbol for a currency code
 * @param currencyCode - ISO 4217 currency code
 * @returns Currency symbol
 */
export function getCurrencySymbol(currencyCode: TCurrencyCode): string {
  return CURRENCIES[currencyCode]?.symbol || currencyCode;
}

/**
 * Parse a formatted price string back to a number
 * @param formattedPrice - The formatted price string
 * @param locale - The locale used for formatting
 * @returns Parsed number value
 */
export function parsePrice(
  formattedPrice: string,
  locale: string = 'en-US',
): number {
  // Get the decimal separator for this locale
  const parts = new Intl.NumberFormat(locale).formatToParts(1234.56);
  const decimalSeparator =
    parts.find((p) => p.type === 'decimal')?.value || '.';
  const groupSeparator = parts.find((p) => p.type === 'group')?.value || ',';

  // Remove currency symbols and group separators
  let normalized = formattedPrice
    .replace(/[^\d.,\-]/g, '')
    .replace(new RegExp(`\\${groupSeparator}`, 'g'), '');

  // Convert decimal separator to dot
  if (decimalSeparator !== '.') {
    normalized = normalized.replace(decimalSeparator, '.');
  }

  return parseFloat(normalized) || 0;
}
