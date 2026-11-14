import { Controller, Get, Param, Query, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import {
  PlanFeatureGuard,
  RequiresPlanFeatures,
  RequireStoreRoles,
  StoreRoleGuard,
} from '../stores/guards';
import { DashboardCustomersService } from './dashboard-customers/dashboard-customers.service';
import { DashboardOperationalService } from './dashboard-operational/dashboard-operational.service';
import { DashboardOverviewService } from './dashboard-overview/dashboard-overview.service';
import { DashboardSalesService } from './dashboard-sales/dashboard-sales.service';

type OverviewPeriodType = 'week' | 'month' | 'quarter';
type SalesPeriodType = 'week' | 'month' | 'quarter';
type OperationalPeriodType = 'week' | 'month' | 'quarter';
type CustomersPeriodType = 'week' | 'month' | 'quarter';

@Controller('partner/stores/:storeId/metrics')
// A ordem importa: o plano só é lido depois de confirmar o acesso à loja.
// Gestão da loja: só dono e gerente
@RequireStoreRoles('owner', 'manager')
@UseGuards(JwtAuthGuard, StoreRoleGuard, PlanFeatureGuard)
export class MetricsController {
  constructor(
    private readonly dashboardOverviewService: DashboardOverviewService,
    private readonly dashboardSalesService: DashboardSalesService,
    private readonly dashboardOperationalService: DashboardOperationalService,
    private readonly dashboardCustomersService: DashboardCustomersService,
  ) {}

  /**
   * GET /partner/stores/:storeId/metrics/overview?period=week
   * Dashboard 1 - Visão Geral com todas as métricas principais
   * @param storeId - ID da loja
   * @param period - Período para análise: 'today' (hoje), 'week' (esta semana), 'month' (este mês). Padrão: 'week'
   */
  @Get('overview')
  @RequiresPlanFeatures('DASHBOARD_GENERAL_ACCESS')
  async getDashboard1Overview(
    @Param('storeId') storeId: string,
    @Query('period') period: OverviewPeriodType = 'week',
  ) {
    // Validar período
    const validPeriods: OverviewPeriodType[] = ['week', 'month', 'quarter'];
    const normalizedPeriod = validPeriods.includes(period) ? period : 'week';

    return this.dashboardOverviewService.getDashboardOverview(
      storeId,
      normalizedPeriod,
    );
  }

  /**
   * GET /partner/stores/:storeId/metrics/sales?period=month
   * Dashboard 2 - Vendas & Receita com todas as métricas de vendas
   * @param storeId - ID da loja
   * @param period - Período para análise: 'week' (esta semana), 'month' (este mês), 'quarter' (este trimestre). Padrão: 'month'
   */
  @Get('sales')
  @RequiresPlanFeatures('DASHBOARD_GENERAL_ACCESS', 'DASHBOARD_SALES_ACCESS')
  async getDashboardSales(
    @Param('storeId') storeId: string,
    @Query('period') period: SalesPeriodType = 'month',
  ) {
    // Validar período
    const validPeriods: SalesPeriodType[] = ['week', 'month', 'quarter'];
    const normalizedPeriod = validPeriods.includes(period) ? period : 'month';

    return this.dashboardSalesService.getDashboardSales(
      storeId,
      normalizedPeriod,
    );
  }

  /**
   * GET /partner/stores/:storeId/metrics/operational?period=month
   * Dashboard 3 - Operacional com todas as métricas de operação
   * @param storeId - ID da loja
   * @param period - Período para análise: 'week' (esta semana), 'month' (este mês), 'quarter' (este trimestre). Padrão: 'month'
   */
  @Get('operational')
  @RequiresPlanFeatures(
    'DASHBOARD_GENERAL_ACCESS',
    'DASHBOARD_OPERATIONAL_ACCESS',
  )
  async getDashboardOperational(
    @Param('storeId') storeId: string,
    @Query('period') period: OperationalPeriodType = 'month',
  ) {
    // Validar período
    const validPeriods: OperationalPeriodType[] = ['week', 'month', 'quarter'];
    const normalizedPeriod = validPeriods.includes(period) ? period : 'month';

    return this.dashboardOperationalService.getOperationalMetrics(
      storeId,
      normalizedPeriod,
    );
  }

  /**
   * GET /partner/stores/:storeId/metrics/customers?period=month
   * Dashboard 4 - Clientes com todas as métricas de clientes, retenção, LTV e churn
   * @param storeId - ID da loja
   * @param period - Período para análise: 'week' (esta semana), 'month' (este mês), 'quarter' (este trimestre). Padrão: 'month'
   */
  @Get('customers')
  @RequiresPlanFeatures(
    'DASHBOARD_GENERAL_ACCESS',
    'DASHBOARD_CUSTOMERS_ACCESS',
  )
  async getDashboardCustomers(
    @Param('storeId') storeId: string,
    @Query('period') period: CustomersPeriodType = 'month',
  ) {
    // Validar período
    const validPeriods: CustomersPeriodType[] = ['week', 'month', 'quarter'];
    const normalizedPeriod = validPeriods.includes(period) ? period : 'month';

    return this.dashboardCustomersService.getDashboardCustomers(
      storeId,
      normalizedPeriod,
    );
  }
}
