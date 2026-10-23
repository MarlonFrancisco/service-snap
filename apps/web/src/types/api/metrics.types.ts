export type PeriodType = 'today' | 'week' | 'month' | 'quarter';

/**
 * Dashboard 1: Visão Geral
 * Corresponde ao DashboardOverviewDto do backend
 */
export interface IDashboardOverview {
  weeklyRevenue: {
    value: number;
    previousValue: number;
    percentageChange: number;
    absoluteChange: number;
  };

  occupationRate: {
    value: number;
    previousValue: number;
    percentageChange: number;
  };

  averageTicket: {
    value: number;
    previousValue: number;
    absoluteChange: number;
  };

  averageRating: {
    value: number;
    previousValue: number;
    reviewCount: number;
  };

  newCustomers: number;

  recurringCustomers: number;

  cancellationRate: {
    value: number;
  };

  conversionRate: {
    value: number;
  };

  peakHours: {
    start: string;
    end: string;
  };

  // Dados Temporais (11-12)
  appointmentsByDay: Array<{
    day: 'Seg' | 'Ter' | 'Qua' | 'Qui' | 'Sex' | 'Sáb' | 'Dom';
    appointments: number;
    revenue: number;
    completed: number;
    cancelled: number;
  }>;

  topServices: Array<{
    id: string;
    name: string;
    bookings: number;
    revenue: number;
  }>;
}

export interface IDashboardSales {
  revenue: {
    value: number;
    previousValue: number;
    percentageChange: number;
    absoluteChange: number;
  };

  averageTicket: {
    value: number;
    previousValue: number;
    percentageChange: number;
    absoluteChange: number;
  };

  conversionRate: {
    value: number;
    previousValue: number;
    percentageChange: number;
    variationInPoints: number;
  };

  revenuePerHour: {
    value: number;
    previousValue: number;
    percentageChange: number;
  };

  // Métricas de Meta (5)
  goal: {
    current: number;
    target: number;
    percentage: number;
    remaining: number;
    daysRemaining: number;
  };

  // Dados Temporais (6-7)
  revenueEvolution: Array<{
    month: string;
    revenue: number;
    goal: number;
    appointments: number;
  }>;

  revenueByDayOfWeek: Array<{
    day: 'Seg' | 'Ter' | 'Qua' | 'Qui' | 'Sex' | 'Sáb' | 'Dom';
    averageRevenue: number;
    averageTicket: number;
    appointments: number;
  }>;

  // Métricas Categóricas (8-10)
  revenueByCategory: Array<{
    id: string;
    name: string;
    revenue: number;
    growthPercentage: number;
  }>;

  topServices: Array<{
    id: string;
    name: string;
    revenue: number;
    appointments: number;
    percentageOfTotal: number;
    growthPercentage: number;
  }>;

  profitableHours: Array<{
    hour: string;
    revenue: number;
    utilizationRate: number;
  }>;

  // Insights
  insights: {
    mostProfitableDay: {
      day: 'Seg' | 'Ter' | 'Qua' | 'Qui' | 'Sex' | 'Sáb' | 'Dom';
      averageRevenue: number;
    };
    opportunities: string[];
  };
}

export interface IDashboardOperational {
  occupancyRate: {
    value: number;
    previousValue: number;
    percentageChange: number;
  };

  averageTime: {
    value: number; // minutos
    previousValue: number;
    percentageChange: number;
  };

  teamEfficiency: {
    value: number; // percentual
    previousValue: number;
    percentageChange: number;
  };

  punctualityRate: {
    value: number; // percentual
    previousValue: number;
    percentageChange: number;
    noShowRate: number; // percentual
  };

  // Métricas de Utilização (5)
  dailyCapacityUtilization: Array<{
    day: 'Seg' | 'Ter' | 'Qua' | 'Qui' | 'Sex' | 'Sáb' | 'Dom';
    totalCapacity: number;
    usedCapacity: number;
    emptyCapacity: number;
    revenue: number;
  }>;

  // Status dos Agendamentos (6)
  appointmentStatus: Array<{
    status: 'completed' | 'scheduled' | 'no-show' | 'cancelled';
    quantity: number;
    percentage: number;
  }>;

  // Duração Média por Serviço (7)
  serviceDuration: Array<{
    id: string;
    name: string;
    averageRealTime: number; // minutos
    plannedTime: number; // minutos
    variation: number; // minutos (real - planejado)
  }>;

  // Distribuição por Período do Dia (8)
  periodDistribution: Array<{
    period: 'morning' | 'afternoon' | 'night';
    label: string; // "Manhã (8h-12h)", "Tarde (12h-18h)", "Noite (18h-22h)"
    appointmentCount: number;
    percentage: number;
    trend: number; // percentagem vs período anterior
  }>;

  // Mapa de Calor - Ocupação por Horário e Dia (9)
  occupancyHeatMap: {
    hours: string[]; // ["8h", "9h", "10h", ...]
    data: Array<{
      day: 'Seg' | 'Ter' | 'Qua' | 'Qui' | 'Sex' | 'Sáb' | 'Dom';
      values: number[]; // percentagem de ocupação para cada hora
    }>;
  };

  // Oportunidades de Tempo Ocioso (10)
  idleTimeOpportunities: Array<{
    dayAndPeriod: string;
    emptyHours: number;
    potentialRevenue: number;
  }>;

  // Performance Detalhada por Profissional (11)
  professionalPerformance: Array<{
    id: string;
    name: string;
    appointmentCount: number;
    averageRating: number; // 0-5
    revenue: number;
    efficiency: number; // percentual
    punctualityRate: number; // percentual
    averageAttendanceTime: number; // minutos
    utilizationRate: number; // percentual
  }>;
}

/**
 * Dashboard 4: Clientes
 * Corresponde ao DashboardCustomersDto do backend
 */
export interface IDashboardCustomers {
  // 1. Base de Clientes
  customerBase: {
    value: number; // Total de clientes únicos
    comparison: {
      percentageChange: number; // vs mês anterior (%)
      newCustomers: number; // Variação: Quantidade de novos clientes
    };
  };

  // 2. Taxa de Retenção
  retentionRate: {
    value: number; // XX.X% (1 casa decimal)
    comparison: {
      percentageChange: number; // vs mês anterior (%)
    };
    context: string; // Classificação (ex: Excelente, Bom, etc.)
  };

  // 3. LTV Médio (Lifetime Value)
  averageLTV: {
    value: number; // R$ XXX (sem decimais)
    comparison: {
      percentageChange: number; // vs mês anterior (%)
    };
    /** CAC when known; null until acquisition spend is tracked. */
    cac: number | null;
  };

  // 4. NPS Score
  npsScore: {
    value: number; // X.X (1 casa decimal, 0-5)
    comparison: {
      absoluteChange: number; // vs mês anterior
    };
    reviewCount: number; // Número de avaliações coletadas
  };

  // 5. Evolução de Clientes (Últimos 6 meses)
  customerEvolution: Array<{
    month: string; // Jan, Fev, Mar, Abr, Mai, Jun, etc.
    newCustomers: number; // Novos clientes (quantidade)
    recurringCustomers: number; // Clientes recorrentes (quantidade)
    churn: number; // Churn (quantidade)
    totalCustomers: number; // Total de clientes
  }>;

  // 6. Lifetime Value por Segmento
  ltvBySegment: Array<{
    segment: 'VIPs' | 'Frequentes' | 'Regulares' | 'Ocasionais' | 'Novos';
    averageLTV: number; // LTV médio (R$)
    customerCount: number; // Número de clientes
    averageMonthlyVisits: number; // Visitas médias por mês
    retentionRate: number; // Taxa de retenção (%)
  }>;

  // 9. Top 5 Clientes VIP
  topVIPCustomers: Array<{
    customerId: string;
    customerName: string;
    visits: number; // Número de visitas
    totalSpent: number; // Valor total gasto (R$)
    lastVisit: Date; // Data da última visita
  }>;
}
