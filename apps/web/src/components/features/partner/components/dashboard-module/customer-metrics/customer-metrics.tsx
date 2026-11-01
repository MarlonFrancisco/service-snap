'use client';

import { PARTNER_FOCUS_CLASS } from '@/components/features/partner/partner.styles';
import { cn } from '@repo/ui';
import {
  Area,
  CartesianGrid,
  ComposedChart,
  Line,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import {
  MetricCard,
  MetricsChartTable,
  MetricsPageHeader,
  MetricsRefreshAlert,
  MetricsRow,
  MetricsSection,
  MetricsSectionEmpty,
} from '../components/metrics-ui';
import { MetricsState } from '../components/metrics-state';
import { PeriodFilterWithRefresh } from '../components/period-filter-with-refresh';
import {
  METRICS_AXIS_PROPS,
  METRICS_CHART_COLORS,
  METRICS_KPI_GRID_CLASS,
  METRICS_LEGEND_CLASS,
  METRICS_PAGE_CLASS,
  METRICS_SECTION_GRID_CLASS,
  METRICS_TOOLTIP_STYLE,
} from '../dashboard-module.styles';
import { formatCount } from '../utils/metrics.helpers';
import { CustomerMetricsNotFound } from './customer-metrics-not-found';
import { useCustomerMetrics } from './customer-metrics.hook';

export function CustomerMetricsModule() {
  const {
    view,
    isRefreshing,
    hasRefreshError,
    handleRefresh,
    handleRetry,
    period,
    setPeriod,
    summary,
    stats,
    hasCustomers,
    evolution,
    hasEvolution,
    segmentRows,
    topCustomers,
    handleExportCsv,
    canExport,
  } = useCustomerMetrics();

  if (view === 'no-store') {
    return (
      <MetricsState
        view={view}
        onRetry={handleRetry}
        empty={<CustomerMetricsNotFound />}
      />
    );
  }

  return (
    <div className={METRICS_PAGE_CLASS}>
      <MetricsPageHeader title="Base de clientes" summary={summary}>
        <div className="flex w-full flex-wrap items-center gap-2 md:w-auto">
          <PeriodFilterWithRefresh
            value={period}
            onValueChange={setPeriod}
            onRefresh={handleRefresh}
            isRefreshing={isRefreshing}
          />
          <button
            type="button"
            onClick={handleExportCsv}
            disabled={!canExport}
            className={cn(
              'h-[50px] w-full rounded-full border border-[#0B0B0F] bg-white px-5 text-[13px] font-bold transition-colors hover:bg-[#F7F6FA] disabled:cursor-not-allowed disabled:opacity-50 md:w-auto',
              PARTNER_FOCUS_CLASS,
            )}
          >
            Exportar CSV
          </button>
        </div>
      </MetricsPageHeader>

      {hasRefreshError && <MetricsRefreshAlert />}

      {view === 'ready' && hasCustomers ? (
        <>
          <div className={METRICS_KPI_GRID_CLASS}>
            {stats.map((stat) => (
              <MetricCard key={stat.label} {...stat} />
            ))}
          </div>

          <MetricsSection
            title="Evolução de clientes"
            subtitle="Clientes atendidos e novos clientes nos últimos 6 meses"
          >
            {hasEvolution ? (
              <>
                <MetricsChartTable
                  caption="Clientes por mês"
                  headers={['Mês', 'Clientes no mês', 'Novos']}
                  rows={evolution.map((item) => [
                    item.month,
                    item.totalCustomers,
                    item.newCustomers,
                  ])}
                />
                <div aria-hidden="true" className="h-[220px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <ComposedChart
                      data={evolution}
                      margin={{ top: 8, right: 8, left: 0, bottom: 0 }}
                    >
                      <CartesianGrid
                        stroke={METRICS_CHART_COLORS.grid}
                        vertical={false}
                      />
                      <XAxis dataKey="month" {...METRICS_AXIS_PROPS} />
                      <YAxis
                        {...METRICS_AXIS_PROPS}
                        width={40}
                        allowDecimals={false}
                      />
                      <Tooltip
                        contentStyle={METRICS_TOOLTIP_STYLE}
                        formatter={(value, name) => [formatCount(value), name]}
                      />
                      <Area
                        type="monotone"
                        dataKey="totalCustomers"
                        name="Clientes no mês"
                        stroke={METRICS_CHART_COLORS.ink}
                        strokeWidth={2}
                        fill={METRICS_CHART_COLORS.area}
                        fillOpacity={1}
                      />
                      <Line
                        type="monotone"
                        dataKey="newCustomers"
                        name="Novos"
                        stroke={METRICS_CHART_COLORS.muted}
                        strokeWidth={2}
                        dot={{ r: 3, fill: METRICS_CHART_COLORS.muted }}
                      />
                    </ComposedChart>
                  </ResponsiveContainer>
                </div>
                <div aria-hidden="true" className={METRICS_LEGEND_CLASS}>
                  <span className="flex items-center gap-1.5">
                    <span className="h-0.5 w-4 bg-[#0B0B0F]" />
                    Clientes no mês
                  </span>
                  <span className="flex items-center gap-1.5">
                    <span className="h-0.5 w-4 bg-[#5F5C6E]" />
                    Novos
                  </span>
                </div>
              </>
            ) : (
              <MetricsSectionEmpty message="Nenhum dado de clientes nos últimos 6 meses." />
            )}
          </MetricsSection>

          <div className={METRICS_SECTION_GRID_CLASS}>
            <MetricsSection
              title="Valor por segmento"
              subtitle="Valor médio e clientes ativos por tipo de cliente"
            >
              {segmentRows.length > 0 ? (
                segmentRows.map((item) => (
                  <MetricsRow
                    key={item.segment}
                    label={item.segment}
                    sublabel={item.detail}
                    value={item.value}
                  />
                ))
              ) : (
                <MetricsSectionEmpty message="Nenhum segmento de clientes ainda." />
              )}
            </MetricsSection>

            <MetricsSection
              title="Top clientes"
              subtitle="Clientes com maior valor gerado"
            >
              {topCustomers.length > 0 ? (
                topCustomers.map((customer, index) => (
                  <MetricsRow
                    key={customer.id}
                    label={`${index + 1}º ${customer.name}`}
                    sublabel={customer.detail}
                    value={customer.spent}
                  />
                ))
              ) : (
                <MetricsSectionEmpty message="Nenhum cliente com valor registrado ainda." />
              )}
            </MetricsSection>
          </div>
        </>
      ) : (
        <MetricsState
          view={view}
          onRetry={handleRetry}
          empty={<CustomerMetricsNotFound />}
        />
      )}
    </div>
  );
}
