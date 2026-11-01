'use client';

import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import {
  MetricCard,
  MetricsChartTable,
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
  METRICS_CHART_LABEL_CLASS,
  METRICS_KPI_GRID_CLASS,
  METRICS_PAGE_CLASS,
  METRICS_TOOLTIP_STYLE,
} from '../dashboard-module.styles';
import { formatCount } from '../utils/metrics.helpers';
import { GeneralMetricsNotFound } from './general-metrics-not-found';
import { useGeneralMetrics } from './general-metrics.hook';

const CHART_SYNC_ID = 'general-metrics-by-day';

export function GeneralMetricsModule() {
  const {
    view,
    isRefreshing,
    hasRefreshError,
    handleRefresh,
    handleRetry,
    period,
    setPeriod,
    money,
    currentPeriodText,
    primaryStats,
    secondaryStats,
    appointmentsByDay,
    hasAppointments,
    topServices,
    hasOverview,
  } = useGeneralMetrics();

  const bookedValueLabel = `Valor agendado (${money.currencySymbol})`;

  return (
    <div className={METRICS_PAGE_CLASS}>
      {view !== 'no-store' && (
        <div className="flex justify-end">
          <PeriodFilterWithRefresh
            value={period}
            onValueChange={setPeriod}
            onRefresh={handleRefresh}
            isRefreshing={isRefreshing}
          />
        </div>
      )}

      {hasRefreshError && <MetricsRefreshAlert />}

      {view === 'ready' && hasOverview ? (
        <>
          <div className={METRICS_KPI_GRID_CLASS}>
            {primaryStats.map((stat) => (
              <MetricCard key={stat.label} {...stat} />
            ))}
          </div>

          <div className="grid grid-cols-1 gap-3.5 lg:grid-cols-3">
            <MetricsSection
              title="Agendamentos e receita"
              subtitle={`${currentPeriodText} · por dia da semana`}
              headingAs="h2"
              className="lg:col-span-2"
            >
              {hasAppointments ? (
                <>
                  <MetricsChartTable
                    caption="Agendamentos e valor agendado por dia da semana"
                    headers={['Dia', 'Agendamentos', bookedValueLabel]}
                    rows={appointmentsByDay.map((day) => [
                      day.day,
                      day.appointments,
                      money.formatMoney(day.bookedValue),
                    ])}
                  />
                  <div aria-hidden="true" className="grid gap-3">
                    <div>
                      <p className={METRICS_CHART_LABEL_CLASS}>
                        {bookedValueLabel}
                      </p>
                      <div className="mt-1 h-[150px] md:h-[170px]">
                        <ResponsiveContainer width="100%" height="100%">
                          <AreaChart
                            data={appointmentsByDay}
                            syncId={CHART_SYNC_ID}
                            margin={{ top: 8, right: 8, left: 0, bottom: 0 }}
                          >
                            <CartesianGrid
                              stroke={METRICS_CHART_COLORS.grid}
                              vertical={false}
                            />
                            <XAxis dataKey="day" hide />
                            <YAxis
                              {...METRICS_AXIS_PROPS}
                              width={64}
                              tickFormatter={money.formatCompactMoney}
                            />
                            <Tooltip
                              contentStyle={METRICS_TOOLTIP_STYLE}
                              formatter={(value) => [
                                money.formatMoney(value),
                                'Valor agendado',
                              ]}
                            />
                            <Area
                              type="monotone"
                              dataKey="bookedValue"
                              stroke={METRICS_CHART_COLORS.ink}
                              strokeWidth={2}
                              fill={METRICS_CHART_COLORS.area}
                              fillOpacity={1}
                            />
                          </AreaChart>
                        </ResponsiveContainer>
                      </div>
                    </div>
                    <div>
                      <p className={METRICS_CHART_LABEL_CLASS}>Agendamentos</p>
                      <div className="mt-1 h-[110px]">
                        <ResponsiveContainer width="100%" height="100%">
                          <BarChart
                            data={appointmentsByDay}
                            syncId={CHART_SYNC_ID}
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
                              allowDecimals={false}
                            />
                            <Tooltip
                              contentStyle={METRICS_TOOLTIP_STYLE}
                              cursor={{ fill: METRICS_CHART_COLORS.area }}
                              formatter={(value) => [
                                formatCount(value),
                                'Agendamentos',
                              ]}
                            />
                            <Bar
                              dataKey="appointments"
                              fill={METRICS_CHART_COLORS.ink}
                              radius={[4, 4, 0, 0]}
                              maxBarSize={40}
                            />
                          </BarChart>
                        </ResponsiveContainer>
                      </div>
                    </div>
                  </div>
                </>
              ) : (
                <MetricsSectionEmpty message="Nenhum agendamento registrado neste período." />
              )}
            </MetricsSection>

            <MetricsSection
              title="Top serviços"
              subtitle={currentPeriodText}
              headingAs="h2"
            >
              {topServices.length > 0 ? (
                <>
                  <div aria-hidden="true" className="hidden h-[190px] md:block">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={topServices}
                          dataKey="bookings"
                          nameKey="name"
                          innerRadius={58}
                          outerRadius={84}
                          paddingAngle={2}
                          stroke="#FFFFFF"
                        >
                          {topServices.map((service) => (
                            <Cell key={service.id} fill={service.color} />
                          ))}
                        </Pie>
                        <Tooltip
                          contentStyle={METRICS_TOOLTIP_STYLE}
                          formatter={(value, name) => [
                            formatCount(value),
                            name,
                          ]}
                        />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                  <div className="mt-1.5">
                    {topServices.map((service) => (
                      <MetricsRow
                        key={service.id}
                        label={
                          <span className="flex items-center gap-2">
                            <span
                              aria-hidden="true"
                              className="hidden size-2.5 shrink-0 rounded-full md:block"
                              style={{ backgroundColor: service.color }}
                            />
                            {service.name}
                          </span>
                        }
                        value={formatCount(service.bookings)}
                      />
                    ))}
                  </div>
                </>
              ) : (
                <MetricsSectionEmpty message="Nenhum serviço agendado neste período." />
              )}
            </MetricsSection>
          </div>

          <div className={METRICS_KPI_GRID_CLASS}>
            {secondaryStats.map((stat) => (
              <MetricCard key={stat.label} {...stat} />
            ))}
          </div>
        </>
      ) : (
        <MetricsState
          view={view}
          onRetry={handleRetry}
          titleAs="h2"
          empty={<GeneralMetricsNotFound />}
        />
      )}
    </div>
  );
}
