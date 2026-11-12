/**
 * SQL Queries para Dashboard Sales
 * Queries otimizadas para performance
 * Todas as queries são parametrizadas para prevenir SQL injection
 */

export const DashboardSalesQueries = {
  /**
   * Resumo do período atual vs anterior em uma única leitura de `schedules`:
   * receita, ticket médio, conversão, receita por hora e progresso da meta.
   * $1: store_id, $2: current_start, $3: current_end, $4: prev_start, $5: prev_end
   * $6: period_type (week/month/quarter), $7: hoje no fuso da loja
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
    ),
    totals AS (
      SELECT
        COALESCE(SUM(paid_amount) FILTER (WHERE is_current), 0) AS current_revenue,
        COALESCE(SUM(paid_amount) FILTER (WHERE NOT is_current), 0) AS prev_revenue,
        COALESCE(AVG(paid_amount) FILTER (WHERE is_current), 0) AS current_avg,
        COALESCE(AVG(paid_amount) FILTER (WHERE NOT is_current), 0) AS prev_avg,
        COUNT(*) FILTER (WHERE is_current) AS current_total,
        COUNT(*) FILTER (WHERE is_current AND status = 'completed') AS current_completed,
        COUNT(*) FILTER (WHERE NOT is_current) AS prev_total,
        COUNT(*) FILTER (WHERE NOT is_current AND status = 'completed') AS prev_completed
      FROM base
    ),
    store AS (
      SELECT
        CAST(SUBSTRING("closeTime", 1, 2) AS INT) -
        CAST(SUBSTRING("openTime", 1, 2) AS INT) AS hours_per_day,
        CASE
          WHEN $6::text = 'week' THEN COALESCE("weeklyGoal", 0)
          WHEN $6::text = 'month' THEN COALESCE("monthlyGoal", 0)
          WHEN $6::text = 'quarter' THEN COALESCE("quarterlyGoal", 0)
          ELSE 0
        END AS target_goal,
        "businessDays" AS business_days
      FROM stores
      WHERE id = $1::uuid
    )
    SELECT
      t.current_revenue,
      t.prev_revenue,
      ROUND(t.current_avg) AS current_avg_ticket,
      ROUND(t.prev_avg) AS prev_avg_ticket,
      ROUND(CASE WHEN t.current_total > 0
        THEN t.current_completed::NUMERIC / t.current_total::NUMERIC * 100
        ELSE 0 END) AS current_rate,
      ROUND(CASE WHEN t.prev_total > 0
        THEN t.prev_completed::NUMERIC / t.prev_total::NUMERIC * 100
        ELSE 0 END) AS prev_rate,
      ROUND(t.current_revenue::NUMERIC /
            GREATEST((SELECT hours_per_day FROM store) *
                     (($3::date - $2::date) + 1), 1)::NUMERIC) AS current_revenue_per_hour,
      ROUND(t.prev_revenue::NUMERIC /
            GREATEST((SELECT hours_per_day FROM store) *
                     (($5::date - $4::date) + 1), 1)::NUMERIC) AS prev_revenue_per_hour,
      (SELECT target_goal FROM store) AS target_goal,
      (SELECT business_days FROM store) AS business_days,
      -- A semana vai de segunda a domingo: ISODOW dá 7 no domingo (0 dias restantes)
      GREATEST(0, CASE
        WHEN $6::text = 'week' THEN (7 - EXTRACT(ISODOW FROM $7::date)::INT)
        WHEN $6::text = 'month' THEN ((DATE_TRUNC('month', $7::date + '1 month'::interval)::date - $7::date)::INT)
        WHEN $6::text = 'quarter' THEN ((DATE_TRUNC('quarter', $7::date + '3 months'::interval)::date - $7::date)::INT)
        ELSE 0
      END)::INT AS days_remaining
    FROM totals t
  `,

  /**
   * Calcula evolução de receita para últimos 6 meses
   * $1: store_id, $2: hoje no fuso da loja
   */
  calculateRevenueEvolution: `
    WITH months AS (
      SELECT
        DATE_TRUNC('month', $2::date - (interval '1 month' * (row_number() OVER () - 1)))::date as month_date,
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
        AND sch.date >= DATE_TRUNC('month', $2::date - interval '6 months')
      GROUP BY DATE_TRUNC('month', sch.date)
    ),
    goals_per_month AS (
      SELECT
        DATE_TRUNC('month', $2::date - (interval '1 month' * (row_number() OVER () - 1)))::date as month_date,
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
};
