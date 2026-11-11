/**
 * SQL Result Types para Dashboard Overview
 * Tipos de retorno das queries SQL parametrizadas
 */

// Resumo do período atual vs anterior (receita, ticket, ocupação, taxas)
export interface PeriodSummaryResult {
  current_revenue: number;
  prev_revenue: number;
  current_avg_ticket: number;
  prev_avg_ticket: number;
  current_occupied: number;
  prev_occupied: number;
  total_schedules: number;
  cancelled_count: number;
  completed_count: number;
}

// Clientes novos e recorrentes do período
export interface CustomerCountsResult {
  new_customers_count: number;
  recurring_count: number;
}

// Average Rating calculation
export interface AverageRatingResult {
  avg_rating: number;
  review_count: number;
  prev_avg_rating: number;
}

// Appointments by Day
export interface AppointmentsByDayResult {
  day_of_week: number;
  total_appointments: number;
  completed_count: number;
  cancelled_count: number;
  total_revenue: number;
}

// Top Services
export interface TopServicesResult {
  service_id: string;
  service_name: string;
  bookings_count: number;
  total_revenue: number;
}
