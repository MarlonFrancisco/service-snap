'use client';
import type { PeriodFilterValue } from '@/components/features/partner/components/dashboard-module/components/period-filter-with-refresh';
import { PeriodFilterWithRefresh } from '@/components/features/partner/components/dashboard-module/components/period-filter-with-refresh';
import { TrendBadge } from '@/components/features/partner/components/dashboard-module/components/trend-badge';
import { Card, CardContent, CardHeader, CardTitle } from '@repo/ui';
import {
  Award,
  DollarSign,
  Percent,
  Star,
  Target,
  UserPlus,
  Users,
  XCircle,
  Zap,
} from 'lucide-react';
import { motion } from 'motion/react';
import { useState } from 'react';
import {
  Area,
  AreaChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';

import { useMetricsQuery } from '@/hooks/use-query/use-metrics-query/use-metrics-query.hook';
import { usePartnerStore } from '@/store/partner/partner.store';
import { GeneralMetricsNotFound } from './general-metrics-not-found';
import { GeneralMetricsSkeleton } from './general-metrics.skeleton';

export function GeneralMetricsModule() {
  const [periodFilter, setPeriodFilter] = useState<PeriodFilterValue>('week');
  const [isRefreshing, setIsRefreshing] = useState(false);

  const activeStore = usePartnerStore((state) => state.activeStore);
  const { overview, isPendingOverview, isEnabledOverview, overviewRefetch } =
    useMetricsQuery({
      storeId: activeStore?.id,
      period: periodFilter,
      includeOverview: true,
    });

  // Loading state
  if (isPendingOverview && isEnabledOverview) {
    return <GeneralMetricsSkeleton />;
  }

  // No data state
  if (!overview) {
    return <GeneralMetricsNotFound />;
  }

  // Cores para os serviços
  const serviceColors = ['#000000', '#4b5563', '#6b7280', '#9ca3af', '#d1d5db'];

  const topServices = overview.topServices.map((service, index) => ({
    ...service,
    color: serviceColors[index] || '#d1d5db',
  }));

  const performanceData = overview.appointmentsByDay;
  const hasPerformanceActivity = performanceData.some(
    (day) => (day.appointments ?? 0) > 0 || (day.revenue ?? 0) > 0,
  );

  // Obter texto de comparação baseado no período
  const getComparisonText = () => {
    switch (periodFilter) {
      case 'week':
        return 'vs semana passada';
      case 'month':
        return 'vs mês passado';
      case 'quarter':
        return 'vs trimestre passado';
      default:
        return 'vs período anterior';
    }
  };

  // Obter texto de subtítulo baseado no período
  const getSubtitleText = () => {
    switch (periodFilter) {
      case 'week':
        return 'esta semana';
      case 'month':
        return 'este mês';
      case 'quarter':
        return 'este trimestre';
      default:
        return 'período atual';
    }
  };

  const comparisonText = getComparisonText();
  const subtitleText = getSubtitleText();

  const stats = [
    {
      label: 'Receita',
      value: `R$ ${Math.round(overview.weeklyRevenue.value).toLocaleString()}`,
      subValue: `vs período anterior`,
      icon: DollarSign,
      trend: overview.weeklyRevenue.percentageChange,
      trendUp: overview.weeklyRevenue.percentageChange > 0,
      trendNeutral: overview.weeklyRevenue.percentageChange === 0,
      comparison: `${overview.weeklyRevenue.absoluteChange >= 0 ? '+' : ''}R$ ${Math.abs(overview.weeklyRevenue.absoluteChange).toLocaleString()}`,
    },
    {
      label: 'Taxa de Ocupação',
      value: `${overview.occupationRate.value}%`,
      subValue: 'dos horários preenchidos',
      icon: Percent,
      trend: overview.occupationRate.percentageChange,
      trendUp: overview.occupationRate.percentageChange > 0,
      trendNeutral: overview.occupationRate.percentageChange === 0,
      comparison: comparisonText,
    },
    {
      label: 'Ticket Médio',
      value: `R$ ${overview.averageTicket.value}`,
      subValue: 'por agendamento',
      icon: Target,
      trend: overview.averageTicket.absoluteChange,
      trendUp: overview.averageTicket.absoluteChange > 0,
      trendNeutral: overview.averageTicket.absoluteChange === 0,
      comparison: comparisonText,
    },
    {
      label: 'Avaliação Média',
      value: overview.averageRating.value.toFixed(1),
      subValue: `${overview.averageRating.reviewCount} avaliações ${subtitleText}`,
      icon: Star,
      trend:
        overview.averageRating.value - overview.averageRating.previousValue,
      trendUp:
        overview.averageRating.value > overview.averageRating.previousValue,
      trendNeutral:
        overview.averageRating.value === overview.averageRating.previousValue,
      comparison: comparisonText,
    },
  ];

  const handleRefresh = () => {
    overviewRefetch();
    setIsRefreshing(true);
    setTimeout(() => setIsRefreshing(false), 2000);
  };

  return (
    <div className="space-y-6">
      {/* Header with Filters and Actions */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-end gap-4">
        <PeriodFilterWithRefresh
          value={periodFilter}
          onValueChange={setPeriodFilter}
          onRefresh={handleRefresh}
          isRefreshing={isRefreshing}
        />
      </div>

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
                  <TrendBadge value={stat.trend} variant="outline" />
                </div>
                <div>
                  <p className="text-xs text-gray-500 mb-1.5">{stat.label}</p>
                  <p className="text-xl sm:text-2xl text-gray-900 mb-1">
                    {stat.value}
                  </p>
                  <p className="text-xs text-gray-400">{stat.comparison}</p>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Performance Chart - Takes 2 columns */}
        <motion.div
          className="lg:col-span-2"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.2 }}
        >
          <Card className="shadow-sm border-0">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-base text-gray-900">
                    Agendamentos & Receita
                  </CardTitle>
                  <p className="text-xs text-gray-500 mt-1">{subtitleText}</p>
                </div>
              </div>
            </CardHeader>
            <CardContent className="px-3 sm:px-6">
              {!hasPerformanceActivity ? (
                <div className="flex flex-col items-center justify-center h-[250px] sm:h-[300px] text-center">
                  <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mb-4">
                    <Target className="h-8 w-8 text-gray-400" />
                  </div>
                  <p className="text-sm text-gray-500 mb-1">
                    Nenhum agendamento registrado
                  </p>
                  <p className="text-xs text-gray-400">
                    Os dados aparecerão quando houver agendamentos
                  </p>
                </div>
              ) : (
                <div className="w-full h-[250px] sm:h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart
                      data={performanceData}
                      margin={{ top: 10, right: 8, left: 0, bottom: 0 }}
                    >
                      <defs>
                        <linearGradient
                          id="colorRevenue"
                          x1="0"
                          y1="0"
                          x2="0"
                          y2="1"
                        >
                          <stop
                            offset="5%"
                            stopColor="#000000"
                            stopOpacity={0.12}
                          />
                          <stop
                            offset="95%"
                            stopColor="#000000"
                            stopOpacity={0}
                          />
                        </linearGradient>
                        <linearGradient
                          id="colorAppointments"
                          x1="0"
                          y1="0"
                          x2="0"
                          y2="1"
                        >
                          <stop
                            offset="5%"
                            stopColor="#6b7280"
                            stopOpacity={0.12}
                          />
                          <stop
                            offset="95%"
                            stopColor="#6b7280"
                            stopOpacity={0}
                          />
                        </linearGradient>
                      </defs>
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
                        width={48}
                        tickFormatter={(value) =>
                          Number(value).toLocaleString('pt-BR')
                        }
                      />
                      <YAxis
                        yAxisId="right"
                        orientation="right"
                        stroke="#9ca3af"
                        fontSize={10}
                        tickLine={false}
                        axisLine={false}
                        width={56}
                        tickFormatter={(value) =>
                          Number(value).toLocaleString('pt-BR')
                        }
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
                      />
                      <Area
                        yAxisId="right"
                        type="monotone"
                        dataKey="revenue"
                        stroke="#000000"
                        strokeWidth={2.5}
                        fillOpacity={1}
                        fill="url(#colorRevenue)"
                        name="Receita (R$)"
                      />
                      <Area
                        yAxisId="left"
                        type="monotone"
                        dataKey="appointments"
                        stroke="#6b7280"
                        strokeWidth={2.5}
                        fillOpacity={1}
                        fill="url(#colorAppointments)"
                        name="Agendamentos"
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>

        {/* Top Services Pie Chart */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.25 }}
        >
          <Card className="shadow-sm border-0 h-full">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-base text-gray-900">
                    Top Serviços
                  </CardTitle>
                  <p className="text-xs text-gray-500 mt-1">{subtitleText}</p>
                </div>
                <div className="w-9 h-9 rounded-lg bg-gray-100 flex items-center justify-center">
                  <Award className="h-4 w-4 text-gray-600" />
                </div>
              </div>
            </CardHeader>
            <CardContent className="px-3 sm:px-6">
              {topServices.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-[250px] text-center">
                  <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mb-4">
                    <Award className="h-8 w-8 text-gray-400" />
                  </div>
                  <p className="text-sm text-gray-500 mb-1">
                    Nenhum serviço agendado
                  </p>
                  <p className="text-xs text-gray-400">
                    Os dados aparecerão quando houver agendamentos
                  </p>
                </div>
              ) : (
                <>
                  <ResponsiveContainer width="100%" height={250}>
                    <PieChart>
                      <Pie
                        data={topServices}
                        cx="50%"
                        cy="50%"
                        innerRadius={45}
                        outerRadius={75}
                        paddingAngle={2}
                        dataKey="bookings"
                      >
                        {topServices.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip
                        contentStyle={{
                          backgroundColor: 'white',
                          border: '1px solid #e5e7eb',
                          borderRadius: '10px',
                          padding: '10px 14px',
                          fontSize: '13px',
                          boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
                        }}
                      />
                    </PieChart>
                  </ResponsiveContainer>

                  {/* Legend */}
                  <div className="mt-4 space-y-2">
                    {topServices.slice(0, 3).map((service, index) => (
                      <div
                        key={index}
                        className="flex items-center justify-between text-xs"
                      >
                        <div className="flex items-center gap-2">
                          <div
                            className="w-3 h-3 rounded-full"
                            style={{ backgroundColor: service.color }}
                          />
                          <span className="text-gray-700">{service.name}</span>
                        </div>
                        <span className="text-gray-900 font-medium">
                          {service.bookings}
                        </span>
                      </div>
                    ))}
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Additional Metrics Row */}
      <div className="grid grid-cols-1 xs:grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Card className="shadow-sm hover:shadow-md transition-all border-0 active:scale-[0.98]">
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-3">
                <div className="w-10 h-10 rounded-xl bg-gray-100 flex items-center justify-center">
                  <UserPlus className="h-5 w-5 text-gray-700" />
                </div>
              </div>
              <p className="text-xl sm:text-2xl text-gray-900 mb-1">
                {overview.newCustomers}
              </p>
              <p className="text-xs text-gray-500">Novos Clientes</p>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35 }}
        >
          <Card className="shadow-sm hover:shadow-md transition-all border-0 active:scale-[0.98]">
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-3">
                <div className="w-10 h-10 rounded-xl bg-gray-100 flex items-center justify-center">
                  <Users className="h-5 w-5 text-gray-700" />
                </div>
              </div>
              <p className="text-xl sm:text-2xl text-gray-900 mb-1">
                {overview.recurringCustomers}
              </p>
              <p className="text-xs text-gray-500">Clientes Recorrentes</p>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <Card className="shadow-sm hover:shadow-md transition-all border-0 active:scale-[0.98]">
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-3">
                <div className="w-10 h-10 rounded-xl bg-gray-100 flex items-center justify-center">
                  <XCircle className="h-5 w-5 text-gray-700" />
                </div>
              </div>
              <p className="text-xl sm:text-2xl text-gray-900 mb-1">
                {overview.cancellationRate.value}%
              </p>
              <p className="text-xs text-gray-500">Taxa de Cancelamento</p>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.45 }}
        >
          <Card className="shadow-sm hover:shadow-md transition-all border-0 active:scale-[0.98]">
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-3">
                <div className="w-10 h-10 rounded-xl bg-gray-100 flex items-center justify-center">
                  <Zap className="h-5 w-5 text-gray-700" />
                </div>
              </div>
              <p className="text-xl sm:text-2xl text-gray-900 mb-1">
                {overview.conversionRate.value}%
              </p>
              <p className="text-xs text-gray-500">Taxa de Conversão</p>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}
