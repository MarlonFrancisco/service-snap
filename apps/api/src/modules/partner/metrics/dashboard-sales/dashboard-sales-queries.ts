/**
 * SQL Queries para Dashboard Sales
 * Queries otimizadas para performance
 * Todas as queries são parametrizadas para prevenir SQL injection
 */

export const DashboardSalesQueries = {
  /**
   * Calcula receita do período atual vs anterior
   * $1: store_id, $2: current_start, $3: current_end, $4: prev_start, $5: prev_end
   */
  calculateRevenue: `
    WITH current_period AS (
      SELECT COALESCE(SUM(COALESCE(sch.price, s.price)), 0) as total, COUNT(*) as count
      FROM schedules sch
      INNER JOIN services s ON sch."serviceId" = s.id
      WHERE sch."storeId" = $1::uuid
        AND sch.date >= $2::date
        AND sch.date <= $3::date
        AND sch.status = 'completed'
    ),
    prev_period AS (
      SELECT COALESCE(SUM(COALESCE(sch.price, s.price)), 0) as total, COUNT(*) as count
      FROM schedules sch
      INNER JOIN services s ON sch."serviceId" = s.id
      WHERE sch."storeId" = $1::uuid
        AND sch.date >= $4::date
        AND sch.date <= $5::date
        AND sch.status = 'completed'
    )
    SELECT
      (SELECT total FROM current_period) as current_revenue,
      (SELECT total FROM prev_period) as prev_revenue,
      (SELECT count FROM current_period) as current_count,
      (SELECT count FROM prev_period) as prev_count
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
      ROUND(CAST((SELECT avg_price FROM prev_period) AS NUMERIC)) as prev_avg_ticket
  `,

  /**
   * Calcula taxa de conversão (completados / total)
   * $1: store_id, $2: current_start, $3: current_end, $4: prev_start, $5: prev_end
   */
  calculateConversionRate: `
    WITH current_period AS (
      SELECT
        SUM(CASE WHEN status = 'completed' THEN 1 ELSE 0 END) as completed_count,
        COUNT(*) as total_count
      FROM schedules
      WHERE "storeId" = $1::uuid
        AND date >= $2::date
        AND date <= $3::date
    ),
    prev_period AS (
      SELECT
        SUM(CASE WHEN status = 'completed' THEN 1 ELSE 0 END) as completed_count,
        COUNT(*) as total_count
      FROM schedules
      WHERE "storeId" = $1::uuid
        AND date >= $4::date
        AND date <= $5::date
    )
    SELECT
      ROUND(CASE WHEN (SELECT total_count FROM current_period) > 0
        THEN ((SELECT completed_count FROM current_period)::NUMERIC /
              (SELECT total_count FROM current_period)::NUMERIC * 100)
        ELSE 0 END) as current_rate,
      ROUND(CASE WHEN (SELECT total_count FROM prev_period) > 0
        THEN ((SELECT completed_count FROM prev_period)::NUMERIC /
              (SELECT total_count FROM prev_period)::NUMERIC * 100)
        ELSE 0 END) as prev_rate
  `,

  /**
   * Calcula receita por hora (receita / horas de funcionamento)
   * $1: store_id, $2: current_start, $3: current_end, $4: prev_start, $5: prev_end
   */
  calculateRevenuePerHour: `
    WITH business_hours AS (
      SELECT
        CAST(SUBSTRING("closeTime", 1, 2) AS INT) -
        CAST(SUBSTRING("openTime", 1, 2) AS INT) as hours_per_day
      FROM stores
      WHERE id = $1::uuid
    ),
    period_days AS (
      SELECT ($3::date - $2::date) + 1 as current_days,
             ($5::date - $4::date) + 1 as prev_days
    ),
    current_period AS (
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
      ROUND((SELECT total FROM current_period)::NUMERIC /
            GREATEST((SELECT hours_per_day FROM business_hours) *
                     (SELECT current_days FROM period_days), 1)::NUMERIC) as current_revenue_per_hour,
      ROUND((SELECT total FROM prev_period)::NUMERIC /
            GREATEST((SELECT hours_per_day FROM business_hours) *
                     (SELECT prev_days FROM period_days), 1)::NUMERIC) as prev_revenue_per_hour
  `,

  /**
   * Calcula meta/goal progress
   * $1: store_id, $2: current_start, $3: current_end, $4: period_type (week/month/quarter)
   */
  calculateGoalProgress: `
    WITH revenue_data AS (
      SELECT COALESCE(SUM(COALESCE(sch.price, s.price)), 0) as current_revenue
      FROM schedules sch
      INNER JOIN services s ON sch."serviceId" = s.id
      WHERE sch."storeId" = $1::uuid
        AND sch.date >= $2::date
        AND sch.date <= $3::date
        AND sch.status = 'completed'
    ),
    goal_data AS (
      SELECT
        CASE
          WHEN $4 = 'week' THEN COALESCE("weeklyGoal", 0)
          WHEN $4 = 'month' THEN COALESCE("monthlyGoal", 0)
          WHEN $4 = 'quarter' THEN COALESCE("quarterlyGoal", 0)
          ELSE 0
        END as target_goal
      FROM stores
      WHERE id = $1::uuid
    ),
    days_remaining AS (
      SELECT
        GREATEST(0, CASE
          WHEN $4 = 'week' THEN (7 - EXTRACT(DOW FROM CURRENT_DATE)::INT)
          WHEN $4 = 'month' THEN ((DATE_TRUNC('month', CURRENT_DATE + '1 month'::interval)::date - CURRENT_DATE)::INT)
          WHEN $4 = 'quarter' THEN ((DATE_TRUNC('quarter', CURRENT_DATE + '3 months'::interval)::date - CURRENT_DATE)::INT)
          ELSE 0
        END) as days_left
    )
    SELECT
      (SELECT current_revenue FROM revenue_data) as current_revenue,
      (SELECT target_goal FROM goal_data) as target_goal,
      (SELECT days_left FROM days_remaining)::INT as days_remaining
  `,

  /**
   * Calcula evolução de receita para últimos 6 meses
   * $1: store_id
   */
  calculateRevenueEvolution: `
    WITH months AS (
      SELECT
        DATE_TRUNC('month', CURRENT_DATE - (interval '1 month' * (row_number() OVER () - 1)))::date as month_date,
        row_number() OVER () as month_num
      FROM generate_series(0, 5)
    ),
    monthly_stats AS (
      SELECT
        DATE_TRUNC('month', sch.date)::date as month_date,
        COALESCE(SUM(COALESCE(sch.price, s.price)), 0) as total_revenue,
        COUNT(*) as appointments
      FROM schedules sch
      LEFT JOIN services s ON sch."serviceId" = s.id
      WHERE sch."storeId" = $1::uuid
        AND sch.status = 'completed'
        AND sch.date >= DATE_TRUNC('month', CURRENT_DATE - interval '6 months')
      GROUP BY DATE_TRUNC('month', sch.date)
    ),
    goals_per_month AS (
      SELECT
        DATE_TRUNC('month', CURRENT_DATE - (interval '1 month' * (row_number() OVER () - 1)))::date as month_date,
        COALESCE("monthlyGoal", 0) as goal
      FROM stores, generate_series(0, 5)
      WHERE id = $1::uuid
    )
    SELECT
      m.month_date,
      COALESCE(ms.total_revenue, 0) as revenue,
      COALESCE(gpm.goal, 0) as goal,
      COALESCE(ms.appointments, 0) as appointments
    FROM months m
    LEFT JOIN monthly_stats ms ON m.month_date = ms.month_date
    LEFT JOIN goals_per_month gpm ON m.month_date = gpm.month_date
    ORDER BY m.month_num DESC
  `,

  /**
   * Calcula receita por dia da semana
   * $1: store_id, $2: period_start, $3: period_end
   */
  calculateRevenueByDayOfWeek: `
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
        COALESCE(SUM(COALESCE(sch.price, s.price)), 0)::NUMERIC as total_revenue
      FROM schedules sch
      LEFT JOIN services s ON sch."serviceId" = s.id
      WHERE sch."storeId" = $1::uuid
        AND sch.date >= $2::date
        AND sch.date <= $3::date
        AND sch.status = 'completed'
      GROUP BY EXTRACT(DOW FROM sch.date)
    ),
    stats_with_avg AS (
      SELECT
        day_of_week,
        total_appointments,
        total_revenue,
        CASE WHEN total_appointments > 0
          THEN ROUND(total_revenue / total_appointments)
          ELSE 0
        END as avg_ticket
      FROM daily_stats
    )
    SELECT
      ad.day_of_week,
      COALESCE(swa.total_revenue, 0)::INT as total_revenue,
      COALESCE(swa.avg_ticket, 0)::INT as average_ticket,
      COALESCE(swa.total_appointments, 0) as appointments
    FROM all_days ad
    LEFT JOIN stats_with_avg swa ON ad.day_of_week = swa.day_of_week
    ORDER BY ad.day_of_week
  `,

  /**
   * Calcula receita por categoria
   * $1: store_id, $2: period_start, $3: period_end, $4: prev_period_start, $5: prev_period_end
   */
  calculateRevenueByCategory: `
    WITH current_period AS (
      SELECT
        c.id as category_id,
        c.name as category_name,
        COALESCE(SUM(COALESCE(sch.price, s.price)), 0) as total_revenue,
        COUNT(*) as count
      FROM schedules sch
      INNER JOIN services s ON sch."serviceId" = s.id
      INNER JOIN categories c ON s."categoryId" = c.id
      WHERE sch."storeId" = $1::uuid
        AND sch.date >= $2::date
        AND sch.date <= $3::date
        AND sch.status = 'completed'
      GROUP BY c.id, c.name
    ),
    prev_period AS (
      SELECT
        c.id as category_id,
        COALESCE(SUM(COALESCE(sch.price, s.price)), 0) as total_revenue
      FROM schedules sch
      INNER JOIN services s ON sch."serviceId" = s.id
      INNER JOIN categories c ON s."categoryId" = c.id
      WHERE sch."storeId" = $1::uuid
        AND sch.date >= $4::date
        AND sch.date <= $5::date
        AND sch.status = 'completed'
      GROUP BY c.id
    )
    SELECT
      cp.category_id as id,
      cp.category_name as name,
      ROUND(cp.total_revenue) as revenue,
      ROUND(CASE WHEN pp.total_revenue > 0
        THEN ((cp.total_revenue - pp.total_revenue) / pp.total_revenue * 100)
        ELSE 0
      END) as growth_percentage
    FROM current_period cp
    LEFT JOIN prev_period pp ON cp.category_id = pp.category_id
    ORDER BY cp.total_revenue DESC
  `,

  /**
   * Top 5 serviços mais lucrativos
   * $1: store_id, $2: period_start, $3: period_end, $4: prev_period_start, $5: prev_period_end
   */
  calculateTopServices: `
    WITH current_period AS (
      SELECT
        s.id as service_id,
        s.name as service_name,
        COALESCE(SUM(COALESCE(sch.price, s.price)), 0) as total_revenue,
        COUNT(*) as appointments,
        COUNT(*)::NUMERIC as count_numeric
      FROM schedules sch
      INNER JOIN services s ON sch."serviceId" = s.id
      WHERE sch."storeId" = $1::uuid
        AND sch.date >= $2::date
        AND sch.date <= $3::date
        AND sch.status = 'completed'
      GROUP BY s.id, s.name
    ),
    prev_period AS (
      SELECT
        s.id as service_id,
        COALESCE(SUM(COALESCE(sch.price, s.price)), 0) as total_revenue
      FROM schedules sch
      INNER JOIN services s ON sch."serviceId" = s.id
      WHERE sch."storeId" = $1::uuid
        AND sch.date >= $4::date
        AND sch.date <= $5::date
        AND sch.status = 'completed'
      GROUP BY s.id
    ),
    total_revenue_current AS (
      SELECT SUM(total_revenue) as total FROM current_period
    ),
    with_percentages AS (
      SELECT
        cp.service_id as id,
        cp.service_name as name,
        ROUND(cp.total_revenue) as revenue,
        cp.appointments,
        ROUND((cp.total_revenue::NUMERIC /
               GREATEST((SELECT total FROM total_revenue_current), 1)::NUMERIC) * 100)::INT as percentage_of_total,
        ROUND(CASE WHEN pp.total_revenue > 0
          THEN ((cp.total_revenue - pp.total_revenue) / pp.total_revenue * 100)
          ELSE 0
        END) as growth_percentage
      FROM current_period cp
      LEFT JOIN prev_period pp ON cp.service_id = pp.service_id
    )
    SELECT * FROM with_percentages
    ORDER BY revenue DESC
    LIMIT 5
  `,

  /**
   * Calcula horas mais lucrativas
   * $1: store_id, $2: period_start, $3: period_end
   */
  calculateProfitableHours: `
    WITH hourly_stats AS (
      SELECT
        SUBSTRING(sch."startTime", 1, 2) as hour,
        COALESCE(SUM(COALESCE(sch.price, s.price)), 0) as total_revenue,
        COUNT(*) as count
      FROM schedules sch
      LEFT JOIN services s ON sch."serviceId" = s.id
      WHERE sch."storeId" = $1::uuid
        AND sch.date >= $2::date
        AND sch.date <= $3::date
        AND sch.status = 'completed'
        AND sch."startTime" IS NOT NULL
      GROUP BY SUBSTRING(sch."startTime", 1, 2)
    ),
    business_hours AS (
      SELECT
        CAST(SUBSTRING("openTime", 1, 2) AS INT) as open_hour,
        CAST(SUBSTRING("closeTime", 1, 2) AS INT) as close_hour,
        CAST(SUBSTRING("closeTime", 1, 2) AS INT) -
        CAST(SUBSTRING("openTime", 1, 2) AS INT) as total_hours
      FROM stores
      WHERE id = $1::uuid
    ),
    max_revenue AS (
      SELECT MAX(total_revenue) as max_rev FROM hourly_stats
    )
    SELECT
      hs.hour,
      ROUND(hs.total_revenue) as revenue,
      ROUND(CASE WHEN (SELECT max_rev FROM max_revenue) > 0
        THEN (hs.total_revenue::NUMERIC /
              (SELECT max_rev FROM max_revenue)::NUMERIC * 100)
        ELSE 0
      END) as utilization_rate
    FROM hourly_stats hs
    ORDER BY hs.total_revenue DESC
    LIMIT 10
  `,

  /**
   * Encontra o dia da semana mais lucrativo (para insights)
   * $1: store_id, $2: period_start, $3: period_end
   */
  calculateMostProfitableDay: `
    WITH daily_revenue AS (
      SELECT
        EXTRACT(DOW FROM sch.date)::INT as day_of_week,
        COALESCE(SUM(COALESCE(sch.price, s.price)), 0)::NUMERIC as total_revenue,
        COUNT(*) as count
      FROM schedules sch
      LEFT JOIN services s ON sch."serviceId" = s.id
      WHERE sch."storeId" = $1::uuid
        AND sch.date >= $2::date
        AND sch.date <= $3::date
        AND sch.status = 'completed'
      GROUP BY EXTRACT(DOW FROM sch.date)
    ),
    avg_per_day AS (
      SELECT
        day_of_week,
        ROUND(total_revenue / GREATEST(count, 1)) as avg_revenue
      FROM daily_revenue
    )
    SELECT
      day_of_week,
      avg_revenue
    FROM avg_per_day
    ORDER BY avg_revenue DESC
    LIMIT 1
  `,
};
