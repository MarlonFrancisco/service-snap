'use client';

import {
  Area,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
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
import {
  formatSignedPercent,
  pluralize,
  toMetricNumber,
} from '../utils/metrics.helpers';
import { SalesGoalCard } from './sales-goal-card';
import { SalesRevenueMetricsNotFound } from './sales-revenue-metrics-not-found';
import { useSalesRevenueMetrics } from './sales-revenue-metrics.hook';

export function SalesRevenueMetricsModule() {
  const {
    view,
    isRefreshing,
    hasRefreshError,
    handleRefresh,
    handleRetry,
    period,
    setPeriod,
    handleSelectMonthly,
    storeId,
    money,
    sales,
    summary,
    stats,
    revenueEvolution,
    hasEvolution,
    hasGoalLine,
    revenueByDay,
    hasRevenueByDay,
    peakDayRevenue,
    revenueByCategory,
    topServices,
    profitableHours,
    hasProfitableDay,
    mostProfitableDay,
    opportunity,
  } = useSalesRevenueMetrics();

  if (view === 'no-store') {
    return (
      <MetricsState
        view={view}
        onRetry={handleRetry}
        empty={<SalesRevenueMetricsNotFound />}
      />
    );
  }

  return (
    <div className={METRICS_PAGE_CLASS}>
      <MetricsPageHeader title="Performance de vendas" summary={summary}>
        <PeriodFilterWithRefresh
          value={period}
          onValueChange={setPeriod}
          onRefresh={handleRefresh}
          isRefreshing={isRefreshing}
        />
      </MetricsPageHeader>

      {hasRefreshError && <MetricsRefreshAlert />}

      {sales && storeId && (
        <SalesGoalCard
          storeId={storeId}
          period={period}
          goal={sales.goal}
          money={money}
          onSelectMonthly={handleSelectMonthly}
        />
      )}

      {view === 'ready' && sales ? (
        <>
          <div className={METRICS_KPI_GRID_CLASS}>
            {stats.map((stat) => (
              <MetricCard key={stat.label} {...stat} />
            ))}
          </div>

          <div className={METRICS_SECTION_GRID_CLASS}>
            <MetricsSection
              title="Evolução de receita"
              subtitle={
                hasGoalLine
                  ? 'Receita nos últimos 6 meses, comparada à meta mensal atual'
                  : 'Receita nos últimos 6 meses'
              }
            >
              {hasEvolution ? (
                <>
                  <MetricsChartTable
                    caption="Receita por mês"
                    headers={
                      hasGoalLine
                        ? ['Mês', 'Receita', 'Meta atual']
                        : ['Mês', 'Receita']
                    }
                    rows={revenueEvolution.map((month) =>
                      hasGoalLine
                        ? [
                            month.month,
                            money.formatMoney(month.revenue),
                            money.formatMoney(month.goal),
                          ]
                        : [month.month, money.formatMoney(month.revenue)],
                    )}
                  />
                  <div aria-hidden="true" className="h-[220px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <ComposedChart
                        data={revenueEvolution}
                        margin={{ top: 8, right: 8, left: 0, bottom: 0 }}
                      >
                        <CartesianGrid
                          stroke={METRICS_CHART_COLORS.grid}
                          vertical={false}
                        />
                        <XAxis dataKey="month" {...METRICS_AXIS_PROPS} />
                        <YAxis
                          {...METRICS_AXIS_PROPS}
                          width={64}
                          tickFormatter={money.formatCompactMoney}
                        />
                        <Tooltip
                          contentStyle={METRICS_TOOLTIP_STYLE}
                          formatter={(value, name) => [
                            money.formatMoney(value),
                            name,
                          ]}
                        />
                        <Area
                          type="monotone"
                          dataKey="revenue"
                          name="Receita"
                          stroke={METRICS_CHART_COLORS.ink}
                          strokeWidth={2}
                          fill={METRICS_CHART_COLORS.area}
                          fillOpacity={1}
                        />
                        {hasGoalLine && (
                          <Line
                            type="monotone"
                            dataKey="goal"
                            name="Meta atual"
                            stroke={METRICS_CHART_COLORS.muted}
                            strokeWidth={2}
                            strokeDasharray="5 5"
                            dot={false}
                          />
                        )}
                      </ComposedChart>
                    </ResponsiveContainer>
                  </div>
                  {hasGoalLine && (
                    <div aria-hidden="true" className={METRICS_LEGEND_CLASS}>
                      <span className="flex items-center gap-1.5">
                        <span className="h-0.5 w-4 bg-[#0B0B0F]" />
                        Receita
                      </span>
                      <span className="flex items-center gap-1.5">
                        <span className="w-4 border-t-2 border-dashed border-[#5F5C6E]" />
                        Meta atual
                      </span>
                    </div>
                  )}
                </>
              ) : (
                <MetricsSectionEmpty message="Nenhuma receita nos últimos 6 meses." />
              )}
            </MetricsSection>

            <MetricsSection
              title="Receita por dia da semana"
              subtitle="Total de cada dia da semana no período"
            >
              {hasRevenueByDay ? (
                <>
                  <MetricsChartTable
                    caption="Receita por dia da semana"
                    headers={['Dia', 'Receita']}
                    rows={revenueByDay.map((day) => [
                      day.day,
                      money.formatMoney(day.revenue),
                    ])}
                  />
                  <div aria-hidden="true" className="h-[220px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart
                        data={revenueByDay}
                        margin={{ top: 8, right: 8, left: 0, bottom: 0 }}
                      >
                        <CartesianGrid
                          stroke={METRICS_CHART_COLORS.grid}
                          vertical={false}
                        />
                        <XAxis dataKey="day" {...METRICS_AXIS_PROPS} />
                        <YAxis
                          {...METRICS_AXIS_PROPS}
                          width={64}
                          tickFormatter={money.formatCompactMoney}
                        />
                        <Tooltip
                          contentStyle={METRICS_TOOLTIP_STYLE}
                          cursor={{ fill: METRICS_CHART_COLORS.area }}
                          formatter={(value) => [
                            money.formatMoney(value),
                            'Receita',
                          ]}
                        />
                        <Bar dataKey="revenue" radius={[4, 4, 0, 0]} maxBarSize={50}>
                          {revenueByDay.map((day) => (
                            <Cell
                              key={day.day}
                              fill={
                                day.revenue === peakDayRevenue
                                  ? METRICS_CHART_COLORS.ink
                                  : METRICS_CHART_COLORS.bar
                              }
                            />
                          ))}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </>
              ) : (
                <MetricsSectionEmpty message="Nenhuma receita neste período." />
              )}
            </MetricsSection>
          </div>

          <div className={METRICS_SECTION_GRID_CLASS}>
            <MetricsSection
              title="Receita por categoria"
              subtitle="Performance e crescimento por tipo de serviço"
            >
              {revenueByCategory.length > 0 ? (
                revenueByCategory.map((category) => (
                  <MetricsRow
                    key={category.id}
                    label={category.name}
                    value={`${money.formatMoney(category.revenue)} · ${formatSignedPercent(category.growthPercentage)}`}
                  />
                ))
              ) : (
                <MetricsSectionEmpty message="Nenhuma categoria com receita neste período." />
              )}
            </MetricsSection>

            <MetricsSection
              title="Top serviços por receita"
              subtitle="Ranking dos serviços mais rentáveis"
            >
              {topServices.length > 0 ? (
                topServices.map((service, index) => (
                  <MetricsRow
                    key={service.id}
                    label={`${index + 1}º ${service.name}`}
                    sublabel={pluralize(
                      toMetricNumber(service.appointments),
                      'agendamento',
                      'agendamentos',
                    )}
                    value={money.formatMoney(service.revenue)}
                  />
                ))
              ) : (
                <MetricsSectionEmpty message="Nenhum serviço vendido neste período." />
              )}
            </MetricsSection>

            <MetricsSection
              title="Horários mais rentáveis"
              subtitle="Receita por faixa de horário no período"
            >
              {profitableHours.length > 0 ? (
                profitableHours.map((item) => (
                  <MetricsRow
                    key={item.hour}
                    label={item.hour}
                    value={money.formatMoney(item.revenue)}
                  />
                ))
              ) : (
                <MetricsSectionEmpty message="Nenhum horário com receita neste período." />
              )}
            </MetricsSection>

            <MetricsSection title="Destaques" subtitle="Leitura do período">
              <MetricsRow
                label="Dia mais rentável"
                value={
                  hasProfitableDay && mostProfitableDay
                    ? `${mostProfitableDay.day} · ${money.formatMoney(mostProfitableDay.averageRevenue)} no período`
                    : 'Sem receita no período'
                }
              />
              <MetricsRow
                label="Oportunidades"
                sublabel={
                  opportunity ?? 'Todas as categorias estão bem distribuídas'
                }
                value={null}
              />
            </MetricsSection>
          </div>
        </>
      ) : (
        <MetricsState
          view={view}
          onRetry={handleRetry}
          empty={<SalesRevenueMetricsNotFound />}
        />
      )}
    </div>
  );
}
