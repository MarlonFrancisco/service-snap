/**
 * SQL Queries para Dashboard Overview
 * Queries otimizadas para performance
 * Todas as queries são parametrizadas para prevenir SQL injection
 */

export const DashboardOverviewQueries = {
  /**
   * Resumo do período atual vs anterior em uma única leitura de `schedules`:
   * receita, ticket médio, ocupação, cancelamento e conversão.
   * $1: store_id, $2: current_start, $3: current_end, $4: prev_start, $5: prev_end
   */
  calculatePeriodSummary: `
    WITH base AS (
      SELECT
        sch.status,
        (sch.date >= $2::date AND sch.date <= $3::date) AS is_current,
        -- Receita só conta agendamento concluído cujo serviço ainda existe
        CASE WHEN sch.status = 'completed' AND s.id IS NOT NULL
          THEN COALESCE(sch.price, s.price)
        END AS paid_amount
      FROM schedules sch
      LEFT JOIN services s ON sch."serviceId" = s.id
      WHERE sch."storeId" = $1::uuid
        AND (
          (sch.date >= $2::date AND sch.date <= $3::date)
          OR (sch.date >= $4::date AND sch.date <= $5::date)
        )
    )
    SELECT
      COALESCE(SUM(paid_amount) FILTER (WHERE is_current), 0) AS current_revenue,
      COALESCE(SUM(paid_amount) FILTER (WHERE NOT is_current), 0) AS prev_revenue,
      ROUND(COALESCE(AVG(paid_amount) FILTER (WHERE is_current), 0)) AS current_avg_ticket,
      ROUND(COALESCE(AVG(paid_amount) FILTER (WHERE NOT is_current), 0)) AS prev_avg_ticket,
      (COUNT(*) FILTER (WHERE is_current AND status IN ('scheduled', 'completed')))::INT AS current_occupied,
      (COUNT(*) FILTER (WHERE NOT is_current AND status IN ('scheduled', 'completed')))::INT AS prev_occupied,
      COUNT(*) FILTER (WHERE is_current) AS total_schedules,
      COUNT(*) FILTER (WHERE is_current AND status = 'cancelled') AS cancelled_count,
      COUNT(*) FILTER (WHERE is_current AND status = 'completed') AS completed_count
    FROM base
  `,

  /**
   * Clientes novos (primeira reserva criada no período) e recorrentes (mais de
   * um agendamento no período), agrupando o histórico da loja uma única vez.
   * $1: store_id, $2: period_start, $3: period_end
   */
  countCustomers: `
    WITH per_user AS (
      SELECT
        MIN(created_at) AS first_visit_date,
        COUNT(*) FILTER (WHERE date >= $2::date AND date <= $3::date) AS period_bookings
      FROM schedules
      WHERE "storeId" = $1::uuid
        AND "userId" IS NOT NULL
      GROUP BY "userId"
    )
    SELECT
      COUNT(*) FILTER (
        WHERE first_visit_date >= $2::date
          AND first_visit_date < ($3::date + 1)
      ) AS new_customers_count,
      COUNT(*) FILTER (WHERE period_bookings > 1) AS recurring_count
    FROM per_user
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
        COALESCE(SUM(COALESCE(sch.price, s.price)) FILTER (
          WHERE sch.status = 'completed'
        ), 0) as total_revenue
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
      COALESCE(SUM(COALESCE(sch.price, s.price)) FILTER (
        WHERE sch.status = 'completed'
      ), 0) as total_revenue
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
