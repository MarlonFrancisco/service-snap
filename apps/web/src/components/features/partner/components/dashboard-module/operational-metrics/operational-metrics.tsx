'use client';

import {
  PARTNER_FOCUS_CLASS,
  PARTNER_MUTED_TEXT_CLASS,
} from '@/components/features/partner/partner.styles';
import { cn } from '@repo/ui';
import {
  MetricCard,
  MetricsPageHeader,
  MetricsRefreshAlert,
  MetricsRow,
  MetricsSection,
  MetricsSectionEmpty,
} from '../components/metrics-ui';
import { MetricsState } from '../components/metrics-state';
import { PeriodFilterWithRefresh } from '../components/period-filter-with-refresh';
import {
  METRICS_HEAT_LEVEL_CLASSES,
  METRICS_KPI_GRID_CLASS,
  METRICS_PAGE_CLASS,
  METRICS_SECTION_GRID_CLASS,
} from '../dashboard-module.styles';
import { WEEK_FROM_MONDAY } from '../utils/metrics.constants';
import {
  formatCount,
  formatPercent,
  pluralize,
} from '../utils/metrics.helpers';
import { OperationalMetricsNotFound } from './operational-metrics-not-found';
import { useOperationalMetrics } from './operational-metrics.hook';

export function OperationalMetricsModule() {
  const {
    view,
    isRefreshing,
    hasRefreshError,
    handleRefresh,
    handleRetry,
    period,
    setPeriod,
    money,
    summary,
    stats,
    hasOperational,
    heatMapRows,
    hasHeatMap,
    statusRows,
    totalAppointments,
    periodRows,
    serviceDurations,
    professionals,
  } = useOperationalMetrics();

  if (view === 'no-store') {
    return (
      <MetricsState
        view={view}
        onRetry={handleRetry}
        empty={<OperationalMetricsNotFound />}
      />
    );
  }

  return (
    <div className={METRICS_PAGE_CLASS}>
      <MetricsPageHeader title="Eficiência operacional" summary={summary}>
        <PeriodFilterWithRefresh
          value={period}
          onValueChange={setPeriod}
          onRefresh={handleRefresh}
          isRefreshing={isRefreshing}
        />
      </MetricsPageHeader>

      {hasRefreshError && <MetricsRefreshAlert />}

      {view === 'ready' && hasOperational ? (
        <>
          <div className={METRICS_KPI_GRID_CLASS}>
            {stats.map((stat) => (
              <MetricCard key={stat.label} {...stat} />
            ))}
          </div>

          <MetricsSection
            title="Agendamentos por horário"
            subtitle="Número de agendamentos em cada faixa de hora, por dia da semana"
          >
            {hasHeatMap ? (
              <div
                tabIndex={0}
                role="region"
                aria-label="Tabela de agendamentos por horário"
                className={cn('overflow-x-auto', PARTNER_FOCUS_CLASS)}
              >
                <table className="w-full min-w-[620px] table-fixed border-separate border-spacing-1 text-center text-xs">
                  <caption className="sr-only">
                    Agendamentos por horário e dia da semana
                  </caption>
                  <thead>
                    <tr>
                      <td className="w-14" />
                      {WEEK_FROM_MONDAY.map((day) => (
                        <th
                          key={day}
                          scope="col"
                          className={cn('p-1 font-bold', PARTNER_MUTED_TEXT_CLASS)}
                        >
                          {day}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {heatMapRows.map((row) => (
                      <tr key={row.hour}>
                        <th
                          scope="row"
                          className={cn('p-1 font-bold', PARTNER_MUTED_TEXT_CLASS)}
                        >
                          {row.hour}
                        </th>
                        {row.cells.map((cell) => (
                          <td
                            key={cell.day}
                            className={cn(
                              'rounded-lg py-2.5 font-bold',
                              METRICS_HEAT_LEVEL_CLASSES[cell.level],
                            )}
                          >
                            {formatCount(cell.count)}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <MetricsSectionEmpty message="Nenhum agendamento com horário neste período." />
            )}
          </MetricsSection>

          <div className={METRICS_SECTION_GRID_CLASS}>
            <MetricsSection
              title="Status dos agendamentos"
              subtitle={`Distribuição atual de ${pluralize(totalAppointments, 'agendamento', 'agendamentos')}`}
            >
              {statusRows.map((item) => (
                <MetricsRow
                  key={item.status}
                  label={item.label}
                  value={formatCount(item.quantity)}
                />
              ))}
            </MetricsSection>

            <MetricsSection
              title="Distribuição por período"
              subtitle="Concentração de agendamentos ao longo do dia"
            >
              {periodRows.length > 0 ? (
                periodRows.map((item) => (
                  <MetricsRow
                    key={item.period}
                    label={item.label}
                    value={formatCount(item.appointmentCount)}
                  />
                ))
              ) : (
                <MetricsSectionEmpty message="Nenhum agendamento com horário neste período." />
              )}
            </MetricsSection>

            <MetricsSection
              title="Duração média por serviço"
              subtitle="Duração cadastrada dos serviços agendados no período"
            >
              {serviceDurations.length > 0 ? (
                serviceDurations.map((service) => (
                  <MetricsRow
                    key={service.id}
                    label={service.name}
                    value={`${service.averageRealTime}min`}
                  />
                ))
              ) : (
                <MetricsSectionEmpty message="Nenhum serviço agendado neste período." />
              )}
            </MetricsSection>

            <MetricsSection
              title="Desempenho por profissional"
              subtitle="Agendamentos, conclusão e receita"
            >
              {professionals.length > 0 ? (
                professionals.map((professional) => (
                  <MetricsRow
                    key={professional.id}
                    label={professional.name}
                    sublabel={`${pluralize(professional.appointmentCount, 'agendamento', 'agendamentos')} · ${formatPercent(professional.completionRate)} concluídos`}
                    value={money.formatMoney(professional.revenue)}
                  />
                ))
              ) : (
                <MetricsSectionEmpty message="Nenhum profissional com agendamento neste período." />
              )}
            </MetricsSection>
          </div>
        </>
      ) : (
        <MetricsState
          view={view}
          onRetry={handleRetry}
          empty={<OperationalMetricsNotFound />}
        />
      )}
    </div>
  );
}
