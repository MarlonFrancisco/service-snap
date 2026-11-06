import { useMetricsQuery } from '@/hooks/use-query/use-metrics-query/use-metrics-query.hook';
import {
  useMetricsPeriod,
  useMetricsStore,
  useMetricsView,
} from '../dashboard-module.hook';
import { METRICS_RANK_COLORS } from '../dashboard-module.styles';
import type { TMetricCardConfig } from '../dashboard-module.types';
import {
  PERIOD_COMPARISON_TEXT,
  PERIOD_CURRENT_TEXT,
  WEEK_FROM_MONDAY,
} from '../utils/metrics.constants';
import {
  formatCount,
  formatPercent,
  formatRating,
  formatSignedPoints,
  formatSignedRating,
  pluralize,
  sortByWeekOrder,
  toMetricNumber,
} from '../utils/metrics.helpers';

const FALLBACK_RANK_COLOR = '#EBE9F0';

export const useGeneralMetrics = () => {
  const { period, setPeriod } = useMetricsPeriod('overview', 'week');
  const { storeId, money } = useMetricsStore();

  const {
    overview,
    isPendingOverview,
    isErrorOverview,
    isFetchingOverview,
    overviewRefetch,
  } = useMetricsQuery({
    storeId,
    period,
    includeOverview: true,
  });

  const hasActivity =
    !!overview &&
    (toMetricNumber(overview.weeklyRevenue.value) > 0 ||
      overview.averageRating.reviewCount > 0 ||
      overview.topServices.length > 0 ||
      toMetricNumber(overview.newCustomers) > 0 ||
      overview.appointmentsByDay.some(
        (day) => toMetricNumber(day.appointments) > 0,
      ));

  const viewState = useMetricsView({
    section: 'overview',
    isPending: isPendingOverview,
    isError: isErrorOverview,
    isFetching: isFetchingOverview,
    hasData: !!overview,
    hasActivity,
    refetch: overviewRefetch,
  });

  const comparison = PERIOD_COMPARISON_TEXT[period];
  const currentPeriodText = PERIOD_CURRENT_TEXT[period];

  const getRatingCard = (): TMetricCardConfig => {
    const rating = overview?.averageRating;

    if (!rating || rating.reviewCount === 0) {
      return {
        label: 'Avaliação média',
        value: '—',
        detail: `Sem avaliações ${currentPeriodText}`,
      };
    }

    if (toMetricNumber(rating.previousValue) === 0) {
      return {
        label: 'Avaliação média',
        value: formatRating(rating.value),
        detail: pluralize(rating.reviewCount, 'avaliação', 'avaliações'),
      };
    }

    return {
      label: 'Avaliação média',
      value: formatRating(rating.value),
      detail: formatSignedRating(rating.value - rating.previousValue),
      comparison,
    };
  };

  const primaryStats: TMetricCardConfig[] = overview
    ? [
        {
          label: 'Receita',
          value: money.formatMoney(overview.weeklyRevenue.value),
          detail: money.formatSignedMoney(
            overview.weeklyRevenue.absoluteChange,
          ),
          comparison,
        },
        {
          label: 'Taxa de ocupação',
          value: formatPercent(overview.occupationRate.value),
          detail: formatSignedPoints(
            overview.occupationRate.value -
              overview.occupationRate.previousValue,
          ),
          comparison,
        },
        {
          label: 'Ticket médio',
          value: money.formatMoney(overview.averageTicket.value),
          detail: money.formatSignedMoney(
            overview.averageTicket.absoluteChange,
          ),
          comparison,
        },
        getRatingCard(),
      ]
    : [];

  const secondaryStats: TMetricCardConfig[] = overview
    ? [
        { label: 'Novos clientes', value: formatCount(overview.newCustomers) },
        {
          label: 'Clientes recorrentes',
          value: formatCount(overview.recurringCustomers),
        },
        {
          label: 'Taxa de cancelamento',
          value: formatPercent(overview.cancellationRate.value),
        },
        {
          label: 'Agendamentos concluídos',
          value: formatPercent(overview.conversionRate.value),
        },
      ]
    : [];

  const appointmentsByDay = sortByWeekOrder(
    overview?.appointmentsByDay ?? [],
    WEEK_FROM_MONDAY,
  ).map((day) => ({
    day: day.day,
    appointments: toMetricNumber(day.appointments),
    bookedValue: toMetricNumber(day.revenue),
  }));

  const topServices = (overview?.topServices ?? []).map((service, index) => ({
    id: service.id,
    name: service.name,
    bookings: toMetricNumber(service.bookings),
    color: METRICS_RANK_COLORS[index] ?? FALLBACK_RANK_COLOR,
  }));

  return {
    ...viewState,
    period,
    setPeriod,
    money,
    currentPeriodText,
    primaryStats,
    secondaryStats,
    appointmentsByDay,
    hasAppointments: appointmentsByDay.some((day) => day.appointments > 0),
    topServices,
    hasOverview: !!overview,
  };
};
