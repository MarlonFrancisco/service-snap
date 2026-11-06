import { useMetricsQuery } from '@/hooks/use-query/use-metrics-query/use-metrics-query.hook';
import { useAnalytics } from '@/providers/analytics.provider';
import { downloadCsv, rowsToCsv } from '@/utils/helpers/csv.helper';
import { useCallback } from 'react';
import {
  useMetricsPeriod,
  useMetricsStore,
  useMetricsView,
} from '../dashboard-module.hook';
import type { TMetricCardConfig } from '../dashboard-module.types';
import {
  formatCount,
  formatPercent,
  formatRating,
  formatSignedPercent,
  formatSignedPoints,
  formatSignedRating,
  pluralize,
  toMetricNumber,
  translateMonth,
} from '../utils/metrics.helpers';

const MS_PER_DAY = 1000 * 60 * 60 * 24;
const DAYS_PER_WEEK = 7;
const DAYS_PER_MONTH = 30;

const formatLastVisit = (lastVisit: Date | string): string => {
  const daysAgo = Math.floor(
    (Date.now() - new Date(lastVisit).getTime()) / MS_PER_DAY,
  );

  // A consulta considera todos os agendamentos, inclusive os futuros.
  if (daysAgo < 0) return 'Agendamento futuro';
  if (daysAgo === 0) return 'Hoje';
  if (daysAgo < DAYS_PER_WEEK) {
    return `Há ${pluralize(daysAgo, 'dia', 'dias')}`;
  }
  if (daysAgo < DAYS_PER_MONTH) {
    return `Há ${pluralize(Math.floor(daysAgo / DAYS_PER_WEEK), 'semana', 'semanas')}`;
  }
  return `Há ${pluralize(Math.floor(daysAgo / DAYS_PER_MONTH), 'mês', 'meses')}`;
};

export const useCustomerMetrics = () => {
  const analytics = useAnalytics();
  const { period, setPeriod } = useMetricsPeriod('customers', 'month');
  const { activeStore, storeId, money } = useMetricsStore();
  const currency = activeStore.currency;
  const storeName = activeStore.name;

  const {
    customers,
    isPendingCustomers,
    isErrorCustomers,
    isFetchingCustomers,
    customersRefetch,
  } = useMetricsQuery({
    storeId,
    period,
    includeCustomers: true,
  });

  const customerCount = toMetricNumber(customers?.customerBase?.value);
  const vipCustomers = customers?.topVIPCustomers ?? [];
  const segments = customers?.ltvBySegment ?? [];

  const viewState = useMetricsView({
    section: 'customers',
    isPending: isPendingCustomers,
    isError: isErrorCustomers,
    isFetching: isFetchingCustomers,
    hasData: !!customers,
    hasActivity: customerCount > 0 || vipCustomers.length > 0,
    refetch: customersRefetch,
  });

  const summary = customers
    ? `${pluralize(customerCount, 'cliente', 'clientes')} · ${formatSignedPercent(customers.customerBase.comparison.percentageChange)}`
    : undefined;

  const getRatingCard = (): TMetricCardConfig => {
    const reviewCount = toMetricNumber(customers?.npsScore.reviewCount);

    if (!customers || reviewCount === 0) {
      return {
        label: 'Nota média',
        value: '—',
        detail: 'Sem avaliações no período',
      };
    }

    return {
      label: 'Nota média',
      value: formatRating(customers.npsScore.value),
      detail: `${formatSignedRating(customers.npsScore.comparison.absoluteChange)} · ${pluralize(reviewCount, 'avaliação', 'avaliações')}`,
    };
  };

  const stats: TMetricCardConfig[] = customers
    ? [
        {
          label: 'Base de clientes',
          value: formatCount(customerCount),
          detail: `+${formatCount(customers.customerBase.comparison.newCustomers)} novos`,
        },
        {
          label: 'Taxa de retenção',
          value: formatPercent(customers.retentionRate.value),
          detail: formatSignedPoints(
            customers.retentionRate.comparison.percentageChange,
          ),
        },
        {
          label: 'Valor médio por cliente',
          value: money.formatMoney(customers.averageLTV.value),
          detail: formatSignedPercent(
            customers.averageLTV.comparison.percentageChange,
          ),
        },
        getRatingCard(),
      ]
    : [];

  const evolution = (customers?.customerEvolution ?? []).map((item) => ({
    month: translateMonth(item.month),
    newCustomers: toMetricNumber(item.newCustomers),
    totalCustomers: toMetricNumber(item.totalCustomers),
  }));

  const segmentRows = segments.map((item) => ({
    segment: item.segment,
    value: money.formatMoney(item.averageLTV),
    detail: `${pluralize(toMetricNumber(item.customerCount), 'cliente', 'clientes')} · ${formatPercent(item.retentionRate)} ativos em 30 dias`,
  }));

  const topCustomers = vipCustomers.map((item) => ({
    id: item.customerId,
    name: item.customerName,
    detail: `${pluralize(toMetricNumber(item.visits), 'visita', 'visitas')} · ${formatLastVisit(item.lastVisit)}`,
    spent: money.formatMoney(item.totalSpent),
  }));

  const handleExportCsv = useCallback(() => {
    if (!customers) return;

    const amount = (value: number) =>
      toMetricNumber(value).toLocaleString('pt-BR', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      });

    const date = (value: Date | string) =>
      new Date(value).toLocaleDateString('pt-BR');

    const summaryRows = [
      ['Base de clientes', customers.customerBase.value, '', ''],
      ['Taxa de retenção (%)', customers.retentionRate.value, '', ''],
      [
        `Valor médio por cliente (${currency})`,
        amount(customers.averageLTV.value),
        '',
        '',
      ],
      ['Nota média', customers.npsScore.value, '', ''],
    ];

    const vipRows = (customers.topVIPCustomers ?? []).map((item) => [
      item.customerName,
      item.visits,
      amount(item.totalSpent),
      date(item.lastVisit),
    ]);

    const csvSegmentRows = (customers.ltvBySegment ?? []).map((item) => [
      item.segment,
      item.customerCount,
      amount(item.averageLTV),
      `${item.retentionRate}%`,
    ]);

    const csv = [
      rowsToCsv(['Métrica', 'Valor', '', ''], summaryRows),
      '',
      rowsToCsv(
        ['Cliente', 'Visitas', `Total gasto (${currency})`, 'Última visita'],
        vipRows,
      ),
      '',
      rowsToCsv(
        [
          'Segmento',
          'Clientes',
          `Valor médio (${currency})`,
          'Ativos em 30 dias',
        ],
        csvSegmentRows,
      ),
    ].join('\n');

    const stamp = new Date().toISOString().slice(0, 10);
    const storeSlug = (storeName || 'loja')
      .normalize('NFD')
      .replace(/[̀-ͯ]/g, '')
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');

    downloadCsv(`clientes-${storeSlug || 'loja'}-${stamp}.csv`, csv);

    if (storeId) {
      analytics.track('customers_exported', {
        store_id: storeId,
        period,
        rows: vipRows.length + csvSegmentRows.length,
      });
    }
  }, [analytics, customers, currency, storeName, storeId, period]);

  return {
    ...viewState,
    period,
    setPeriod,
    summary,
    stats,
    hasCustomers: !!customers,
    evolution,
    hasEvolution: evolution.some(
      (item) => item.totalCustomers > 0 || item.newCustomers > 0,
    ),
    segmentRows,
    topCustomers,
    handleExportCsv,
    canExport:
      customerCount > 0 || vipCustomers.length > 0 || segments.length > 0,
  };
};
