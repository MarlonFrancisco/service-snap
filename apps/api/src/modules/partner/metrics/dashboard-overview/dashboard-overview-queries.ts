/**
 * SQL Queries para Dashboard Overview
 * Queries otimizadas para performance
 * Todas as queries são parametrizadas para prevenir SQL injection
 */

export const DashboardOverviewQueries = {
  /**
   * Calcula receita do período atual vs anterior
   * $1: store_id, $2: current_start, $3: current_end, $4: prev_start, $5: prev_end
   */
  calculateRevenue: `
    WITH current_period AS (
      SELECT COALESCE(SUM(COALESCE(sch.price, s.price)), 0) as total
      FROM schedules sch
      INNER JOIN services s ON sch."serviceId" = s.id
      WHERE sch."storeId" = $1::uuid
        AND sch.date >= $2::date
        AND sch.date <= $3::date
        AND sch.status = 'completed'
    ),
    prev_period AS (
      SELECT COALESCE(SUM(COALESCE(sch.price, s.price)), 0) as total
      FROM schedules sch
      INNER JOIN services s ON sch."serviceId" = s.id
      WHERE sch."storeId" = $1::uuid
        AND sch.date >= $4::date
        AND sch.date <= $5::date
        AND sch.status = 'completed'
    )
    SELECT
      (SELECT total FROM current_period) as current_revenue,
      (SELECT total FROM prev_period) as prev_revenue
  `,

  /**
   * Calcula taxa de ocupação (agendamentos confirmados + completados / total de slots)
   * $1: store_id, $2: current_start, $3: current_end, $4: prev_start, $5: prev_end
   */
  calculateOccupationRate: `
    WITH current_period AS (
      SELECT COUNT(*) as occupied
      FROM schedules
      WHERE "storeId" = $1::uuid
        AND date >= $2::date
        AND date <= $3::date
        AND status IN ('scheduled', 'completed')
    ),
    prev_period AS (
      SELECT COUNT(*) as occupied
      FROM schedules
      WHERE "storeId" = $1::uuid
        AND date >= $4::date
        AND date <= $5::date
        AND status IN ('scheduled', 'completed')
    )
    SELECT
      (SELECT occupied FROM current_period)::INT as current_occupied,
      (SELECT occupied FROM prev_period)::INT as prev_occupied,
      ($3::date - $2::date) + 1 as period_days
  `,

  /**
   * Calcula ticket médio (receita média por agendamento completado)
   * $1: store_id, $2: current_start, $3: current_end, $4: prev_start, $5: prev_end
   */
  calculateAverageTicket: `
    WITH current_period AS (
      SELECT
        COUNT(*) as completed_count,
        COALESCE(AVG(COALESCE(sch.price, s.price)), 0) as avg_price
      FROM schedules sch
      INNER JOIN services s ON sch."serviceId" = s.id
      WHERE sch."storeId" = $1::uuid
        AND sch.date >= $2::date
        AND sch.date <= $3::date
        AND sch.status = 'completed'
    ),
    prev_period AS (
      SELECT
        COUNT(*) as completed_count,
        COALESCE(AVG(COALESCE(sch.price, s.price)), 0) as avg_price
      FROM schedules sch
      INNER JOIN services s ON sch."serviceId" = s.id
      WHERE sch."storeId" = $1::uuid
        AND sch.date >= $4::date
        AND sch.date <= $5::date
        AND sch.status = 'completed'
    )
    SELECT
      ROUND(CAST((SELECT avg_price FROM current_period) AS NUMERIC)) as current_avg_ticket,
      (SELECT completed_count FROM current_period) as current_completed_count,
      ROUND(CAST((SELECT avg_price FROM prev_period) AS NUMERIC)) as prev_avg_ticket,
      (SELECT completed_count FROM prev_period) as prev_completed_count
  `,

  /**
   * Calcula classificação média (média de ratings de reviews)
   * $1: store_id, $2: current_period_start, $3: previous_period_start
   */
  calculateAverageRating: `
    WITH current_period_users AS (
      SELECT DISTINCT "userId"
      FROM schedules
      WHERE "storeId" = $1::uuid
        AND "userId" IS NOT NULL
        AND status = 'completed'
        AND date >= $2::date
    ),
    previous_period_users AS (
      SELECT DISTINCT "userId"
      FROM schedules
      WHERE "storeId" = $1::uuid
        AND "userId" IS NOT NULL
        AND status = 'completed'
        AND date >= $3::date
        AND date < $2::date
    ),
    current_ratings AS (
      SELECT
        COALESCE(ROUND(CAST(AVG(r.rating) AS NUMERIC), 1), 0) as avg_rating,
        COUNT(r.id) as review_count
      FROM reviews r
      WHERE r."storeId" = $1::uuid
        AND r."userId" IN (SELECT "userId" FROM current_period_users)
    ),
    prev_ratings AS (
      SELECT
        COALESCE(ROUND(CAST(AVG(r.rating) AS NUMERIC), 1), 0) as avg_rating
      FROM reviews r
      WHERE r."storeId" = $1::uuid
        AND r."userId" IN (SELECT "userId" FROM previous_period_users)
    )
    SELECT
      (SELECT avg_rating FROM current_ratings) as avg_rating,
      (SELECT review_count FROM current_ratings) as review_count,
      (SELECT avg_rating FROM prev_ratings) as prev_avg_rating
  `,

  /**
   * Conta novos clientes (usuários cuja primeira compra foi no período)
   * $1: store_id, $2: period_start, $3: period_end
   */
  countNewCustomers: `
    WITH first_visits AS (
      SELECT
        "userId",
        MIN(created_at) as first_visit_date
      FROM schedules
      WHERE "storeId" = $1::uuid
        AND "userId" IS NOT NULL
      GROUP BY "userId"
    )
    SELECT COUNT(*) as new_customers_count
    FROM first_visits
    WHERE first_visit_date >= $2::date
      AND first_visit_date <= $3::date
  `,

  /**
   * Conta clientes recorrentes (com mais de 1 agendamento no período)
   * $1: store_id, $2: period_start, $3: period_end
   */
  countRecurringCustomers: `
    WITH user_bookings AS (
      SELECT
        "userId",
        COUNT(*) as booking_count
      FROM schedules
      WHERE "storeId" = $1::uuid
        AND date >= $2::date
        AND date <= $3::date
        AND "userId" IS NOT NULL
      GROUP BY "userId"
    )
    SELECT COUNT(*) as recurring_count
    FROM user_bookings
    WHERE booking_count > 1
  `,

  /**
   * Calcula taxa de cancelamento
   * $1: store_id, $2: period_start, $3: period_end
   */
  calculateCancellationRate: `
    SELECT
      COUNT(*) as total_schedules,
      SUM(CASE WHEN status = 'cancelled' THEN 1 ELSE 0 END) as cancelled_count
    FROM schedules
    WHERE "storeId" = $1::uuid
      AND date >= $2::date
      AND date <= $3::date
  `,

  /**
   * Calcula taxa de conversão (completados / total)
   * $1: store_id, $2: period_start, $3: period_end
   */
  calculateConversionRate: `
    SELECT
      SUM(CASE WHEN status = 'completed' THEN 1 ELSE 0 END) as completed_count,
      COUNT(*) as total_count
    FROM schedules
    WHERE "storeId" = $1::uuid
      AND date >= $2::date
      AND date <= $3::date
  `,

  /**
   * Calcula agendamentos por dia (com receita e status)
   * Retorna todos os 7 dias da semana, mesmo que com 0 agendamentos
   * $1: store_id, $2: period_start, $3: period_end
   */
  calculateAppointmentsByDay: `
    WITH all_days AS (
      SELECT 0 as day_of_week
      UNION ALL SELECT 1
      UNION ALL SELECT 2
      UNION ALL SELECT 3
      UNION ALL SELECT 4
      UNION ALL SELECT 5
      UNION ALL SELECT 6
    ),
    daily_stats AS (
      SELECT
        EXTRACT(DOW FROM sch.date)::INT as day_of_week,
        COUNT(*) as total_appointments,
        SUM(CASE WHEN sch.status = 'completed' THEN 1 ELSE 0 END) as completed_count,
        SUM(CASE WHEN sch.status = 'cancelled' THEN 1 ELSE 0 END) as cancelled_count,
        COALESCE(SUM(COALESCE(sch.price, s.price)), 0) as total_revenue
      FROM schedules sch
      LEFT JOIN services s ON sch."serviceId" = s.id
      WHERE sch."storeId" = $1::uuid
        AND sch.date >= $2::date
        AND sch.date <= $3::date
      GROUP BY EXTRACT(DOW FROM sch.date)
    )
    SELECT
      ad.day_of_week,
      COALESCE(ds.total_appointments, 0) as total_appointments,
      COALESCE(ds.completed_count, 0) as completed_count,
      COALESCE(ds.cancelled_count, 0) as cancelled_count,
      COALESCE(ds.total_revenue, 0) as total_revenue
    FROM all_days ad
    LEFT JOIN daily_stats ds ON ad.day_of_week = ds.day_of_week
    ORDER BY ad.day_of_week ASC
  `,

  /**
   * Top 5 serviços mais agendados (com receita)
   * $1: store_id, $2: period_start, $3: period_end
   */
  calculateTopServices: `
    SELECT
      s.id as service_id,
      s.name as service_name,
      COUNT(*) as bookings_count,
      COALESCE(SUM(COALESCE(sch.price, s.price)), 0) as total_revenue
    FROM schedules sch
    INNER JOIN services s ON sch."serviceId" = s.id
    WHERE sch."storeId" = $1::uuid
      AND sch.date >= $2::date
      AND sch.date <= $3::date
    GROUP BY s.id, s.name
    ORDER BY bookings_count DESC
    LIMIT 5
  `,
};
