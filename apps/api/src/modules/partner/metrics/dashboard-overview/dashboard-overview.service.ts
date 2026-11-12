import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import {
  PeriodType,
  getDaysInRange,
  getPeriodDateRange,
  resolveStoreToday,
  getPreviousPeriodStart,
} from '../../../../utils/helpers/metrics.helpers';
import { Schedule } from '../../stores/schedule/schedule.entity';
import { DashboardOverviewQueries } from './dashboard-overview-queries';
import {
  AppointmentsByDayResult,
  AverageRatingResult,
  CustomerCountsResult,
  PeriodSummaryResult,
  TopServicesResult,
} from './dashboard-overview.types';
import { DashboardOverviewDto } from './dto/dashboard-overview.dto';

@Injectable()
export class DashboardOverviewService {
  constructor(
    @InjectRepository(Schedule)
    private scheduleRepository: Repository<Schedule>,
  ) {}

  /**
   * Dashboard 1: Visão Geral
   * Calcula todas as métricas para o dashboard de visão geral usando SQL otimizado
   * @param storeId - ID da loja
   * @param period - Período para análise: 'week' (esta semana), 'month' (este mês), 'quarter' (este trimestre)
   */
  async getDashboardOverview(
    storeId: string,
    period: PeriodType = 'week',
  ): Promise<DashboardOverviewDto> {
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

    // Cinco queries em paralelo: cabem no pool (max 5) sem enfileirar
    const [
      summaryResult,
      customerCountsResult,
      averageRatingResult,
      appointmentsByDayResults,
      topServicesResults,
    ] = await Promise.all([
      this.scheduleRepository.query(
        DashboardOverviewQueries.calculatePeriodSummary,
        bothPeriods,
      ),
      this.scheduleRepository.query(
        DashboardOverviewQueries.countCustomers,
        currentOnly,
      ),
      this.scheduleRepository.query(
        DashboardOverviewQueries.calculateAverageRating,
        [storeId, currentPeriod.start, previousPeriod.start],
      ),
      this.scheduleRepository.query(
        DashboardOverviewQueries.calculateAppointmentsByDay,
        currentOnly,
      ),
      this.scheduleRepository.query(
        DashboardOverviewQueries.calculateTopServices,
        currentOnly,
      ),
    ]);

    // Formatar resultados (com casting de tipo)
    const summary = summaryResult[0] as PeriodSummaryResult;
    const customerCounts = customerCountsResult[0] as
      | CustomerCountsResult
      | undefined;

    const weeklyRevenue = this.formatRevenueResult(summary);
    const occupationRate = this.formatOccupationRateResult(
      summary,
      getDaysInRange(currentPeriod),
      getDaysInRange(previousPeriod),
    );
    const averageTicket = this.formatAverageTicketResult(summary);
    const averageRating = this.formatAverageRatingResult(
      averageRatingResult[0] as AverageRatingResult,
    );
    const newCustomers = customerCounts?.new_customers_count || 0;
    const recurringCustomers = customerCounts?.recurring_count || 0;
    const cancellationRate = this.formatCancellationRateResult(summary);
    const conversionRate = this.formatConversionRateResult(summary);

    const appointmentsByDay = this.formatAppointmentsByDayResults(
      appointmentsByDayResults as AppointmentsByDayResult[],
    );
    const topServices = topServicesResults.map(
      (service: TopServicesResult) => ({
        id: service.service_id,
        name: service.service_name,
        bookings: Number(service.bookings_count),
        revenue: Math.round(Number(service.total_revenue)),
      }),
    );

    return {
      weeklyRevenue,
      occupationRate,
      averageTicket,
      averageRating,
      newCustomers,
      recurringCustomers,
      cancellationRate,
      conversionRate,
      appointmentsByDay,
      topServices,
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
   * Formata resultado SQL de taxa de ocupação
   */
  private formatOccupationRateResult(
    result: PeriodSummaryResult,
    currentDays: number,
    prevDays: number,
  ) {
    const slotsPerDay = 10;

    const currentOccupied = Number(result.current_occupied) || 0;
    const prevOccupied = Number(result.prev_occupied) || 0;

    // Cada período usa a própria duração: fevereiro não tem os dias de março
    const currentRate = (currentOccupied / (slotsPerDay * currentDays)) * 100;
    const prevRate = (prevOccupied / (slotsPerDay * prevDays)) * 100;
    const percentageChange = (currentRate - prevRate).toFixed(1);

    return {
      value: parseFloat(currentRate.toFixed(1)),
      previousValue: parseFloat(prevRate.toFixed(1)),
      percentageChange: parseFloat(percentageChange),
    };
  }

  /**
   * Formata resultado SQL de ticket médio
   */
  private formatAverageTicketResult(result: PeriodSummaryResult) {
    const currentTicket = Number(result.current_avg_ticket) || 0;
    const prevTicket = Number(result.prev_avg_ticket) || 0;
    const absoluteChange = currentTicket - prevTicket;

    return {
      value: Math.round(currentTicket),
      previousValue: Math.round(prevTicket),
      absoluteChange: Math.round(absoluteChange),
    };
  }

  /**
   * Formata resultado SQL de classificação média
   */
  private formatAverageRatingResult(result: AverageRatingResult) {
    const avgRating = Number(result.avg_rating) || 0;
    const reviewCount = Number(result.review_count) || 0;
    const prevAvg = Number(result.prev_avg_rating) || 0;

    return {
      value: avgRating,
      previousValue: prevAvg,
      reviewCount: reviewCount,
    };
  }

  /**
   * Formata resultado SQL de taxa de cancelamento
   */
  private formatCancellationRateResult(result: PeriodSummaryResult) {
    const totalSchedules = Number(result.total_schedules) || 0;
    const cancelled = Number(result.cancelled_count) || 0;

    const rate = totalSchedules > 0 ? (cancelled / totalSchedules) * 100 : 0;

    return {
      value: parseFloat(rate.toFixed(1)),
    };
  }

  /**
   * Formata resultado SQL de taxa de conversão
   */
  private formatConversionRateResult(result: PeriodSummaryResult) {
    const completed = Number(result.completed_count) || 0;
    const total = Number(result.total_schedules) || 0;

    const rate = total > 0 ? (completed / total) * 100 : 0;

    return {
      value: Math.round(rate),
    };
  }

  /**
   * Formata resultados SQL de agendamentos por dia
   */
  private formatAppointmentsByDayResults(
    results: AppointmentsByDayResult[],
  ): Array<{
    day: 'Seg' | 'Ter' | 'Qua' | 'Qui' | 'Sex' | 'Sáb' | 'Dom';
    appointments: number;
    revenue: number;
    completed: number;
    cancelled: number;
  }> {
    const days = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'] as const;

    return results.map((result) => ({
      day: days[Number(result.day_of_week) || 0],
      appointments: Number(result.total_appointments) || 0,
      revenue: Math.round(Number(result.total_revenue) || 0),
      completed: Number(result.completed_count) || 0,
      cancelled: Number(result.cancelled_count) || 0,
    }));
  }
}
