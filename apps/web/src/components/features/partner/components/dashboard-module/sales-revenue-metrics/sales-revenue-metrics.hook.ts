import { useMetricsQuery } from '@/hooks/use-query/use-metrics-query/use-metrics-query.hook';
import { useCallback } from 'react';
import {
  useMetricsPeriod,
  useMetricsStore,
  useMetricsView,
} from '../dashboard-module.hook';
import type { TMetricCardConfig } from '../dashboard-module.types';
import { WEEK_FROM_SUNDAY } from '../utils/metrics.constants';
import {
  formatHourRange,
  formatPercent,
  formatSignedPercent,
  formatSignedPoints,
  sortByWeekOrder,
  toMetricNumber,
} from '../utils/metrics.helpers';

const PROFITABLE_HOURS_LIMIT = 6;

export const useSalesRevenueMetrics = () => {
  const { period, setPeriod } = useMetricsPeriod('sales', 'month');
  const { storeId, money } = useMetricsStore();

  const { sales, isPendingSales, isErrorSales, isFetchingSales, salesRefetch } =
    useMetricsQuery({
      storeId,
      period,
      includeSales: true,
    });

  const hasActivity =
    !!sales &&
    (toMetricNumber(sales.revenue.value) > 0 ||
      toMetricNumber(sales.conversionRate.value) > 0 ||
      sales.topServices.length > 0 ||
      sales.revenueEvolution.some((month) => month.revenue > 0));

  const viewState = useMetricsView({
    section: 'sales',
    isPending: isPendingSales,
    isError: isErrorSales,
    isFetching: isFetchingSales,
    hasData: !!sales,
    hasActivity,
    refetch: salesRefetch,
  });

  const handleSelectMonthly = useCallback(
    () => setPeriod('month'),
    [setPeriod],
  );

  const summary = sales
    ? `${money.formatMoney(sales.revenue.value)} · ${
        toMetricNumber(sales.revenue.previousValue) > 0
          ? formatSignedPercent(sales.revenue.percentageChange)
          : 'sem receita no período anterior'
      }`
    : undefined;

  const stats: TMetricCardConfig[] = sales
    ? [
        {
          label: 'Receita',
          value: money.formatMoney(sales.revenue.value),
          detail: money.formatSignedMoney(sales.revenue.absoluteChange),
        },
        {
          label: 'Ticket médio',
          value: money.formatMoney(sales.averageTicket.value),
          detail: money.formatSignedMoney(sales.averageTicket.absoluteChange),
        },
        {
          label: 'Agendamentos concluídos',
          value: formatPercent(sales.conversionRate.value),
          detail: formatSignedPoints(sales.conversionRate.variationInPoints),
        },
        {
          label: 'Receita por hora',
          value: money.formatMoney(sales.revenuePerHour.value),
          detail: money.formatSignedMoney(
            sales.revenuePerHour.value - sales.revenuePerHour.previousValue,
          ),
        },
      ]
    : [];

  const revenueEvolution = (sales?.revenueEvolution ?? []).map((month) => ({
    month: month.month,
    revenue: toMetricNumber(month.revenue),
    goal: toMetricNumber(month.goal),
  }));

  const revenueByDay = sortByWeekOrder(
    sales?.revenueByDayOfWeek ?? [],
    WEEK_FROM_SUNDAY,
  ).map((day) => ({
    day: day.day,
    revenue: toMetricNumber(day.averageRevenue),
  }));

  const profitableHours = [...(sales?.profitableHours ?? [])]
    .sort(
      (first, second) =>
        toMetricNumber(second.revenue) - toMetricNumber(first.revenue),
    )
    .slice(0, PROFITABLE_HOURS_LIMIT)
    .map((item) => ({
      hour: formatHourRange(item.hour),
      revenue: item.revenue,
    }));

  const mostProfitableDay = sales?.insights.mostProfitableDay;

  return {
    ...viewState,
    period,
    setPeriod,
    handleSelectMonthly,
    storeId,
    money,
    sales,
    summary,
    stats,
    revenueEvolution,
    hasEvolution: revenueEvolution.some(
      (month) => month.revenue > 0 || month.goal > 0,
    ),
    hasGoalLine: revenueEvolution.some((month) => month.goal > 0),
    revenueByDay,
    hasRevenueByDay: revenueByDay.some((day) => day.revenue > 0),
    peakDayRevenue: Math.max(0, ...revenueByDay.map((day) => day.revenue)),
    revenueByCategory: sales?.revenueByCategory ?? [],
    topServices: sales?.topServices ?? [],
    profitableHours,
    hasProfitableDay: toMetricNumber(mostProfitableDay?.averageRevenue) > 0,
    mostProfitableDay,
    opportunity: sales?.insights.opportunities[0],
  };
};
