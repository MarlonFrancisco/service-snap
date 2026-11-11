/**
 * SQL Result Types para Dashboard Sales
 * Tipos de retorno das queries SQL parametrizadas
 */

// Resumo do período atual vs anterior (receita, ticket, conversão, meta)
export interface PeriodSummaryResult {
  current_revenue: number;
  prev_revenue: number;
  current_avg_ticket: number;
  prev_avg_ticket: number;
  current_rate: number;
  prev_rate: number;
  current_revenue_per_hour: number;
  prev_revenue_per_hour: number;
  target_goal: number;
  days_remaining: number;
}

// Revenue Evolution (6 months)
export interface RevenueEvolutionResult {
  month_date: Date;
  revenue: number;
  goal: number;
  appointments: number;
}

// Revenue by Day of Week
export interface RevenueByDayOfWeekResult {
  day_of_week: number;
  total_revenue: number;
  average_ticket: number;
  appointments: number;
}

// Revenue by Category
export interface RevenueByCategoryResult {
  id: string;
  name: string;
  revenue: number;
  growth_percentage: number;
}

// Top Services
export interface TopServicesResult {
  id: string;
  name: string;
  revenue: number;
  appointments: number;
  percentage_of_total: number;
  growth_percentage: number;
}

// Profitable Hours
export interface ProfitableHoursResult {
  hour: string;
  revenue: number;
  utilization_rate: number;
}
