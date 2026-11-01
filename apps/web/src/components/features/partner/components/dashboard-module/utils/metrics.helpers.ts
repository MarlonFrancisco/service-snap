import { formatStorePrice, getCurrencySymbol } from '@/utils/helpers/price.helper';
import type { TCountryCode, TCurrencyCode } from '@repo/shared/constants';
import type {
  TMetricsView,
  TResolveMetricsViewConfig,
} from '../dashboard-module.types';
import { MONTH_LABELS_PT } from './metrics.constants';

const NUMBER_LOCALE = 'pt-BR';

/** A API devolve alguns totais do Postgres como string. */
export const toMetricNumber = (value: unknown): number => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
};

/** Arredonda pelo valor absoluto: `Math.round(-12.5)` iria para -12. */
const roundToOneDecimal = (value: unknown) => {
  const parsed = toMetricNumber(value);
  return (Math.sign(parsed) * Math.round(Math.abs(parsed) * 10)) / 10 || 0;
};

const getSign = (value: number) => (value > 0 ? '+' : value < 0 ? '-' : '');

export const formatDecimal = (value: unknown): string =>
  roundToOneDecimal(value).toLocaleString(NUMBER_LOCALE, {
    maximumFractionDigits: 1,
  });

export const formatPercent = (value: unknown): string =>
  `${formatDecimal(value)}%`;

export const formatSignedPercent = (value: unknown): string => {
  const rounded = roundToOneDecimal(value);
  return `${getSign(rounded)}${formatDecimal(Math.abs(rounded))}%`;
};

export const formatSignedPoints = (value: unknown): string => {
  const rounded = roundToOneDecimal(value);
  return `${getSign(rounded)}${formatDecimal(Math.abs(rounded))} p.p.`;
};

export const formatRating = (value: unknown): string =>
  roundToOneDecimal(value).toLocaleString(NUMBER_LOCALE, {
    minimumFractionDigits: 1,
    maximumFractionDigits: 1,
  });

export const formatSignedRating = (value: unknown): string => {
  const rounded = roundToOneDecimal(value);
  return `${getSign(rounded)}${formatRating(Math.abs(rounded))}`;
};

export const formatCount = (value: unknown): string =>
  toMetricNumber(value).toLocaleString(NUMBER_LOCALE);

export const pluralize = (count: number, singular: string, plural: string) =>
  `${formatCount(count)} ${count === 1 ? singular : plural}`;

export const createMoneyFormatters = (
  currency: TCurrencyCode,
  country: TCountryCode,
) => {
  const formatMoney = (value: unknown): string =>
    formatStorePrice(toMetricNumber(value), currency, country);

  const formatSignedMoney = (value: unknown): string => {
    const amount = toMetricNumber(value);
    return `${getSign(amount)}${formatMoney(Math.abs(amount))}`;
  };

  const currencySymbol = getCurrencySymbol(currency);

  const formatCompactMoney = (value: unknown): string =>
    `${currencySymbol} ${toMetricNumber(value).toLocaleString(NUMBER_LOCALE, {
      notation: 'compact',
      maximumFractionDigits: 1,
    })}`;

  return { formatMoney, formatSignedMoney, formatCompactMoney, currencySymbol };
};

export const sortByWeekOrder = <T extends { day: string }>(
  items: T[],
  weekOrder: readonly string[],
): T[] =>
  [...items].sort(
    (first, second) =>
      weekOrder.indexOf(first.day) - weekOrder.indexOf(second.day),
  );

/** "14h" vira "14h - 15h". */
export const formatHourRange = (hour: string): string => {
  const start = Number.parseInt(hour, 10);
  return Number.isNaN(start) ? hour : `${start}h - ${start + 1}h`;
};

export const translateMonth = (month: string): string => {
  const trimmed = month.trim();
  return MONTH_LABELS_PT[trimmed] ?? trimmed;
};

/** Faixas relativas ao maior valor do período: 0 sempre é o nível vazio. */
export const getHeatLevel = (value: number, maxValue: number): number => {
  if (value <= 0 || maxValue <= 0) return 0;
  return Math.min(Math.ceil((value / maxValue) * 3), 3);
};

/**
 * Aceita "20000", "20.000", "20000,00" e "R$ 20.000,00". Um separador seguido
 * de exatamente três dígitos é de milhar. Devolve `null` quando não há número.
 */
export const parseMoneyInput = (raw: string): number | null => {
  if (raw.includes('-')) return null;

  const cleaned = raw.replace(/[^\d.,]/g, '');
  if (!/\d/.test(cleaned)) return null;

  const separatorIndex = Math.max(
    cleaned.lastIndexOf(','),
    cleaned.lastIndexOf('.'),
  );
  const decimalDigits =
    separatorIndex >= 0 ? cleaned.length - separatorIndex - 1 : 0;
  const hasDecimals = separatorIndex >= 0 && decimalDigits !== 3;

  const integerPart = hasDecimals ? cleaned.slice(0, separatorIndex) : cleaned;
  const decimalPart = hasDecimals ? cleaned.slice(separatorIndex + 1) : '';

  return Number(
    `${integerPart.replace(/\D/g, '') || '0'}.${decimalPart || '0'}`,
  );
};

export const resolveMetricsView = ({
  isStoreLoading,
  hasStoreError,
  hasNoStore,
  isPending,
  isError,
  hasData,
  hasActivity,
}: TResolveMetricsViewConfig): TMetricsView => {
  if (hasStoreError) return 'error';
  if (isStoreLoading) return 'loading';
  if (hasNoStore) return 'no-store';
  if (hasData) return hasActivity ? 'ready' : 'empty';
  if (isError) return 'error';
  if (isPending) return 'loading';
  return 'empty';
};
