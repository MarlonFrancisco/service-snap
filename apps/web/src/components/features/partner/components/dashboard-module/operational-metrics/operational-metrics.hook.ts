import { useMetricsQuery } from '@/hooks/use-query/use-metrics-query';
import {
  useMetricsPeriod,
  useMetricsStore,
  useMetricsView,
} from '../dashboard-module.hook';
import type { TMetricCardConfig } from '../dashboard-module.types';
import { WEEK_FROM_MONDAY } from '../utils/metrics.constants';
import {
  formatPercent,
  formatSignedPoints,
  getHeatLevel,
  toMetricNumber,
} from '../utils/metrics.helpers';

const STATUS_LABELS = {
  completed: 'Concluídos',
  scheduled: 'Agendados',
  'no-show': 'Não compareceram',
  cancelled: 'Cancelados',
} as const;

export const useOperationalMetrics = () => {
  const { period, setPeriod } = useMetricsPeriod('operational', 'month');
  const { storeId, money } = useMetricsStore();

  const {
    operational,
    isPendingOperational,
    isErrorOperational,
    isFetchingOperational,
    operationalRefetch,
  } = useMetricsQuery({
    storeId,
    period,
    includeOperational: true,
  });

  const statusRows = (operational?.appointmentStatus ?? []).map((item) => ({
    status: item.status,
    label: STATUS_LABELS[item.status],
    quantity: toMetricNumber(item.quantity),
  }));
  const totalAppointments = statusRows.reduce(
    (total, item) => total + item.quantity,
    0,
  );

  const viewState = useMetricsView({
    section: 'operational',
    isPending: isPendingOperational,
    isError: isErrorOperational,
    isFetching: isFetchingOperational,
    hasData: !!operational,
    hasActivity: totalAppointments > 0,
    refetch: operationalRefetch,
  });

  const summary = operational
    ? `${formatPercent(operational.occupancyRate.value)} de ocupação · ${formatSignedPoints(
        operational.occupancyRate.value -
          operational.occupancyRate.previousValue,
      )}`
    : undefined;

  const stats: TMetricCardConfig[] = operational
    ? [
        {
          label: 'Taxa de ocupação',
          value: formatPercent(operational.occupancyRate.value),
          detail: `Anterior: ${formatPercent(operational.occupancyRate.previousValue)}`,
        },
        {
          label: 'Tempo médio',
          value: `${toMetricNumber(operational.averageTime.value)}min`,
          detail: `Anterior: ${toMetricNumber(operational.averageTime.previousValue)}min`,
        },
        {
          label: 'Profissionais com agendamento',
          value: formatPercent(operational.teamEfficiency.value),
          detail: `Anterior: ${formatPercent(operational.teamEfficiency.previousValue)}`,
        },
        {
          label: 'Taxa de conclusão',
          value: formatPercent(operational.punctualityRate.value),
          detail: `Não compareceu: ${formatPercent(operational.punctualityRate.noShowRate)}`,
        },
      ]
    : [];

  const heatMap = operational?.occupancyHeatMap;
  const heatValues = heatMap?.data.flatMap((row) =>
    row.values.map(toMetricNumber),
  );
  const maxHeatValue = Math.max(0, ...(heatValues ?? []));

  const heatMapRows = (heatMap?.hours ?? []).map((hour, hourIndex) => ({
    hour,
    cells: WEEK_FROM_MONDAY.map((day) => {
      const count = toMetricNumber(
        heatMap?.data.find((row) => row.day === day)?.values[hourIndex],
      );
      return { day, count, level: getHeatLevel(count, maxHeatValue) };
    }),
  }));

  const professionals = (operational?.professionalPerformance ?? []).map(
    (professional) => ({
      id: professional.id,
      name: professional.name,
      appointmentCount: toMetricNumber(professional.appointmentCount),
      completionRate: professional.punctualityRate,
      revenue: professional.revenue,
    }),
  );

  return {
    ...viewState,
    period,
    setPeriod,
    money,
    summary,
    stats,
    hasOperational: !!operational,
    heatMapRows,
    hasHeatMap: maxHeatValue > 0,
    statusRows,
    totalAppointments,
    periodRows: operational?.periodDistribution ?? [],
    serviceDurations: operational?.serviceDuration ?? [],
    professionals,
  };
};
