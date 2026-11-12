import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import {
  PeriodType,
  getPeriodDateRange,
  isStoreDayOpen,
  resolveStoreToday,
  getPreviousPeriodStart,
} from '../../../../utils/helpers/metrics.helpers';
import { Schedule } from '../../stores/schedule/schedule.entity';
import { DashboardSalesQueries } from './dashboard-sales-queries';
import {
  PeriodSummaryResult,
  ProfitableHoursResult,
  RevenueByCategoryResult,
  RevenueByDayOfWeekResult,
  RevenueEvolutionResult,
  TopServicesResult,
} from './dashboard-sales.types';
import { DashboardSalesDto } from './dto/dashboard-sales.dto';

@Injectable()
export class DashboardSalesService {
  constructor(
    @InjectRepository(Schedule)
    private scheduleRepository: Repository<Schedule>,
  ) {}

  /**
   * Dashboard 2: Vendas & Receita
   * Calcula todas as métricas de vendas e receita usando SQL otimizado
   * @param storeId - ID da loja
   * @param period - Período para análise: 'week' (esta semana), 'month' (este mês), 'quarter' (este trimestre)
   */
  async getDashboardSales(
    storeId: string,
    period: PeriodType = 'month',
  ): Promise<DashboardSalesDto> {
    // Calcular períodos com base no tipo selecionado
    // Períodos no dia da loja, não no dia UTC do servidor
    const now = await resolveStoreToday(
      this.scheduleRepository.manager,
      storeId,
    );
    const currentPeriod = getPeriodDateRange(now, period);
    const previousPeriod = getPeriodDateRange(
      getPreviousPeriodStart(now, period),
      period,
    );

    const bothPeriods = [
      storeId,
      currentPeriod.start,
      currentPeriod.end,
      previousPeriod.start,
      previousPeriod.end,
    ];
    const currentOnly = [storeId, currentPeriod.start, currentPeriod.end];

    // Executar todas as queries SQL em paralelo
    const [
      summaryResult,
      revenueEvolutionResults,
      revenueByDayOfWeekResults,
      revenueByCategoryResults,
      topServicesResults,
      profitableHoursResults,
    ] = await Promise.all([
      this.scheduleRepository.query(
        DashboardSalesQueries.calculatePeriodSummary,
        [...bothPeriods, period, now],
      ),
      this.scheduleRepository.query(
        DashboardSalesQueries.calculateRevenueEvolution,
        [storeId, now],
      ),
      this.scheduleRepository.query(
        DashboardSalesQueries.calculateRevenueByDayOfWeek,
        currentOnly,
      ),
      this.scheduleRepository.query(
        DashboardSalesQueries.calculateRevenueByCategory,
        bothPeriods,
      ),
      this.scheduleRepository.query(
        DashboardSalesQueries.calculateTopServices,
        bothPeriods,
      ),
      this.scheduleRepository.query(
        DashboardSalesQueries.calculateProfitableHours,
        currentOnly,
      ),
    ]);

    // Formatar resultados (com casting de tipo)
    const summary = summaryResult[0] as PeriodSummaryResult;
    const revenue = this.formatRevenueResult(summary);
    const averageTicket = this.formatAverageTicketResult(summary);
    const conversionRate = this.formatConversionRateResult(summary);
    const revenuePerHour = this.formatRevenuePerHourResult(summary);
    const goal = this.formatGoalProgressResult(summary);
    const revenueEvolution = this.formatRevenueEvolutionResults(
      revenueEvolutionResults as RevenueEvolutionResult[],
    );
    const revenueByDayOfWeek = this.formatRevenueByDayOfWeekResults(
      revenueByDayOfWeekResults as RevenueByDayOfWeekResult[],
    );
    const revenueByCategory = revenueByCategoryResults.map(
      (cat: RevenueByCategoryResult) => ({
        id: cat.id,
        name: cat.name,
        revenue: cat.revenue,
        growthPercentage: cat.growth_percentage,
      }),
    );
    const topServices = topServicesResults.map(
      (service: TopServicesResult) => ({
        id: service.id,
        name: service.name,
        revenue: service.revenue,
        appointments: Number(service.appointments),
        percentageOfTotal: service.percentage_of_total,
        growthPercentage: service.growth_percentage,
      }),
    );
    const profitableHours = profitableHoursResults.map(
      (hour: ProfitableHoursResult) => ({
        hour: `${hour.hour}h`,
        revenue: Number(hour.revenue),
        utilizationRate: Number(hour.utilization_rate),
      }),
    );

    // Insights
    const insights = this.generateInsights(
      revenueByDayOfWeek,
      summary.business_days,
    );

    return {
      revenue,
      averageTicket,
      conversionRate,
      revenuePerHour,
      goal,
      revenueEvolution,
      revenueByDayOfWeek,
      revenueByCategory,
      topServices,
      profitableHours,
      insights,
    };
  }

  /**
   * Formata resultado SQL de receita
   */
  private formatRevenueResult(result: PeriodSummaryResult) {
    const currentRevenue = Number(result.current_revenue) || 0;
    const prevRevenue = Number(result.prev_revenue) || 0;
    const absoluteChange = currentRevenue - prevRevenue;
    const percentageChange =
      prevRevenue > 0
        ? parseFloat(((absoluteChange / prevRevenue) * 100).toFixed(1))
        : 0;

    return {
      value: currentRevenue,
      previousValue: prevRevenue,
      percentageChange,
      absoluteChange,
    };
  }

  /**
   * Formata resultado SQL de ticket médio
   */
  private formatAverageTicketResult(result: PeriodSummaryResult) {
    const currentTicket = Number(result.current_avg_ticket) || 0;
    const prevTicket = Number(result.prev_avg_ticket) || 0;
    const absoluteChange = currentTicket - prevTicket;

    const percentageChange =
      prevTicket > 0
        ? parseFloat(((absoluteChange / prevTicket) * 100).toFixed(1))
        : 0;

    return {
      value: Math.round(currentTicket),
      previousValue: Math.round(prevTicket),
      percentageChange,
      absoluteChange: Math.round(absoluteChange),
    };
  }

  /**
   * Formata resultado SQL de taxa de conversão
   */
  private formatConversionRateResult(result: PeriodSummaryResult) {
    const currentRate = Number(result.current_rate) || 0;
    const prevRate = Number(result.prev_rate) || 0;
    const variationInPoints = currentRate - prevRate;

    const percentageChange =
      prevRate > 0
        ? parseFloat(((variationInPoints / prevRate) * 100).toFixed(1))
        : 0;

    return {
      value: currentRate,
      previousValue: prevRate,
      percentageChange,
      variationInPoints,
    };
  }

  /**
   * Formata resultado SQL de receita por hora
   */
  private formatRevenuePerHourResult(result: PeriodSummaryResult) {
    const currentRevenuePerHour = Number(result.current_revenue_per_hour) || 0;
    const prevRevenuePerHour = Number(result.prev_revenue_per_hour) || 0;
    const absoluteChange = currentRevenuePerHour - prevRevenuePerHour;

    const percentageChange =
      prevRevenuePerHour > 0
        ? parseFloat(((absoluteChange / prevRevenuePerHour) * 100).toFixed(1))
        : 0;

    return {
      value: Math.round(currentRevenuePerHour),
      previousValue: Math.round(prevRevenuePerHour),
      percentageChange,
    };
  }

  /**
   * Formata resultado SQL de progresso de meta
   */
  private formatGoalProgressResult(result: PeriodSummaryResult) {
    const currentRevenue = Number(result.current_revenue) || 0;
    const targetGoal = Number(result.target_goal) || 0;
    const daysRemaining = Number(result.days_remaining) || 0;

    const remaining = Math.max(targetGoal - currentRevenue, 0);
    const percentage =
      targetGoal > 0 ? Math.round((currentRevenue / targetGoal) * 100) : 0;

    return {
      current: Math.round(currentRevenue),
      target: Math.round(targetGoal),
      percentage,
      remaining: Math.round(remaining),
      daysRemaining: Math.max(daysRemaining, 0),
    };
  }

  /**
   * Formata resultados SQL de evolução de receita
   */
  private formatRevenueEvolutionResults(
    results: RevenueEvolutionResult[],
  ): Array<{
    month: string;
    revenue: number;
    goal: number;
    appointments: number;
  }> {
    const monthNames = [
      'Jan',
      'Fev',
      'Mar',
      'Abr',
      'Mai',
      'Jun',
      'Jul',
      'Ago',
      'Set',
      'Out',
      'Nov',
      'Dez',
    ];

    return results.map((result) => {
      const date = new Date(result.month_date);
      return {
        month: monthNames[date.getMonth()],
        revenue: Math.round(Number(result.revenue) || 0),
        goal: Math.round(Number(result.goal) || 0),
        appointments: Number(result.appointments) || 0,
      };
    });
  }

  /**
   * Formata resultados SQL de receita por dia da semana
   */
  private formatRevenueByDayOfWeekResults(
    results: RevenueByDayOfWeekResult[],
  ): Array<{
    day: 'Seg' | 'Ter' | 'Qua' | 'Qui' | 'Sex' | 'Sáb' | 'Dom';
    averageRevenue: number;
    averageTicket: number;
    appointments: number;
  }> {
    const days = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'] as const;

    return results.map((result) => ({
      day: days[Number(result.day_of_week) || 0],
      averageRevenue: Number(result.total_revenue) || 0,
      averageTicket: Number(result.average_ticket) || 0,
      appointments: Number(result.appointments) || 0,
    }));
  }

  /**
   * Gera insights baseado nos dados
   */
  private generateInsights(
    revenueByDayOfWeek: Array<{
      day: string;
      averageRevenue: number;
      averageTicket: number;
      appointments: number;
    }>,
    businessDays: Record<string, boolean> | null,
  ) {
    // Dia mais rentável: maior ticket médio entre os dias com atendimento
    // concluído. Sem nenhum, cai no primeiro dia da lista.
    const mostProfitableDay = revenueByDayOfWeek.reduce(
      (best, day) =>
        day.appointments > 0 &&
        (best.appointments === 0 || day.averageTicket > best.averageTicket)
          ? day
          : best,
      revenueByDayOfWeek[0],
    );

    // Dia fechado não é oportunidade nem puxa a média para baixo. A lista vem
    // na ordem do DOW (0 = domingo), então o índice é o dia da semana.
    const openDays = revenueByDayOfWeek.filter((_, dayOfWeek) =>
      isStoreDayOpen(dayOfWeek, businessDays),
    );

    const opportunities: string[] = [];
    // Identificar dias com receita baixa
    const avgRevenue =
      openDays.reduce((sum, day) => sum + day.averageRevenue, 0) /
      Math.max(openDays.length, 1);

    for (const day of openDays) {
      if (day.averageRevenue < avgRevenue * 0.7) {
        const percentage = Math.round(
          ((avgRevenue - day.averageRevenue) / avgRevenue) * 100,
        );
        opportunities.push(
          `${day.day} apresenta receita ${percentage}% abaixo da média`,
        );
      }
    }

    return {
      mostProfitableDay: {
        day: mostProfitableDay.day as
          | 'Seg'
          | 'Ter'
          | 'Qua'
          | 'Qui'
          | 'Sex'
          | 'Sáb'
          | 'Dom',
        averageRevenue: Math.round(mostProfitableDay.averageRevenue),
      },
      opportunities,
    };
  }
}
