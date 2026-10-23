'use client';
import type { PeriodFilterValue } from '@/components/features/partner/components/dashboard-module/components/period-filter-with-refresh';
import { PeriodFilterWithRefresh } from '@/components/features/partner/components/dashboard-module/components/period-filter-with-refresh';
import { useMetricsQuery } from '@/hooks/use-query/use-metrics-query';
import { usePartnerStore } from '@/store/partner/partner.store';
import {
  Badge,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Progress,
} from '@repo/ui';
import {
  Activity,
  AlertTriangle,
  Award,
  CheckCircle,
  Clock,
  Sparkles,
  Timer,
  UserCheck,
  Zap,
} from 'lucide-react';
import { motion } from 'motion/react';
import { useState } from 'react';
import {
  Bar,
  CartesianGrid,
  Cell,
  ComposedChart,
  Line,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { TrendBadge } from '../components/trend-badge';
import { OperationalMetricsNotFound } from './operational-metrics-not-found';
import { OperationalMetricsSkeleton } from './operational-metrics.skeleton';

export function OperationalMetricsModule() {
  const [selectedView, setSelectedView] = useState<
    'overview' | 'heatmap' | 'efficiency'
  >('overview');
  const [periodFilter, setPeriodFilter] = useState<PeriodFilterValue>('month');
  const [isRefreshing, setIsRefreshing] = useState(false);

  const activeStore = usePartnerStore((state) => state.activeStore);
  const {
    operational,
    isPendingOperational,
    isEnabledOperational,
    operationalRefetch,
  } = useMetricsQuery({
    storeId: activeStore?.id,
    period: periodFilter,
    includeOperational: true,
  });

  // Loading state
  if (isPendingOperational && isEnabledOperational) {
    return <OperationalMetricsSkeleton />;
  }

  // No data state
  if (!operational) {
    return <OperationalMetricsNotFound />;
  }

  const handleRefresh = () => {
    operationalRefetch();
    setIsRefreshing(true);
    setTimeout(() => setIsRefreshing(false), 2000);
  };

  // Preparar dados para visualizações
  const utilizationData = operational.dailyCapacityUtilization.map((item) => ({
    day: item.day,
    capacity: item.totalCapacity,
    used: item.usedCapacity,
    idle: item.emptyCapacity,
    revenue: item.revenue,
  }));

  const totalUsed = utilizationData.reduce((sum, day) => sum + day.used, 0);
  const avgUtilization = (totalUsed / (utilizationData.length * 100)) * 100;

  const totalIdle = utilizationData.reduce((sum, day) => sum + day.idle, 0);
  const idlePercentage = (totalIdle / (utilizationData.length * 100)) * 100;

  // Status data com mapeamento
  const statusData = operational.appointmentStatus.map((item) => ({
    name:
      item.status === 'completed'
        ? 'Concluídos'
        : item.status === 'scheduled'
          ? 'Agendados'
          : item.status === 'no-show'
            ? 'Não Compareceu'
            : 'Cancelados',
    value: item.quantity,
    color:
      item.status === 'completed'
        ? '#10b981'
        : item.status === 'scheduled'
          ? '#000000'
          : item.status === 'no-show'
            ? '#f59e0b'
            : '#ef4444',
    percentage: item.percentage,
  }));

  const stats = [
    {
      label: 'Taxa de Ocupação',
      value: `${operational.occupancyRate.value}%`,
      icon: Activity,
      trend: `${operational.occupancyRate.percentageChange > 0 ? '+' : ''}${operational.occupancyRate.percentageChange}%`,
      trendUp: operational.occupancyRate.percentageChange > 0,
      trendNeutral: operational.occupancyRate.percentageChange === 0,
      comparison: 'vs período anterior',
      detail: `Anterior: ${operational.occupancyRate.previousValue}%`,
    },
    {
      label: 'Tempo Médio',
      value: `${operational.averageTime.value}min`,
      icon: Clock,
      trend: `${operational.averageTime.percentageChange > 0 ? '+' : ''}${operational.averageTime.percentageChange}%`,
      trendUp: operational.averageTime.percentageChange > 0,
      trendNeutral: operational.averageTime.percentageChange === 0,
      comparison: 'vs período anterior',
      detail: `Anterior: ${operational.averageTime.previousValue}min`,
    },
    {
      label: 'Eficiência da Equipe',
      value: `${operational.teamEfficiency.value}%`,
      icon: Zap,
      trend: `${operational.teamEfficiency.percentageChange > 0 ? '+' : ''}${operational.teamEfficiency.percentageChange}%`,
      trendUp: operational.teamEfficiency.percentageChange > 0,
      trendNeutral: operational.teamEfficiency.percentageChange === 0,
      comparison: 'vs período anterior',
      detail: `Anterior: ${operational.teamEfficiency.previousValue}%`,
    },
    {
      label: 'Taxa de Pontualidade',
      value: `${operational.punctualityRate.value}%`,
      icon: UserCheck,
      trend: `${operational.punctualityRate.percentageChange > 0 ? '+' : ''}${operational.punctualityRate.percentageChange}%`,
      trendUp: operational.punctualityRate.percentageChange > 0,
      trendNeutral: operational.punctualityRate.percentageChange === 0,
      comparison: 'vs período anterior',
      detail: `No-show: ${operational.punctualityRate.noShowRate}%`,
    },
  ];

  // Peak hours from period distribution
  const peakHours = operational.periodDistribution.map((item) => ({
    period: item.label,
    bookings: item.appointmentCount,
    percentage: item.percentage,
    trend: `${item.trend > 0 ? '+' : ''}${item.trend}%`,
    trendUp: item.trend > 0,
    trendNeutral: item.trend === 0,
  }));

  // Heatmap data com remapeamento
  const heatmapData = operational.occupancyHeatMap.hours.map((hour, idx) => {
    const dayData: Record<string, string | number> = { hour };
    const shortDays = ['dom', 'seg', 'ter', 'qua', 'qui', 'sex', 'sab'];
    operational.occupancyHeatMap.data.forEach((dayRow, dayIdx) => {
      dayData[shortDays[dayIdx] as keyof typeof dayData] =
        dayRow.values[idx] || 0;
    });
    return dayData;
  });
  const heatmapHasActivity = heatmapData.some((row) =>
    ['dom', 'seg', 'ter', 'qua', 'qui', 'sex', 'sab'].some(
      (day) => Number(row[day] ?? 0) > 0,
    ),
  );

  // Service duration
  const serviceDurationAvg = operational.serviceDuration.map((item) => ({
    service: item.name,
    avgTime: item.averageRealTime,
    planned: item.plannedTime,
    variance: item.variation,
  }));

  // Idle time opportunities
  const idleTimeOpportunities = operational.idleTimeOpportunities.map(
    (item) => ({
      day: item.dayAndPeriod,
      idleSlots: item.emptyHours,
      potentialRevenue: item.potentialRevenue,
    }),
  );

  // Professionals - map API data to component data
  const professionals = operational.professionalPerformance.map((prof) => ({
    name: prof.name,
    bookings: prof.appointmentCount,
    rating: prof.averageRating,
    revenue: prof.revenue,
    efficiency: prof.efficiency,
    onTime: prof.punctualityRate,
    avgDuration: prof.averageAttendanceTime,
    utilizationRate: prof.utilizationRate,
  }));

  const getMedalEmoji = (index: number) => {
    if (index === 0) return '🥇';
    if (index === 1) return '🥈';
    if (index === 2) return '🥉';
    return `${index + 1}º`;
  };

  const getOccupancyColor = (value: number) => {
    if (value >= 90) return '#111827'; // gray-900 (quase preto)
    if (value >= 70) return '#374151'; // gray-700
    if (value >= 50) return '#6b7280'; // gray-500
    if (value >= 30) return '#9ca3af'; // gray-400
    if (value >= 10) return '#d1d5db'; // gray-300
    return '#f3f4f6'; // gray-100 (bem claro)
  };

  const getTextColor = (value: number) => {
    // Texto branco para fundos escuros (50% ou mais)
    // Texto escuro para fundos claros (menos de 50%)
    return value >= 50 ? '#ffffff' : '#1f2937';
  };

  return (
    <div className="space-y-6">
      {/* Header with View Toggle */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <p className="text-xs text-gray-500 mb-1">Eficiência Operacional</p>
          <div className="flex items-baseline gap-2">
            <h2 className="text-gray-900">
              {avgUtilization?.toFixed(1)}% Ocupação
            </h2>
            <TrendBadge value={operational.occupancyRate.percentageChange} />
          </div>
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <PeriodFilterWithRefresh
            value={periodFilter}
            onValueChange={setPeriodFilter}
            onRefresh={handleRefresh}
            isRefreshing={isRefreshing}
          />

          <div className="flex items-center gap-1 bg-gray-100 rounded-lg p-1 flex-1 sm:flex-initial">
            {(['overview', 'heatmap', 'efficiency'] as const).map((view) => (
              <button
                key={view}
                onClick={() => setSelectedView(view)}
                className={`px-3 py-2 text-xs rounded-md transition-all touch-manipulation min-h-[36px] flex-1 sm:flex-initial ${
                  selectedView === view
                    ? 'bg-white text-gray-900 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900 active:bg-gray-200'
                }`}
              >
                {view === 'overview' && 'Visão Geral'}
                {view === 'heatmap' && 'Mapa de Calor'}
                {view === 'efficiency' && 'Eficiência'}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Operational Health Alerts */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Highest Occupancy Day */}
          <Card className="shadow-sm border-l-4 border-l-green-500 border-y-0 border-r-0">
            <CardContent className="p-4">
              <div className="flex items-start gap-3">
                <div className="w-9 h-9 rounded-lg bg-green-50 flex items-center justify-center shrink-0">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-gray-900 mb-1">
                    {(() => {
                      const maxDay = utilizationData.reduce((prev, current) =>
                        prev.used > current.used ? prev : current,
                      );
                      return `${maxDay.day} com ${maxDay.used}% de ocupação`;
                    })()}
                  </p>
                  <p className="text-xs text-gray-500">
                    Considere aumentar equipe ou ampliar horários.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Idle Opportunities */}
          <Card className="shadow-sm border-l-4 border-l-yellow-500 border-y-0 border-r-0">
            <CardContent className="p-4">
              <div className="flex items-start gap-3">
                <div className="w-9 h-9 rounded-lg bg-yellow-50 flex items-center justify-center shrink-0">
                  <AlertTriangle className="h-4 w-4 text-yellow-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-gray-900 mb-1">
                    Potencial de R${' '}
                    {idleTimeOpportunities
                      .reduce((sum, opp) => sum + opp.potentialRevenue, 0)
                      .toLocaleString('pt-BR')}{' '}
                    em horários ociosos
                  </p>
                  <p className="text-xs text-gray-500">
                    {idleTimeOpportunities.length} períodos com baixa ocupação
                    identificados.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </motion.div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, index) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: index * 0.05 }}
          >
            <Card className="shadow-sm hover:shadow-md transition-all group border-0 active:scale-[0.98]">
              <CardContent className="p-4 sm:p-5">
                <div className="flex items-start justify-between mb-3 sm:mb-4">
                  <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl bg-gray-100 flex items-center justify-center group-hover:bg-gray-900 transition-colors">
                    <stat.icon className="h-5 w-5 text-gray-600 group-hover:text-white transition-colors" />
                  </div>
                  <TrendBadge value={Number(stat.trend.replace('%', ''))} />
                </div>
                <div>
                  <p className="text-xs text-gray-500 mb-1.5">{stat.label}</p>
                  <p className="text-xl sm:text-2xl text-gray-900 mb-0.5">
                    {stat.value}
                  </p>
                  <p className="text-xs text-gray-400">{stat.detail}</p>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Conditional Content based on selected view */}
      {selectedView === 'overview' && (
        <>
          {/* Utilization Chart with Idle Time */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.2 }}
          >
            <Card className="shadow-sm border-0">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-base text-gray-900">
                      Utilização de Capacidade
                    </CardTitle>
                    <p className="text-xs text-gray-500 mt-1">
                      Capacidade utilizada vs ociosa por dia
                    </p>
                  </div>
                  <Badge variant="outline" className="text-xs">
                    {idlePercentage?.toFixed(1)}% ocioso
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="px-3 sm:px-6">
                <div className="w-full h-[250px] sm:h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <ComposedChart
                      data={utilizationData}
                      margin={{ top: 10, right: 5, left: -15, bottom: 0 }}
                    >
                      <CartesianGrid
                        strokeDasharray="3 3"
                        stroke="#f5f5f5"
                        vertical={false}
                      />
                      <XAxis
                        dataKey="day"
                        stroke="#9ca3af"
                        fontSize={11}
                        tickLine={false}
                        axisLine={false}
                      />
                      <YAxis
                        yAxisId="left"
                        stroke="#9ca3af"
                        fontSize={10}
                        tickLine={false}
                        axisLine={false}
                        width={40}
                      />
                      <YAxis
                        yAxisId="right"
                        orientation="right"
                        stroke="#9ca3af"
                        fontSize={10}
                        tickLine={false}
                        axisLine={false}
                        width={50}
                        tickFormatter={(value) => `R$ ${value / 1000}k`}
                      />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: 'white',
                          border: '1px solid #e5e7eb',
                          borderRadius: '10px',
                          padding: '8px 12px',
                          fontSize: '12px',
                          boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
                        }}
                        formatter={(value: any, name: string) => {
                          if (name === 'used')
                            return [`${value}%`, 'Utilizado'];
                          if (name === 'idle') return [`${value}%`, 'Ocioso'];
                          if (name === 'revenue')
                            return [`R$ ${value.toLocaleString('pt-BR')}`, 'Receita'];
                          return [value, name];
                        }}
                      />
                      <Bar
                        yAxisId="left"
                        dataKey="used"
                        stackId="a"
                        fill="#000000"
                        radius={[0, 0, 0, 0]}
                      />
                      <Bar
                        yAxisId="left"
                        dataKey="idle"
                        stackId="a"
                        fill="#e5e7eb"
                        radius={[4, 4, 0, 0]}
                      />
                      <Line
                        yAxisId="right"
                        type="monotone"
                        dataKey="revenue"
                        stroke="#6b7280"
                        strokeWidth={2.5}
                        dot={{ fill: '#6b7280', r: 4 }}
                      />
                    </ComposedChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Status & Performance */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.25 }}
            >
              <Card className="shadow-sm border-0">
                <CardHeader className="pb-3">
                  <div>
                    <CardTitle className="text-base text-gray-900">
                      Status dos Agendamentos
                    </CardTitle>
                    <p className="text-xs text-gray-500 mt-1">
                      Distribuição atual de{' '}
                      {statusData.reduce((sum, s) => sum + s.value, 0)}{' '}
                      agendamentos
                    </p>
                  </div>
                </CardHeader>
                <CardContent className="px-3 sm:px-6">
                  {statusData.reduce((sum, s) => sum + s.value, 0) === 0 ? (
                    <div className="flex flex-col items-center justify-center h-[180px] text-center">
                      <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mb-4">
                        <Activity className="h-8 w-8 text-gray-400" />
                      </div>
                      <p className="text-sm text-gray-500 mb-1">
                        Nenhum agendamento registrado
                      </p>
                      <p className="text-xs text-gray-400">
                        Os dados aparecerão quando houver agendamentos
                      </p>
                    </div>
                  ) : (
                    <>
                      <div className="w-full h-[180px]">
                        <ResponsiveContainer width="100%" height="100%">
                          <PieChart>
                            <Pie
                              data={statusData}
                              cx="50%"
                              cy="50%"
                              innerRadius={45}
                              outerRadius={70}
                              paddingAngle={2}
                              dataKey="value"
                            >
                              {statusData.map((entry, index) => (
                                <Cell
                                  key={`cell-${index}`}
                                  fill={entry.color}
                                />
                              ))}
                            </Pie>
                            <Tooltip
                              contentStyle={{
                                backgroundColor: 'white',
                                border: '1px solid #e5e7eb',
                                borderRadius: '10px',
                                padding: '8px 12px',
                                fontSize: '12px',
                                boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
                              }}
                            />
                          </PieChart>
                        </ResponsiveContainer>
                      </div>
                      <div className="grid grid-cols-2 gap-3 mt-4">
                        {statusData.map((item, index) => (
                          <div
                            key={index}
                            className="flex items-center justify-between gap-2"
                          >
                            <div className="flex items-center gap-2 flex-1 min-w-0">
                              <div
                                className="w-3 h-3 rounded-full shrink-0"
                                style={{ backgroundColor: item.color }}
                              />
                              <p className="text-xs text-gray-700 truncate">
                                {item.name}
                              </p>
                            </div>
                            <div className="text-right">
                              <p className="text-xs text-gray-900 font-medium">
                                {item.value}
                              </p>
                              <p className="text-xs text-gray-400">
                                {item.percentage}%
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </>
                  )}
                </CardContent>
              </Card>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.3 }}
            >
              <Card className="shadow-sm border-0">
                <CardHeader className="pb-3">
                  <div>
                    <CardTitle className="text-base text-gray-900">
                      Duração Média por Serviço
                    </CardTitle>
                    <p className="text-xs text-gray-500 mt-1">
                      Tempo real vs planejado
                    </p>
                  </div>
                </CardHeader>
                <CardContent className="px-3 sm:px-6">
                  {serviceDurationAvg.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-[180px] text-center">
                      <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mb-4">
                        <Timer className="h-8 w-8 text-gray-400" />
                      </div>
                      <p className="text-sm text-gray-500 mb-1">
                        Nenhum serviço registrado
                      </p>
                      <p className="text-xs text-gray-400">
                        Os dados aparecerão quando houver serviços realizados
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {serviceDurationAvg.map((service, index) => (
                        <div key={index} className="space-y-2">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <Timer className="h-3.5 w-3.5 text-gray-400" />
                              <span className="text-sm text-gray-900">
                                {service.service}
                              </span>
                            </div>
                            <div className="flex items-center gap-2">
                              <span className="text-sm text-gray-600">
                                {service.avgTime}min
                              </span>
                              <Badge
                                variant="outline"
                                className={`text-xs ${
                                  service.variance <= 3
                                    ? 'text-green-700 border-green-200 bg-green-50'
                                    : 'text-yellow-700 border-yellow-200 bg-yellow-50'
                                }`}
                              >
                                {service.variance > 0 ? '+' : ''}
                                {service.variance}min
                              </Badge>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <Progress
                              value={(service.avgTime / service.planned) * 100}
                              className="h-1.5 flex-1"
                            />
                            <span className="text-xs text-gray-400">
                              {service.planned}min
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          </div>

          {/* Peak Hours */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.35 }}
          >
            <Card className="shadow-sm border-0">
              <CardHeader className="pb-3">
                <div>
                  <CardTitle className="text-base text-gray-900">
                    Distribuição por Período
                  </CardTitle>
                  <p className="text-xs text-gray-500 mt-1">
                    Concentração de agendamentos ao longo do dia
                  </p>
                </div>
              </CardHeader>
              <CardContent className="px-3 sm:px-6">
                {peakHours.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-[180px] text-center">
                    <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mb-4">
                      <Clock className="h-8 w-8 text-gray-400" />
                    </div>
                    <p className="text-sm text-gray-500 mb-1">
                      Nenhum agendamento por período
                    </p>
                    <p className="text-xs text-gray-400">
                      Os dados aparecerão quando houver agendamentos
                    </p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {peakHours.map((slot, index) => (
                      <div
                        key={index}
                        className="p-4 bg-gray-50 rounded-xl border border-gray-100"
                      >
                        <p className="text-sm text-gray-900 mb-3">
                          {slot.period}
                        </p>
                        <div className="flex items-end justify-between mb-2">
                          <h4 className="text-2xl text-gray-900">
                            {slot.bookings}
                          </h4>
                          <TrendBadge
                            value={Number(slot.trend.replace('%', ''))}
                          />
                        </div>
                        <Progress
                          value={slot.percentage}
                          className="h-2 mb-2"
                        />
                        <p className="text-xs text-gray-500">
                          {slot.percentage}% do total
                        </p>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>
        </>
      )}

      {selectedView === 'heatmap' && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <Card className="shadow-sm border-0">
            <CardHeader className="pb-3">
              <div>
                <CardTitle className="text-base text-gray-900">
                  Mapa de Calor - Ocupação por Horário
                </CardTitle>
                <p className="text-xs text-gray-500 mt-1">
                  Visualize os horários de pico e oportunidades de otimização
                </p>
              </div>
            </CardHeader>
            <CardContent className="px-3 sm:px-6">
              {!heatmapHasActivity ? (
                <div className="flex flex-col items-center justify-center py-16 text-center">
                  <p className="text-sm text-gray-500 mb-1">
                    Sem ocupação no período
                  </p>
                  <p className="text-xs text-gray-400">
                    O mapa de calor aparece quando houver agendamentos
                  </p>
                </div>
              ) : null}
              {/* Legend */}
              <div
                className={`flex flex-wrap items-center justify-end gap-3 mb-4 text-xs ${
                  !heatmapHasActivity ? 'hidden' : ''
                }`}
              >
                <span className="text-gray-500 font-medium">
                  Taxa de ocupação:
                </span>
                <div className="flex items-center gap-2">
                  <div
                    className="w-4 h-4 rounded"
                    style={{ backgroundColor: '#f3f4f6' }}
                  />
                  <span className="text-gray-600">0-10%</span>
                </div>
                <div className="flex items-center gap-2">
                  <div
                    className="w-4 h-4 rounded"
                    style={{ backgroundColor: '#d1d5db' }}
                  />
                  <span className="text-gray-600">10-30%</span>
                </div>
                <div className="flex items-center gap-2">
                  <div
                    className="w-4 h-4 rounded"
                    style={{ backgroundColor: '#9ca3af' }}
                  />
                  <span className="text-gray-600">30-50%</span>
                </div>
                <div className="flex items-center gap-2">
                  <div
                    className="w-4 h-4 rounded"
                    style={{ backgroundColor: '#6b7280' }}
                  />
                  <span className="text-gray-600">50-70%</span>
                </div>
                <div className="flex items-center gap-2">
                  <div
                    className="w-4 h-4 rounded"
                    style={{ backgroundColor: '#374151' }}
                  />
                  <span className="text-gray-600">70-90%</span>
                </div>
                <div className="flex items-center gap-2">
                  <div
                    className="w-4 h-4 rounded"
                    style={{ backgroundColor: '#111827' }}
                  />
                  <span className="text-gray-600">90-100%</span>
                </div>
              </div>

              {/* Heatmap Grid */}
              {heatmapHasActivity ? (
                <div className="overflow-x-auto -mx-3 sm:mx-0">
                  <div className="min-w-[600px] sm:min-w-0">
                    <div className="grid grid-cols-8 gap-2 mb-2">
                      <div className="text-xs text-gray-500 font-medium"></div>
                      <div className="text-xs text-gray-700 font-medium text-center">
                        Seg
                      </div>
                      <div className="text-xs text-gray-700 font-medium text-center">
                        Ter
                      </div>
                      <div className="text-xs text-gray-700 font-medium text-center">
                        Qua
                      </div>
                      <div className="text-xs text-gray-700 font-medium text-center">
                        Qui
                      </div>
                      <div className="text-xs text-gray-700 font-medium text-center">
                        Sex
                      </div>
                      <div className="text-xs text-gray-700 font-medium text-center">
                        Sáb
                      </div>
                      <div className="text-xs text-gray-700 font-medium text-center">
                        Dom
                      </div>
                    </div>

                    {heatmapData.map((row, index) => (
                      <div key={index} className="grid grid-cols-8 gap-2 mb-2">
                        <div className="text-xs text-gray-600 font-medium flex items-center">
                          {row.hour}
                        </div>
                        {['seg', 'ter', 'qua', 'qui', 'sex', 'sab', 'dom'].map(
                          (day) => {
                            const value = (row[day] as number) || 0;
                            return (
                              <div
                                key={day}
                                className="aspect-square rounded-lg flex items-center justify-center text-xs font-medium transition-all hover:scale-105"
                                style={{
                                  backgroundColor: getOccupancyColor(value),
                                  color: getTextColor(value),
                                }}
                              >
                                {value}%
                              </div>
                            );
                          },
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              ) : null}

              {/* Idle Time Opportunities */}
              <div className="mt-6 p-5 bg-gray-50 rounded-xl border border-gray-200">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-start gap-3">
                    <div className="w-9 h-9 rounded-lg bg-gray-900 flex items-center justify-center shrink-0">
                      <Sparkles className="h-4 w-4 text-white" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900 mb-1">
                        Oportunidades de Otimização
                      </p>
                      <p className="text-xs text-gray-500">
                        Horários com baixa ocupação que podem gerar receita
                        adicional
                      </p>
                    </div>
                  </div>
                  <Badge variant="outline" className="text-xs shrink-0">
                    {idleTimeOpportunities.length} período
                    {idleTimeOpportunities.length !== 1 ? 's' : ''}
                  </Badge>
                </div>
                <div className="space-y-2">
                  {idleTimeOpportunities.map((opp, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between p-3 bg-white rounded-lg border-2 border-gray-100 hover:border-gray-200 transition-colors"
                    >
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-gray-900 font-medium mb-0.5">
                          {opp.day}
                        </p>
                        <p className="text-xs text-gray-500">
                          {opp.idleSlots} horário
                          {opp.idleSlots !== 1 ? 's' : ''} vazio
                          {opp.idleSlots !== 1 ? 's' : ''}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-medium text-gray-900">
                          +R$ {opp.potentialRevenue.toLocaleString('pt-BR')}
                        </p>
                        <p className="text-xs text-gray-400">potencial</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {selectedView === 'efficiency' && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <Card className="shadow-sm border-0">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-base text-gray-900">
                    Performance Detalhada por Profissional
                  </CardTitle>
                  <p className="text-xs text-gray-500 mt-1">
                    Métricas de eficiência, pontualidade e utilização
                  </p>
                </div>
                <div className="w-9 h-9 rounded-lg bg-gray-100 flex items-center justify-center">
                  <Award className="h-4 w-4 text-gray-600" />
                </div>
              </div>
            </CardHeader>
            <CardContent className="px-3 sm:px-6">
              {professionals.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-[250px] text-center">
                  <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mb-4">
                    <Award className="h-8 w-8 text-gray-400" />
                  </div>
                  <p className="text-sm text-gray-500 mb-1">
                    Nenhum profissional cadastrado
                  </p>
                  <p className="text-xs text-gray-400">
                    Adicione profissionais para visualizar métricas de
                    performance
                  </p>
                </div>
              ) : (
                <div className="space-y-5">
                  {professionals.map((prof, index) => (
                    <div
                      key={index}
                      className="p-4 bg-gray-50 rounded-xl border border-gray-100"
                    >
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-start gap-3">
                          <div className="relative">
                            <div className="w-10 h-10 rounded-full bg-gray-900 flex items-center justify-center text-white text-sm">
                              {prof.name
                                .split(' ')
                                .map((n) => n[0])
                                .join('')}
                            </div>
                            {index < 3 && (
                              <div className="absolute -top-1 -right-1 text-base">
                                {getMedalEmoji(index)}
                              </div>
                            )}
                          </div>
                          <div>
                            <p className="text-sm text-gray-900 font-medium">
                              {prof.name}
                            </p>
                            <p className="text-xs text-gray-500">
                              {prof.bookings} agendamentos
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-sm text-gray-900 font-medium">
                            R$ {prof.revenue.toLocaleString('pt-BR')}
                          </p>
                          <p className="text-xs text-gray-500">
                            R$ {Math.round(prof.revenue / prof.bookings)}/agend.
                          </p>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                        <div>
                          <p className="text-xs text-gray-500 mb-1">
                            Eficiência
                          </p>
                          <div className="flex items-center gap-2">
                            <Progress
                              value={prof.efficiency}
                              className="h-1.5 flex-1"
                            />
                            <span className="text-xs text-gray-900 font-medium">
                              {prof.efficiency}%
                            </span>
                          </div>
                        </div>
                        <div>
                          <p className="text-xs text-gray-500 mb-1">
                            Pontualidade
                          </p>
                          <div className="flex items-center gap-2">
                            <Progress
                              value={prof.onTime}
                              className="h-1.5 flex-1"
                            />
                            <span className="text-xs text-gray-900 font-medium">
                              {prof.onTime}%
                            </span>
                          </div>
                        </div>
                        <div>
                          <p className="text-xs text-gray-500 mb-1">
                            Utilização
                          </p>
                          <div className="flex items-center gap-2">
                            <Progress
                              value={prof.utilizationRate}
                              className="h-1.5 flex-1"
                            />
                            <span className="text-xs text-gray-900 font-medium">
                              {prof.utilizationRate}%
                            </span>
                          </div>
                        </div>
                        <div>
                          <p className="text-xs text-gray-500 mb-1">
                            Tempo Médio
                          </p>
                          <div className="flex items-center gap-2">
                            <Clock className="h-3 w-3 text-gray-400" />
                            <span className="text-xs text-gray-900 font-medium">
                              {prof.avgDuration}min
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>
      )}
    </div>
  );
}
