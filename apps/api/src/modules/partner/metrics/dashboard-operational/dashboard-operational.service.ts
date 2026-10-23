import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import {
  PeriodType,
  getPeriodDateRange,
  getPreviousPeriodStart,
} from '../../../../utils/helpers/metrics.helpers';
import { Schedule } from '../../stores/schedule/schedule.entity';
import { Store } from '../../stores/store.entity';
import { DashboardOperationalQueries } from './dashboard-operational-queries';
import {
  AppointmentStatusResult,
  AverageTimeResult,
  DailyCapacityUtilizationResult,
  IdleTimeOpportunitiesResult,
  OccupancyHeatMapResult,
  OccupancyRateResult,
  PeriodDistributionResult,
  ProfessionalPerformanceResult,
  PunctualityRateResult,
  ServiceDurationResult,
  TeamEfficiencyResult,
} from './dashboard-operational.types';
import { DashboardOperationalDto } from './dto';

@Injectable()
export class DashboardOperationalService {
  constructor(
    @InjectRepository(Store)
    private storeRepository: Repository<Store>,
    @InjectRepository(Schedule)
    private scheduleRepository: Repository<Schedule>,
  ) {}

  /**
   * Dashboard 3: Operacional
   * Calcula todas as métricas operacionais usando SQL otimizado
   * @param storeId - ID da loja
   * @param period - Período para análise: 'week' (esta semana), 'month' (este mês), 'quarter' (este trimestre)
   */
  async getOperationalMetrics(
    storeId: string,
    period: PeriodType = 'month',
  ): Promise<DashboardOperationalDto> {
    const store = await this.storeRepository.findOne({
      where: { id: storeId },
    });

    if (!store) {
      throw new Error('Store not found');
    }

    // Calcular períodos com base no tipo selecionado
    const now = new Date();
    const currentPeriod = getPeriodDateRange(now, period);
    const previousPeriod = getPeriodDateRange(
      getPreviousPeriodStart(now, period),
      period,
    );

    // Executar todas as queries SQL em paralelo
    const [
      occupancyRateResult,
      averageTimeResult,
      teamEfficiencyResult,
      punctualityRateResult,
      dailyCapacityUtilizationResults,
      appointmentStatusResult,
      serviceDurationResults,
      periodDistributionResults,
      occupancyHeatMapResults,
      idleTimeOpportunitiesResults,
      professionalPerformanceResults,
    ] = await Promise.all([
      this.scheduleRepository.query(
        DashboardOperationalQueries.calculateOccupancyRate,
        [
          storeId,
          currentPeriod.start,
          currentPeriod.end,
          previousPeriod.start,
          previousPeriod.end,
        ],
      ),
      this.scheduleRepository.query(
        DashboardOperationalQueries.calculateAverageTime,
        [
          storeId,
          currentPeriod.start,
          currentPeriod.end,
          previousPeriod.start,
          previousPeriod.end,
        ],
      ),
      this.scheduleRepository.query(
        DashboardOperationalQueries.calculateTeamEfficiency,
        [
          storeId,
          currentPeriod.start,
          currentPeriod.end,
          previousPeriod.start,
          previousPeriod.end,
        ],
      ),
      this.scheduleRepository.query(
        DashboardOperationalQueries.calculatePunctualityRate,
        [
          storeId,
          currentPeriod.start,
          currentPeriod.end,
          previousPeriod.start,
          previousPeriod.end,
        ],
      ),
      this.scheduleRepository.query(
        DashboardOperationalQueries.calculateDailyCapacityUtilization,
        [storeId, currentPeriod.start, currentPeriod.end],
      ),
      this.scheduleRepository.query(
        DashboardOperationalQueries.calculateAppointmentStatus,
        [storeId, currentPeriod.start, currentPeriod.end],
      ),
      this.scheduleRepository.query(
        DashboardOperationalQueries.calculateServiceDuration,
        [storeId, currentPeriod.start, currentPeriod.end],
      ),
      this.scheduleRepository.query(
        DashboardOperationalQueries.calculatePeriodDistribution,
        [
          storeId,
          currentPeriod.start,
          currentPeriod.end,
          previousPeriod.start,
          previousPeriod.end,
        ],
      ),
      this.scheduleRepository.query(
        DashboardOperationalQueries.calculateOccupancyHeatMap,
        [storeId, currentPeriod.start, currentPeriod.end],
      ),
      this.scheduleRepository.query(
        DashboardOperationalQueries.calculateIdleTimeOpportunities,
        [storeId, currentPeriod.start, currentPeriod.end],
      ),
      this.scheduleRepository.query(
        DashboardOperationalQueries.calculateProfessionalPerformance,
        [storeId, currentPeriod.start, currentPeriod.end],
      ),
    ]);

    // Formatar resultados
    const occupancyRate = this.formatOccupancyRate(
      occupancyRateResult[0] as OccupancyRateResult,
    );
    const averageTime = this.formatAverageTime(
      averageTimeResult[0] as AverageTimeResult,
    );
    const teamEfficiency = this.formatTeamEfficiency(
      teamEfficiencyResult[0] as TeamEfficiencyResult,
    );
    const punctualityRate = this.formatPunctualityRate(
      punctualityRateResult[0] as PunctualityRateResult,
    );
    const dailyCapacityUtilization = this.formatDailyCapacityUtilization(
      dailyCapacityUtilizationResults as DailyCapacityUtilizationResult[],
      store,
    );
    const appointmentStatus = this.formatAppointmentStatus(
      appointmentStatusResult[0] as AppointmentStatusResult,
    );
    const serviceDuration = this.formatServiceDuration(
      serviceDurationResults as ServiceDurationResult[],
    );
    const periodDistribution = this.formatPeriodDistribution(
      periodDistributionResults as PeriodDistributionResult[],
    );
    const occupancyHeatMap = this.formatOccupancyHeatMap(
      occupancyHeatMapResults as OccupancyHeatMapResult[],
    );
    const idleTimeOpportunities = this.formatIdleTimeOpportunities(
      idleTimeOpportunitiesResults as IdleTimeOpportunitiesResult[],
    );
    const professionalPerformance = this.formatProfessionalPerformance(
      professionalPerformanceResults as ProfessionalPerformanceResult[],
    );

    return {
      occupancyRate,
      averageTime,
      teamEfficiency,
      punctualityRate,
      dailyCapacityUtilization,
      appointmentStatus,
      serviceDuration,
      periodDistribution,
      occupancyHeatMap,
      idleTimeOpportunities,
      professionalPerformance,
    };
  }

  private formatOccupancyRate(result: OccupancyRateResult) {
    const currentValue = Number(result.current_occupancy) || 0;
    const previousValue = Number(result.prev_occupancy) || 0;
    const percentageChange =
      previousValue > 0
        ? parseFloat(
            (((currentValue - previousValue) * 100) / previousValue).toFixed(1),
          )
        : 0;

    return {
      value: currentValue,
      previousValue,
      percentageChange,
    };
  }

  private formatAverageTime(result: AverageTimeResult) {
    const currentValue = Number(result.current_avg_duration) || 0;
    const previousValue = Number(result.prev_avg_duration) || 0;
    const percentageChange =
      previousValue > 0
        ? parseFloat(
            (((currentValue - previousValue) * 100) / previousValue).toFixed(1),
          )
        : 0;

    return {
      value: currentValue,
      previousValue,
      percentageChange,
    };
  }

  private formatTeamEfficiency(result: TeamEfficiencyResult) {
    const currentValue = Number(result.current_efficiency) || 0;
    const previousValue = Number(result.prev_efficiency) || 0;
    const percentageChange =
      previousValue > 0
        ? parseFloat(
            (((currentValue - previousValue) * 100) / previousValue).toFixed(1),
          )
        : 0;

    return {
      value: currentValue,
      previousValue,
      percentageChange,
    };
  }

  private formatPunctualityRate(result: PunctualityRateResult) {
    const currentValue = Number(result.current_punctuality) || 0;
    const previousValue = Number(result.prev_punctuality) || 0;
    const percentageChange =
      previousValue > 0
        ? parseFloat(
            (((currentValue - previousValue) * 100) / previousValue).toFixed(1),
          )
        : 0;
    const noShowRate = Number(result.current_no_show_rate) || 0;

    return {
      value: currentValue,
      previousValue,
      percentageChange,
      noShowRate,
    };
  }

  private formatDailyCapacityUtilization(
    results: DailyCapacityUtilizationResult[],
    store: Store,
  ) {
    const days = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'] as const;

    return results.map((result) => ({
      day: days[Number(result.day_of_week) || 0],
      totalCapacity: Number(result.appointments) || 0,
      usedCapacity: Number(result.appointments) || 0,
      emptyCapacity: 0,
      utilizationPercentage: Number(result.utilization_percentage) || 0,
      isOpen: this.isDayOpen(Number(result.day_of_week) || 0, store),
      revenue: 0,
    }));
  }

  private formatAppointmentStatus(result: AppointmentStatusResult) {
    const total = Number(result.total) || 1;
    return [
      {
        status: 'completed' as const,
        quantity: Number(result.completed) || 0,
        percentage: Math.round(((Number(result.completed) || 0) / total) * 100),
      },
      {
        status: 'scheduled' as const,
        quantity: Number(result.scheduled) || 0,
        percentage: Math.round(((Number(result.scheduled) || 0) / total) * 100),
      },
      {
        status: 'no-show' as const,
        quantity: Number(result.no_show) || 0,
        percentage: Math.round(((Number(result.no_show) || 0) / total) * 100),
      },
      {
        status: 'cancelled' as const,
        quantity: Number(result.cancelled) || 0,
        percentage: Math.round(((Number(result.cancelled) || 0) / total) * 100),
      },
    ];
  }

  private formatServiceDuration(results: ServiceDurationResult[]) {
    return results.map((result) => ({
      id: result.service_id,
      name: result.service_name,
      averageRealTime: Number(result.avg_duration) || 0,
      plannedTime: Number(result.avg_duration) || 0,
      variation: 0,
    }));
  }

  private formatPeriodDistribution(results: PeriodDistributionResult[]) {
    const labels: Record<string, string> = {
      morning: 'Manhã (6h-12h)',
      afternoon: 'Tarde (12h-18h)',
      night: 'Noite (18h-20h)',
    };
    const total =
      results.reduce((sum, r) => sum + r.current_appointments, 0) || 1;

    return results.map((result) => {
      const currentAppts = Number(result.current_appointments) || 0;
      const prevAppts = Number(result.prev_appointments) || 0;
      const trend =
        prevAppts > 0
          ? parseFloat(
              (((currentAppts - prevAppts) * 100) / prevAppts).toFixed(1),
            )
          : 0;

      return {
        period: (result.period_part || 'morning') as
          | 'morning'
          | 'afternoon'
          | 'night',
        label: labels[result.period_part] || 'Período',
        appointmentCount: currentAppts,
        percentage: Math.round((currentAppts / total) * 100),
        trend,
      };
    });
  }

  private formatOccupancyHeatMap(results: OccupancyHeatMapResult[]) {
    const days = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'] as const;
    const hoursSet = new Set<number>();
    const dataMap = new Map<number, Map<number, number>>();

    // Agrupar dados por dia e hora
    results.forEach((result) => {
      hoursSet.add(result.hour);
      const hour = result.hour;
      const dayOfWeek = Number(result.day_of_week) || 0;

      if (!dataMap.has(dayOfWeek)) {
        dataMap.set(dayOfWeek, new Map());
      }
      dataMap.get(dayOfWeek)!.set(hour, Number(result.appointments) || 0);
    });

    const hours = Array.from(hoursSet).sort((a, b) => a - b);

    return {
      hours: hours.map((h) => `${h}h`),
      data: Array.from({ length: 7 }, (_, day) => ({
        day: days[day],
        values: hours.map((h) => {
          const appts = dataMap.get(day)?.get(h) || 0;
          return appts;
        }),
      })),
    };
  }

  private formatIdleTimeOpportunities(results: IdleTimeOpportunitiesResult[]) {
    return results.slice(0, 5).map((result) => ({
      dayAndPeriod: `${result.hour}h - ${result.hour + 1}h`,
      emptyHours: 1,
      potentialRevenue: 0,
    }));
  }

  private formatProfessionalPerformance(
    results: ProfessionalPerformanceResult[],
  ) {
    return results.map((result) => ({
      id: result.professional_id,
      name: result.professional_name,
      appointmentCount: Number(result.total_appointments) || 0,
      averageRating: 0,
      revenue: Number(result.total_revenue) || 0,
      efficiency: 100,
      punctualityRate: Math.round(
        ((Number(result.completed_appointments) || 0) /
          Math.max(Number(result.total_appointments) || 1, 1)) *
          100,
      ),
      averageAttendanceTime: Number(result.avg_service_duration) || 0,
      utilizationRate: Math.round(
        ((Number(result.total_appointments) || 0) * 100) / 30,
      ),
    }));
  }

  private isDayOpen(dayOfWeek: number, store: Store): boolean {
    if (!store.businessDays) return true;
    const dayNames = [
      'sunday',
      'monday',
      'tuesday',
      'wednesday',
      'thursday',
      'friday',
      'saturday',
    ];
    return (
      store.businessDays[
        dayNames[dayOfWeek] as keyof typeof store.businessDays
      ] ?? true
    );
  }
}
