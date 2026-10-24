import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import {
  getPeriodDateRange,
  getPreviousPeriodStart,
} from '../../../../utils/helpers/metrics.helpers';
import { Schedule } from '../../stores/schedule/schedule.entity';
import { DashboardCustomersQueries } from './dashboard-customers-queries';
import {
  AverageLTVResult,
  CustomerBaseResult,
  CustomerEvolutionResult,
  LTVBySegmentResult,
  NPSScoreResult,
  RetentionRateResult,
  TopVIPCustomerResult,
} from './dashboard-customers.types';
import {
  AverageLTV,
  CustomerBase,
  CustomerEvolution,
  DashboardCustomersDto,
  LTVBySegment,
  NPSScore,
  RetentionRate,
} from './dto/dashboard-customers.dto';

type PeriodType = 'week' | 'month' | 'quarter';

@Injectable()
export class DashboardCustomersService {
  constructor(
    @InjectRepository(Schedule)
    private scheduleRepository: Repository<Schedule>,
  ) {}

  /**
   * Dashboard 4: Métricas de Clientes
   * Calcula todas as métricas relacionadas aos clientes usando SQL otimizado
   * @param storeId - ID da loja
   * @param period - Período para análise: 'week' (esta semana), 'month' (este mês), 'quarter' (trimestre)
   */
  async getDashboardCustomers(
    storeId: string,
    period: PeriodType = 'month',
  ): Promise<DashboardCustomersDto> {
    const now = new Date();
    const currentPeriod = getPeriodDateRange(now, period);
    const previousPeriod = getPeriodDateRange(
      getPreviousPeriodStart(now, period),
      period,
    );
    const beforePreviousPeriod = getPeriodDateRange(
      getPreviousPeriodStart(previousPeriod.start, period),
      period,
    );

    // Executar todas as queries em paralelo
    const [
      customerBaseResult,
      retentionRateResult,
      averageLTVResult,
      npsScoreResult,
      customerEvolutionResults,
      ltvBySegmentResults,
      topVIPCustomersResults,
    ] = await Promise.all([
      this.scheduleRepository.query(
        DashboardCustomersQueries.calculateCustomerBase,
        [
          storeId,
          currentPeriod.end,
          previousPeriod.end,
          currentPeriod.start,
          currentPeriod.end,
        ],
      ),
      this.scheduleRepository.query(
        DashboardCustomersQueries.calculateRetentionRate,
        [
          storeId,
          previousPeriod.start,
          previousPeriod.end,
          currentPeriod.start,
          currentPeriod.end,
          beforePreviousPeriod.start,
          beforePreviousPeriod.end,
        ],
      ),
      this.scheduleRepository.query(
        DashboardCustomersQueries.calculateAverageLTV,
        [storeId, currentPeriod.end, previousPeriod.end],
      ),
      this.scheduleRepository.query(
        DashboardCustomersQueries.calculateNPSScore,
        [
          storeId,
          currentPeriod.start,
          currentPeriod.end,
          previousPeriod.start,
          previousPeriod.end,
        ],
      ),
      this.scheduleRepository.query(
        DashboardCustomersQueries.calculateCustomerEvolution,
        [storeId, this.getSixMonthsAgo()],
      ),
      this.scheduleRepository.query(
        DashboardCustomersQueries.calculateLTVBySegment,
        [storeId],
      ),
      this.scheduleRepository.query(
        DashboardCustomersQueries.calculateTopVIPCustomers,
        [storeId],
      ),
    ]);

    // Formatar resultados
    const customerBase = this.formatCustomerBaseResult(
      customerBaseResult[0] as CustomerBaseResult,
    );
    const retentionRate = this.formatRetentionRateResult(
      retentionRateResult[0] as RetentionRateResult,
    );
    const averageLTV = this.formatAverageLTVResult(
      averageLTVResult[0] as AverageLTVResult,
    );
    const npsScore = this.formatNPSScoreResult(
      npsScoreResult[0] as NPSScoreResult,
    );
    const customerEvolution = this.formatCustomerEvolutionResults(
      customerEvolutionResults as CustomerEvolutionResult[],
    );
    const ltvBySegment = this.formatLTVBySegmentResults(
      ltvBySegmentResults as LTVBySegmentResult[],
    );
    const topVIPCustomers = (
      topVIPCustomersResults as TopVIPCustomerResult[]
    ).map((customer) => ({
      customerId: customer.customer_id,
      customerName: customer.customer_name,
      visits: Number(customer.visits),
      totalSpent: Math.round(Number(customer.total_spent)),
      lastVisit: customer.last_visit,
    }));

    return {
      customerBase,
      retentionRate,
      averageLTV,
      npsScore,
      customerEvolution,
      ltvBySegment,
      topVIPCustomers,
    };
  }

  /**
   * Formata resultado SQL da base de clientes
   */
  private formatCustomerBaseResult(result: CustomerBaseResult): CustomerBase {
    const currentValue = Number(result.current_customers) || 0;
    const previousValue = Number(result.prev_customers) || 0;

    const percentageChange =
      previousValue > 0
        ? parseFloat(
            (((currentValue - previousValue) / previousValue) * 100).toFixed(1),
          )
        : 0;

    return {
      value: currentValue,
      comparison: {
        percentageChange,
        newCustomers: Number(result.new_customers_period) || 0,
      },
    };
  }

  /**
   * Formata resultado SQL da taxa de retenção
   */
  private formatRetentionRateResult(
    result: RetentionRateResult,
  ): RetentionRate {
    const prevCustomersCount = Number(result.prev_customers_count) || 0;
    const currentReturnedCount = Number(result.current_returned_count) || 0;
    const beforePrevCount = Number(result.before_prev_count) || 0;
    const prevReturnedCount = Number(result.prev_returned_count) || 0;

    const currentRate =
      prevCustomersCount > 0
        ? (currentReturnedCount / prevCustomersCount) * 100
        : 0;

    const previousRate =
      beforePrevCount > 0 ? (prevReturnedCount / beforePrevCount) * 100 : 0;

    const percentageChange = parseFloat(
      (currentRate - previousRate).toFixed(1),
    );

    let context = 'Baixo';
    if (currentRate >= 80) context = 'Excelente';
    else if (currentRate >= 60) context = 'Bom';
    else if (currentRate >= 40) context = 'Regular';

    return {
      value: parseFloat(currentRate.toFixed(1)),
      comparison: {
        percentageChange,
      },
      context,
    };
  }

  /**
   * Formata resultado SQL do LTV médio
   */
  private formatAverageLTVResult(result: AverageLTVResult): AverageLTV {
    const currentLTV = Number(result.current_ltv) || 0;
    const previousLTV = Number(result.prev_ltv) || 0;

    const percentageChange =
      previousLTV > 0
        ? parseFloat(
            (((currentLTV - previousLTV) / previousLTV) * 100).toFixed(1),
          )
        : 0;

    return {
      value: Math.round(currentLTV),
      comparison: {
        percentageChange,
      },
      // No acquisition-cost data yet — omit inventing a placeholder CAC.
      cac: null,
    };
  }

  /**
   * Formata resultado SQL do NPS Score
   */
  private formatNPSScoreResult(result: NPSScoreResult): NPSScore {
    const currentNPS = Number(result.current_nps) || 0;
    const previousNPS = Number(result.prev_nps) || 0;
    const absoluteChange = parseFloat((currentNPS - previousNPS).toFixed(1));

    return {
      value: currentNPS,
      comparison: {
        absoluteChange,
      },
      reviewCount: Number(result.review_count) || 0,
    };
  }

  /**
   * Formata resultados SQL de evolução de clientes
   */
  private formatCustomerEvolutionResults(
    results: CustomerEvolutionResult[],
  ): CustomerEvolution[] {
    return results.map((result) => ({
      month: result.month_name,
      newCustomers: Number(result.new_customers) || 0,
      recurringCustomers: Number(result.recurring_customers) || 0,
      churn: Number(result.churn) || 0,
      totalCustomers: Number(result.total_customers) || 0,
    }));
  }

  /**
   * Formata resultados SQL de LTV por segmento
   */
  private formatLTVBySegmentResults(
    results: LTVBySegmentResult[],
  ): LTVBySegment[] {
    return results.map((result) => ({
      segment: result.segment,
      averageLTV: Math.round(Number(result.average_ltv) || 0),
      customerCount: Number(result.customer_count) || 0,
      averageMonthlyVisits: Number(result.average_monthly_visits) || 0,
      retentionRate: Number(result.retention_rate) || 0,
    }));
  }

  /**
   * Retorna a data de 6 meses atrás
   */
  private getSixMonthsAgo(): Date {
    const date = new Date();
    date.setMonth(date.getMonth() - 6);
    return date;
  }
}
