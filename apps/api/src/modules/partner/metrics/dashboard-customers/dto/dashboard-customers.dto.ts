/**
 * DTOs para Dashboard de Métricas de Clientes
 * Baseado em: DASHBOARD_METRICS_ONLY.md - Seção 3 (Métricas de Clientes)
 */

/**
 * Filtro de período para consultas
 */
export interface PeriodFilter {
  type: 'week' | 'month' | 'quarter';
}

/**
 * Informação de comparação com período anterior
 */
export interface Comparison {
  value: number;
  previousValue: number;
  percentageChange: number;
}

/**
 * 1. Base de Clientes
 * Total de clientes únicos cadastrados
 */
export interface CustomerBase {
  value: number; // Total de clientes únicos
  comparison: {
    percentageChange: number; // vs mês anterior (%)
    newCustomers: number; // Variação: Quantidade de novos clientes
  };
}

/**
 * 2. Taxa de Retenção
 * Taxa de retenção de clientes
 */
export interface RetentionRate {
  value: number; // XX.X% (1 casa decimal)
  comparison: {
    percentageChange: number; // vs mês anterior (%)
  };
  context: string; // Classificação (ex: Excelente, Bom, etc.)
}

/**
 * 3. LTV Médio (Lifetime Value)
 * Valor médio gerado por cliente durante seu ciclo de vida
 */
export interface AverageLTV {
  value: number; // R$ XXX (sem decimais)
  comparison: {
    percentageChange: number; // vs mês anterior (%)
  };
  /** CAC when known; null until acquisition spend is tracked. */
  cac: number | null;
}

/**
 * 4. NPS Score
 * Net Promoter Score baseado nas avaliações dos clientes
 */
export interface NPSScore {
  value: number; // X.X (1 casa decimal, 0-5)
  comparison: {
    absoluteChange: number; // vs mês anterior
  };
  reviewCount: number; // Número de avaliações coletadas
}

/**
 * 5. Evolução de Clientes (Últimos 6 meses)
 * Evolução mensal da base de clientes
 */
export interface CustomerEvolution {
  month: string; // Jan, Fev, Mar, Abr, Mai, Jun, etc.
  newCustomers: number; // Novos clientes (quantidade)
  recurringCustomers: number; // Clientes recorrentes (quantidade)
  churn: number; // Churn (quantidade)
  totalCustomers: number; // Total de clientes
}

/**
 * 6. Lifetime Value por Segmento
 * Valor gerado e comportamento por segmento de cliente
 */
export interface LTVBySegment {
  segment: 'VIPs' | 'Frequentes' | 'Regulares' | 'Ocasionais' | 'Novos';
  averageLTV: number; // LTV médio (R$)
  customerCount: number; // Número de clientes
  averageMonthlyVisits: number; // Visitas médias por mês
  retentionRate: number; // Taxa de retenção (%)
}

/**
 * 9. Top 5 Clientes VIP
 * Clientes com maior valor gerado
 */
export interface TopVIPCustomer {
  customerId: string;
  customerName: string;
  visits: number; // Número de visitas
  totalSpent: number; // Valor total gasto (R$)
  lastVisit: Date; // Data da última visita
}

/**
 * DTO completo do Dashboard de Clientes
 */
export class DashboardCustomersDto {
  // Métricas Principais
  customerBase: CustomerBase;
  retentionRate: RetentionRate;
  averageLTV: AverageLTV;
  npsScore: NPSScore;

  // Métricas Temporais
  customerEvolution: CustomerEvolution[]; // Últimos 6 meses

  // Métricas de Retenção
  ltvBySegment: LTVBySegment[]; // Segmentação por tipo de cliente
  topVIPCustomers: TopVIPCustomer[]; // Top 5 clientes VIP
}
