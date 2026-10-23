'use client';
import type { PeriodFilterValue } from '@/components/features/partner/components/dashboard-module/components/period-filter-with-refresh';
import { PeriodFilterWithRefresh } from '@/components/features/partner/components/dashboard-module/components/period-filter-with-refresh';
import { TrendBadge } from '@/components/features/partner/components/dashboard-module/components/trend-badge';
import { useMetricsQuery } from '@/hooks/use-query/use-metrics-query';
import { usePartnerStore } from '@/store';
import {
  Badge,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Progress,
} from '@repo/ui';
import {
  AlertCircle,
  Clock,
  CreditCard,
  DollarSign,
  Receipt,
  Sparkles,
  Target,
  TrendingUp,
} from 'lucide-react';
import { motion } from 'motion/react';
import { useState } from 'react';
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Line,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { SalesRevenueMetricsNotFound } from './sales-revenue-metrics-not-found';
import { SalesRevenueMetricsSkeleton } from './sales-revenue-metrics.skeleton';

export function SalesRevenueMetricsModule() {
  const [periodFilter, setPeriodFilter] = useState<PeriodFilterValue>('month');
  const [isRefreshing, setIsRefreshing] = useState(false);

  const activeStore = usePartnerStore((state) => state.activeStore);
  const { sales, isPendingSales, isEnabledSales, salesRefetch } =
    useMetricsQuery({
      storeId: activeStore?.id,
      period: periodFilter,
      includeSales: true,
    });

  const getMedalEmoji = (index: number) => {
    if (index === 0) return '🥇';
    if (index === 1) return '🥈';
    if (index === 2) return '🥉';
    return `${index + 1}º`;
  };

  const getComparisonText = () => {
    const textMap = {
      week: 'vs semana passada',
      month: 'vs mês anterior',
      quarter: 'vs trimestre anterior',
    };
    return textMap[periodFilter];
  };

  // Loading state
  if (isPendingSales && isEnabledSales) {
    return <SalesRevenueMetricsSkeleton />;
  }

  // No data state
  if (!sales) {
    return <SalesRevenueMetricsNotFound />;
  }

  const handleRefresh = () => {
    salesRefetch();
    setIsRefreshing(true);
    setTimeout(() => setIsRefreshing(false), 2000);
  };

  const periodLabels = {
    week: 'Semanal',
    month: 'Mensal',
    quarter: 'Trimestral',
  };

  // Stats dinâmicos baseados nos dados reais
  const stats = [
    {
      label: 'Receita',
      value: `R$ ${sales.revenue.value.toLocaleString('pt-BR')}`,
      icon: DollarSign,
      trend: `${sales.revenue.percentageChange > 0 ? '+' : ''}${sales.revenue.percentageChange}%`,
      trendUp: sales.revenue.percentageChange > 0,
      trendNeutral: sales.revenue.percentageChange === 0,
      comparison: getComparisonText(),
      detail: `${sales.revenue.percentageChange > 0 ? '+' : ''}R$ ${sales.revenue.absoluteChange.toLocaleString('pt-BR')}`,
    },
    {
      label: 'Ticket Médio',
      value: `R$ ${sales.averageTicket.value.toLocaleString('pt-BR')}`,
      icon: Receipt,
      trend: `${sales.averageTicket.percentageChange > 0 ? '+' : ''}${sales.averageTicket.percentageChange}%`,
      trendUp: sales.averageTicket.percentageChange > 0,
      trendNeutral: sales.averageTicket.percentageChange === 0,
      comparison: getComparisonText(),
      detail: `${sales.averageTicket.percentageChange > 0 ? '+' : ''}R$ ${sales.averageTicket.absoluteChange.toLocaleString('pt-BR')}`,
    },
    {
      label: 'Taxa de Conversão',
      value: `${sales.conversionRate.value}%`,
      icon: CreditCard,
      trend: `${sales.conversionRate.percentageChange > 0 ? '+' : ''}${sales.conversionRate.percentageChange}%`,
      trendUp: sales.conversionRate.percentageChange > 0,
      trendNeutral: sales.conversionRate.percentageChange === 0,
      comparison: getComparisonText(),
      detail: `${sales.conversionRate.variationInPoints > 0 ? '+' : ''}${sales.conversionRate.variationInPoints} p.p.`,
    },
    {
      label: 'Receita/Hora',
      value: `R$ ${sales.revenuePerHour.value.toLocaleString('pt-BR')}`,
      icon: Clock,
      trend: `${sales.revenuePerHour.percentageChange > 0 ? '+' : ''}${sales.revenuePerHour.percentageChange}%`,
      trendUp: sales.revenuePerHour.percentageChange > 0,
      trendNeutral: sales.revenuePerHour.percentageChange === 0,
      comparison: getComparisonText(),
      detail: 'Produtividade',
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header with Period Filter */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <p className="text-xs text-gray-500 mb-1">Performance de Vendas</p>
          <div className="flex items-baseline gap-2">
            <h2 className="text-gray-900">
              R$ {sales.revenue.value.toLocaleString('pt-BR')}
            </h2>
            <TrendBadge value={sales.revenue.percentageChange} />
          </div>
        </div>

        <PeriodFilterWithRefresh
          value={periodFilter}
          onValueChange={setPeriodFilter}
          onRefresh={handleRefresh}
          isRefreshing={isRefreshing}
        />
      </div>

      {/* Goal Progress Card */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <Card className="shadow-lg bg-gradient-to-br from-gray-900 to-gray-800 text-white border-0">
          <CardContent className="p-4 sm:p-5 md:p-6">
            {sales.goal.target === 0 ? (
              // Empty state - Meta não definida
              <div className="flex flex-col items-center justify-center py-6 text-center">
                <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-xl bg-white/10 flex items-center justify-center mb-3">
                  <Target className="h-6 w-6 sm:h-7 sm:w-7 text-white/60" />
                </div>
                <p className="text-base sm:text-lg text-white mb-1">
                  Meta não definida
                </p>
                <p className="text-xs text-white/60 max-w-sm">
                  Defina uma meta {periodLabels[periodFilter].toLowerCase()}{' '}
                  para acompanhar seu progresso e alcançar seus objetivos
                </p>
              </div>
            ) : (
              // Meta definida - Mostrar progresso
              <>
                <div className="flex items-start justify-between mb-3 sm:mb-4">
                  <div className="flex-1 min-w-0">
                    <p className="text-white/70 text-xs mb-1 sm:mb-1.5">
                      Meta de {periodLabels[periodFilter].toLowerCase()}
                    </p>
                    <div className="flex flex-wrap items-baseline gap-x-2">
                      <p className="text-2xl sm:text-3xl">
                        R$ {sales.goal.current.toLocaleString('pt-BR')}
                      </p>
                      <span className="text-sm text-white/60">
                        / R$ {sales.goal.target.toLocaleString('pt-BR')}
                      </span>
                    </div>
                  </div>
                  <div className="w-9 h-9 sm:w-11 sm:h-11 rounded-lg sm:rounded-xl bg-white/10 flex items-center justify-center flex-shrink-0 ml-2 sm:ml-3">
                    <Target className="h-4 w-4 sm:h-5 sm:w-5 text-white" />
                  </div>
                </div>
                <Progress
                  value={sales.goal.percentage}
                  className="h-2 bg-white/20 mb-2.5 sm:mb-3"
                />
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <p className="text-xs text-white/70">
                    {sales.goal.percentage}% concluído - faltam R${' '}
                    {sales.goal.remaining.toLocaleString('pt-BR')}
                  </p>
                  <Badge className="bg-yellow-500/20 text-yellow-300 border-yellow-500/30 text-xs">
                    <Sparkles className="w-3 h-3 mr-1" />
                    {sales.goal.daysRemaining} dias restantes
                  </Badge>
                </div>
              </>
            )}
          </CardContent>
        </Card>
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
                  <TrendBadge
                    value={Number(stat.trend.replace('%', ''))}
                    variant="outline"
                  />
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

      {/* Insights & Alerts */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.2 }}
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Card className="shadow-sm border-l-4 border-l-green-500 border-y-0 border-r-0">
            <CardContent className="p-4">
              <div className="flex items-start gap-3">
                <div className="w-9 h-9 rounded-lg bg-green-50 flex items-center justify-center shrink-0">
                  <TrendingUp className="h-4 w-4 text-green-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-gray-900 mb-1">
                    Dia mais rentável: {sales.insights.mostProfitableDay.day}
                  </p>
                  <p className="text-xs text-gray-500">
                    R${' '}
                    {sales.insights.mostProfitableDay.averageRevenue.toLocaleString('pt-BR')}{' '}
                    em média
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-sm border-l-4 border-l-yellow-500 border-y-0 border-r-0">
            <CardContent className="p-4">
              <div className="flex items-start gap-3">
                <div className="w-9 h-9 rounded-lg bg-yellow-50 flex items-center justify-center shrink-0">
                  <AlertCircle className="h-4 w-4 text-yellow-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-gray-900 mb-1">Oportunidades</p>
                  {sales.insights.opportunities.length > 0 ? (
                    <p className="text-xs text-gray-500">
                      {sales.insights.opportunities[0]}
                    </p>
                  ) : (
                    <p className="text-xs text-gray-500">
                      Todas as categorias estão bem distribuídas
                    </p>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </motion.div>

      {/* Revenue Chart */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.25 }}
        className="flex gap-4 flex-col md:flex-row"
      >
        <Card className="shadow-sm border-0 flex-1">
          <CardHeader className="pb-3">
            <div className="flex items-start justify-between">
              <div>
                <CardTitle className="text-base text-gray-900">
                  Evolução de Receita
                </CardTitle>
                <p className="text-xs text-gray-500 mt-1">
                  Receita vs meta nos últimos 6 meses
                </p>
              </div>
              <div className="flex items-center gap-2 text-xs">
                <div className="flex items-center gap-1.5">
                  <div className="w-3 h-3 rounded-sm bg-gray-900" />
                  <span className="text-gray-600">Real</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <div className="w-3 h-3 rounded-sm border-2 border-dashed border-gray-400" />
                  <span className="text-gray-600">Meta</span>
                </div>
              </div>
            </div>
          </CardHeader>
          <CardContent className="px-3 sm:px-6">
            <div className="w-full h-[250px] sm:h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart
                  data={sales.revenueEvolution}
                  margin={{ top: 10, right: 5, left: -15, bottom: 0 }}
                >
                  <defs>
                    <linearGradient
                      id="colorRevenueSales"
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
                      <stop offset="95%" stopColor="#000000" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid
                    strokeDasharray="3 3"
                    stroke="#f5f5f5"
                    vertical={false}
                  />
                  <XAxis
                    dataKey="month"
                    stroke="#9ca3af"
                    fontSize={11}
                    tickLine={false}
                    axisLine={false}
                  />
                  <YAxis
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
                      if (name === 'revenue')
                        return [`R$ ${value.toLocaleString('pt-BR')}`, 'Receita'];
                      if (name === 'goal')
                        return [`R$ ${value.toLocaleString('pt-BR')}`, 'Meta'];
                      return [value, 'Agendamentos'];
                    }}
                  />
                  <Area
                    type="monotone"
                    dataKey="revenue"
                    stroke="#000000"
                    strokeWidth={2.5}
                    fillOpacity={1}
                    fill="url(#colorRevenueSales)"
                    name="revenue"
                  />
                  <Line
                    type="monotone"
                    dataKey="goal"
                    stroke="#9ca3af"
                    strokeWidth={2}
                    strokeDasharray="5 5"
                    dot={false}
                    name="goal"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-sm border-0 flex-1">
          <CardHeader className="pb-3">
            <div>
              <CardTitle className="text-base text-gray-900">
                Receita por Dia da Semana
              </CardTitle>
              <p className="text-xs text-gray-500 mt-1">
                Padrão médio de faturamento
              </p>
            </div>
          </CardHeader>
          <CardContent className="px-3 sm:px-6">
            <div className="w-full h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={sales.revenueByDayOfWeek}
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
                    formatter={(value: any) => [
                      `R$ ${value.toLocaleString('pt-BR')}`,
                      'Receita',
                    ]}
                  />
                  <Bar
                    dataKey="averageRevenue"
                    fill="#000000"
                    radius={[6, 6, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Service Categories Performance */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.4 }}
      >
        <Card className="shadow-sm border-0">
          <CardHeader className="pb-3">
            <div>
              <CardTitle className="text-base text-gray-900">
                Receita por Categoria
              </CardTitle>
              <p className="text-xs text-gray-500 mt-1">
                Performance e crescimento por tipo de serviço
              </p>
            </div>
          </CardHeader>
          <CardContent className="px-4 sm:px-6">
            {sales.revenueByCategory.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-[180px] text-center">
                <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mb-4">
                  <Receipt className="h-8 w-8 text-gray-400" />
                </div>
                <p className="text-sm text-gray-500 mb-1">
                  Nenhuma categoria com receita
                </p>
                <p className="text-xs text-gray-400">
                  Os dados aparecerão quando houver vendas
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {sales.revenueByCategory.map((category) => (
                  <div key={category.id} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <p className="text-sm text-gray-900">{category.name}</p>
                      <Badge
                        variant="outline"
                        className={`text-xs ${
                          category.growthPercentage >= 0
                            ? 'text-green-700 border-green-200 bg-green-50'
                            : 'text-red-700 border-red-200 bg-red-50'
                        }`}
                      >
                        {category.growthPercentage >= 0 ? '+' : ''}
                        {category.growthPercentage}%
                      </Badge>
                    </div>
                    <p className="text-lg text-gray-900">
                      R$ {category.revenue.toLocaleString('pt-BR')}
                    </p>
                    <Progress
                      value={
                        (category.revenue /
                          Math.max(
                            ...sales.revenueByCategory.map((c) => c.revenue),
                          )) *
                        100
                      }
                      className="h-1.5"
                    />
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>

      {/* Top Services & Peak Hours */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.45 }}
        >
          <Card className="shadow-sm border-0">
            <CardHeader className="pb-3">
              <div>
                <CardTitle className="text-base text-gray-900">
                  Top Serviços por Receita
                </CardTitle>
                <p className="text-xs text-gray-500 mt-1">
                  Ranking dos serviços mais rentáveis
                </p>
              </div>
            </CardHeader>
            <CardContent className="px-3 sm:px-6">
              {sales.topServices.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-[180px] text-center">
                  <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mb-4">
                    <TrendingUp className="h-8 w-8 text-gray-400" />
                  </div>
                  <p className="text-sm text-gray-500 mb-1">
                    Nenhum serviço vendido
                  </p>
                  <p className="text-xs text-gray-400">
                    Os dados aparecerão quando houver vendas
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {sales.topServices.map((service, index) => (
                    <div key={service.id} className="space-y-2">
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-start gap-2 flex-1 min-w-0">
                          <span className="text-lg shrink-0 mt-0.5">
                            {getMedalEmoji(index)}
                          </span>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm text-gray-900 truncate">
                              {service.name}
                            </p>
                            <p className="text-xs text-gray-500">
                              {service.appointments} agendamentos
                            </p>
                          </div>
                        </div>
                        <div className="text-right shrink-0">
                          <p className="text-sm text-gray-900">
                            R$ {service.revenue.toLocaleString('pt-BR')}
                          </p>
                          <Badge
                            variant="outline"
                            className={`text-xs mt-0.5 ${
                              service.growthPercentage >= 0
                                ? 'text-green-700 border-green-200 bg-green-50'
                                : 'text-red-700 border-red-200 bg-red-50'
                            }`}
                          >
                            {service.growthPercentage >= 0 ? '+' : ''}
                            {service.growthPercentage}%
                          </Badge>
                        </div>
                      </div>
                      <div className="w-full bg-gray-100 rounded-full h-1.5">
                        <div
                          className="bg-gray-900 h-1.5 rounded-full transition-all"
                          style={{
                            width: `${Math.min(service.percentageOfTotal * 5, 100)}%`,
                          }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.5 }}
        >
          <Card className="shadow-sm border-0">
            <CardHeader className="pb-3">
              <div>
                <CardTitle className="text-base text-gray-900">
                  Horários Mais Rentáveis
                </CardTitle>
                <p className="text-xs text-gray-500 mt-1">
                  Receita e ocupação por horário
                </p>
              </div>
            </CardHeader>
            <CardContent className="px-3 sm:px-6">
              {sales.profitableHours.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-[180px] text-center">
                  <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mb-4">
                    <Clock className="h-8 w-8 text-gray-400" />
                  </div>
                  <p className="text-sm text-gray-500 mb-1">
                    Nenhum horário com receita
                  </p>
                  <p className="text-xs text-gray-400">
                    Os dados aparecerão quando houver vendas
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {sales.profitableHours.slice(0, 6).map((hour, index) => (
                    <div key={index} className="space-y-1.5">
                      <div className="flex items-center justify-between text-sm">
                        <div className="flex items-center gap-2">
                          <Clock className="h-3.5 w-3.5 text-gray-400" />
                          <span className="text-gray-900">{hour.hour}</span>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className="text-gray-600 text-xs">
                            R$ {hour.revenue.toLocaleString('pt-BR')}
                          </span>
                          <Badge
                            variant="outline"
                            className={`text-xs ${
                              hour.utilizationRate >= 90
                                ? 'text-green-700 border-green-200 bg-green-50'
                                : hour.utilizationRate >= 70
                                  ? 'text-yellow-700 border-yellow-200 bg-yellow-50'
                                  : 'text-gray-700 border-gray-200 bg-gray-50'
                            }`}
                          >
                            {hour.utilizationRate}%
                          </Badge>
                        </div>
                      </div>
                      <Progress value={hour.utilizationRate} className="h-1" />
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}
