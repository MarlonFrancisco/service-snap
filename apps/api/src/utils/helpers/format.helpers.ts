import { getStoreCurrency, getStoreLocale } from './region.helpers';
import type { TRegionSource } from './region.types';

/**
 * Valor em unidades maiores (50.5 = R$ 50,50). O locale define separadores e
 * posição do símbolo; para lojas use `getStoreLocale`, que segue o país.
 */
export const formatCurrency = (
  value: number,
  currency = 'BRL',
  locale = 'pt-BR',
): string =>
  new Intl.NumberFormat(locale, {
    style: 'currency',
    currency: currency.toUpperCase(),
  }).format(value);

/** Valor na moeda da loja, com o padrão numérico do país dela. */
export const formatStoreCurrency = (
  value: number,
  store?: TRegionSource | null,
): string =>
  formatCurrency(Number(value), getStoreCurrency(store), getStoreLocale(store));
