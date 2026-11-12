/**
 * SQL Queries para Dashboard Operational
 * Queries otimizadas para performance
 * Todas as queries são parametrizadas para prevenir SQL injection
 */

export const DashboardOperationalQueries = {
  /**
   * Resumo do período atual vs anterior em uma única leitura de `schedules`:
   * ocupação, duração média, eficiência do time, pontualidade/no-show e
   * contagem por status.
   * $1: store_id, $2: current_start, $3: current_end, $4: prev_start, $5: prev_end
   */
  calculatePeriodSummary: `
    WITH base AS (
      SELECT
        sch.status,
        sch."storeMemberId" AS member_id,
        s.duration,
        (sch.date >= $2::date AND sch.date <= $3::date) AS is_current
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
        COUNT(*) FILTER (WHERE is_current) AS current_total,
        COUNT(*) FILTER (WHERE NOT is_current) AS prev_total,
        COUNT(*) FILTER (WHERE is_current AND status = 'completed') AS current_completed,
        COUNT(*) FILTER (WHERE NOT is_current AND status = 'completed') AS prev_completed,
        COUNT(*) FILTER (WHERE is_current AND status = 'no-show') AS current_no_show,
        COUNT(*) FILTER (WHERE is_current AND status = 'scheduled') AS current_scheduled,
        COUNT(*) FILTER (WHERE is_current AND status = 'cancelled') AS current_cancelled,
        COALESCE(AVG(duration) FILTER (WHERE is_current), 30) AS current_avg_duration,
        COALESCE(AVG(duration) FILTER (WHERE NOT is_current), 30) AS prev_avg_duration,
        COUNT(DISTINCT member_id) FILTER (WHERE is_current) AS current_active,
        COUNT(DISTINCT member_id) FILTER (WHERE NOT is_current) AS prev_active
      FROM base
    ),
    store AS (
      SELECT
        CAST(SUBSTRING("closeTime", 1, 2) AS INT) -
        CAST(SUBSTRING("openTime", 1, 2) AS INT) AS hours_per_day
      FROM stores
      WHERE id = $1::uuid
    ),
    members AS (
      SELECT COUNT(*) AS total_professionals
      FROM store_members
      WHERE "storeId" = $1::uuid
    )
    SELECT
      LEAST(100, ROUND(t.current_total::NUMERIC /
            GREATEST((SELECT hours_per_day FROM store) *
                     (($3::date - $2::date) + 1), 1)::NUMERIC * 100)) AS current_occupancy,
      LEAST(100, ROUND(t.prev_total::NUMERIC /
            GREATEST((SELECT hours_per_day FROM store) *
                     (($5::date - $4::date) + 1), 1)::NUMERIC * 100)) AS prev_occupancy,
      ROUND(t.current_avg_duration)::INT AS current_avg_duration,
      ROUND(t.prev_avg_duration)::INT AS prev_avg_duration,
      ROUND(t.current_active::NUMERIC /
            GREATEST((SELECT total_professionals FROM members), 1)::NUMERIC * 100)::INT AS current_efficiency,
      ROUND(t.prev_active::NUMERIC /
            GREATEST((SELECT total_professionals FROM members), 1)::NUMERIC * 100)::INT AS prev_efficiency,
      ROUND(t.current_completed::NUMERIC /
            GREATEST(t.current_total, 1)::NUMERIC * 100)::INT AS current_punctuality,
      ROUND(t.prev_completed::NUMERIC /
            GREATEST(t.prev_total, 1)::NUMERIC * 100)::INT AS prev_punctuality,
      ROUND(t.current_no_show::NUMERIC /
            GREATEST(t.current_total, 1)::NUMERIC * 100)::INT AS current_no_show_rate,
      t.current_completed AS completed,
      t.current_scheduled AS scheduled,
      t.current_no_show AS no_show,
      t.current_cancelled AS cancelled,
      t.current_total AS total
    FROM totals t
  `,

  /**
   * Calcula utilização de capacidade por dia da semana
   * $1: store_id, $2: current_start, $3: current_end
   */
  calculateDailyCapacityUtilization: `
    WITH all_days AS (
      SELECT 0 as day_of_week
      UNION ALL SELECT 1
      UNION ALL SELECT 2
      UNION ALL SELECT 3
      UNION ALL SELECT 4
      UNION ALL SELECT 5
      UNION ALL SELECT 6
    ),
    daily_counts AS (
      SELECT
        EXTRACT(DOW FROM date)::INT as day_of_week,
        COUNT(*) as total_appointments,
        COALESCE(AVG(s.duration), 30) as avg_duration
      FROM schedules sch
      LEFT JOIN services s ON sch."serviceId" = s.id
      WHERE sch."storeId" = $1::uuid
        AND sch.date >= $2::date
        AND sch.date <= $3::date
      GROUP BY EXTRACT(DOW FROM date)
    ),
    business_hours AS (
      SELECT
        CAST(SUBSTRING("closeTime", 1, 2) AS INT) -
        CAST(SUBSTRING("openTime", 1, 2) AS INT) as hours_per_day
      FROM stores
      WHERE id = $1::uuid
    ),
    -- Quantas segundas, terças etc. existem no período
    days_count AS (
      SELECT
        EXTRACT(DOW FROM date_val)::INT as day_of_week,
        COUNT(*) as num_days
      FROM generate_series($2::date, $3::date, '1 day'::interval) as date_val
      GROUP BY EXTRACT(DOW FROM date_val)
    )
    SELECT
      ad.day_of_week,
      COALESCE(dc.total_appointments, 0) as appointments,
      ROUND(GREATEST(0, LEAST(100,
        COALESCE(dc.total_appointments, 0)::NUMERIC /
        GREATEST((SELECT hours_per_day FROM business_hours) *
                 COALESCE(dn.num_days, 0), 1)::NUMERIC * 100
      )))::INT as utilization_percentage,
      ROUND(COALESCE(dc.avg_duration, 30))::INT as avg_duration
    FROM all_days ad
    LEFT JOIN daily_counts dc ON ad.day_of_week = dc.day_of_week
    LEFT JOIN days_count dn ON ad.day_of_week = dn.day_of_week
    ORDER BY ad.day_of_week
  `,

  /**
   * Calcula duração média por serviço
   * $1: store_id, $2: period_start, $3: period_end
   */
  calculateServiceDuration: `
    SELECT
      s.id as service_id,
      s.name as service_name,
      ROUND(AVG(s.duration))::INT as avg_duration,
      COUNT(*) as appointments
    FROM schedules sch
    INNER JOIN services s ON sch."serviceId" = s.id
    WHERE sch."storeId" = $1::uuid
      AND sch.date >= $2::date
      AND sch.date <= $3::date
      AND s.duration IS NOT NULL
    GROUP BY s.id, s.name
    ORDER BY appointments DESC
    LIMIT 10
  `,

  /**
   * Distribuição de agendamentos por período do dia (manhã/tarde/noite)
   * $1: store_id, $2: current_start, $3: current_end, $4: prev_start, $5: prev_end
   */
  calculatePeriodDistribution: `
    WITH current_period AS (
      SELECT
        CASE
          WHEN CAST(SUBSTRING("startTime", 1, 2) AS INT) < 12 THEN 'morning'
          WHEN CAST(SUBSTRING("startTime", 1, 2) AS INT) < 18 THEN 'afternoon'
          ELSE 'night'
        END as period_part,
        COUNT(*) as appointments
      FROM schedules
      WHERE "storeId" = $1::uuid
        AND date >= $2::date
        AND date <= $3::date
        AND "startTime" IS NOT NULL
      GROUP BY period_part
    ),
    prev_period AS (
      SELECT
        CASE
          WHEN CAST(SUBSTRING("startTime", 1, 2) AS INT) < 12 THEN 'morning'
          WHEN CAST(SUBSTRING("startTime", 1, 2) AS INT) < 18 THEN 'afternoon'
          ELSE 'night'
        END as period_part,
        COUNT(*) as appointments
      FROM schedules
      WHERE "storeId" = $1::uuid
        AND date >= $4::date
        AND date <= $5::date
        AND "startTime" IS NOT NULL
      GROUP BY period_part
    )
    SELECT
      COALESCE(cp.period_part, pp.period_part) as period_part,
      COALESCE(cp.appointments, 0) as current_appointments,
      COALESCE(pp.appointments, 0) as prev_appointments
    FROM current_period cp
    FULL OUTER JOIN prev_period pp ON cp.period_part = pp.period_part
  `,

  /**
   * Cria heatmap de ocupação (hora × dia da semana)
   * $1: store_id, $2: period_start, $3: period_end
   */
  calculateOccupancyHeatMap: `
    WITH hours AS (
      SELECT generate_series(6, 20) as hour
    ),
    all_days AS (
      SELECT generate_series(0, 6) as day_of_week
    ),
    total_professionals AS (
      SELECT GREATEST(COUNT(DISTINCT id), 1) as num_professionals
      FROM store_members
      WHERE "storeId" = $1::uuid
    ),
    all_dates AS (
      SELECT
        date_val,
        EXTRACT(DOW FROM date_val)::INT as day_of_week
      FROM generate_series($2::date, $3::date, '1 day'::interval) as date_val
    ),
    days_count AS (
      SELECT
        ad.day_of_week,
        COUNT(dates.date_val) as num_days
      FROM all_days ad
      LEFT JOIN all_dates dates ON ad.day_of_week = dates.day_of_week
      GROUP BY ad.day_of_week
    ),
    heatmap_data AS (
      SELECT
        CAST(SUBSTRING(sch."startTime", 1, 2) AS INT) as hour,
        EXTRACT(DOW FROM sch.date)::INT as day_of_week,
        SUM(CASE WHEN sch.status = 'completed' THEN 1 ELSE 0 END) as completed_appointments
      FROM schedules sch
      WHERE sch."storeId" = $1::uuid
        AND sch.date >= $2::date
        AND sch.date <= $3::date
        AND sch."startTime" IS NOT NULL
      GROUP BY CAST(SUBSTRING(sch."startTime", 1, 2) AS INT),
               EXTRACT(DOW FROM sch.date)
    )
    SELECT
      h.hour,
      ad.day_of_week,
      ROUND(GREATEST(0, LEAST(100,
        COALESCE(hd.completed_appointments, 0)::NUMERIC /
        GREATEST((dc.num_days * tp.num_professionals), 1)::NUMERIC * 100
      )))::INT as appointments
    FROM hours h
    CROSS JOIN all_days ad
    CROSS JOIN total_professionals tp
    INNER JOIN days_count dc ON ad.day_of_week = dc.day_of_week
    LEFT JOIN heatmap_data hd ON h.hour = hd.hour AND ad.day_of_week = hd.day_of_week
    ORDER BY h.hour, ad.day_of_week
  `,

  /**
   * Identifica períodos ociosos (low utilization periods)
   * $1: store_id, $2: period_start, $3: period_end
   */
  calculateIdleTimeOpportunities: `
    WITH hours AS (
      SELECT generate_series(6, 20) as hour
    ),
    hourly_utilization AS (
      SELECT
        CAST(SUBSTRING("startTime", 1, 2) AS INT) as hour,
        COUNT(*) as appointments,
        COUNT(*)::NUMERIC / (($3::date - $2::date) + 1)::NUMERIC as avg_per_day
      FROM schedules
      WHERE "storeId" = $1::uuid
        AND date >= $2::date
        AND date <= $3::date
        AND "startTime" IS NOT NULL
      GROUP BY CAST(SUBSTRING("startTime", 1, 2) AS INT)
    ),
    max_utilization AS (
      SELECT MAX(avg_per_day) as max_avg FROM hourly_utilization
    )
    SELECT
      h.hour,
      COALESCE(hu.appointments, 0) as total_appointments,
      COALESCE(ROUND(GREATEST(0, LEAST(100, hu.avg_per_day::NUMERIC /
               GREATEST((SELECT max_avg FROM max_utilization), 0.1)::NUMERIC * 100))), 0)::INT as utilization_percentage
    FROM hours h
    LEFT JOIN hourly_utilization hu ON h.hour = hu.hour
    WHERE COALESCE(hu.avg_per_day, 0) < (SELECT COALESCE(MAX(avg_per_day) * 0.5, 0.5) FROM hourly_utilization)
    ORDER BY h.hour
  `,

  /**
   * Calcula performance individual de profissionais
   * $1: store_id, $2: period_start, $3: period_end
   */
  calculateProfessionalPerformance: `
    SELECT
      sm.id as professional_id,
      COALESCE(u.first_name || ' ' || u.last_name, sm.id::text) as professional_name,
      COUNT(*) as total_appointments,
      SUM(CASE WHEN sch.status = 'completed' THEN 1 ELSE 0 END) as completed_appointments,
      SUM(CASE WHEN sch.status = 'no-show' THEN 1 ELSE 0 END) as no_show_count,
      ROUND(AVG(s.duration))::INT as avg_service_duration,
      ROUND(SUM(COALESCE(sch.price, s.price)))::INT as total_revenue
    FROM schedules sch
    INNER JOIN store_members sm ON sch."storeMemberId" = sm.id
    LEFT JOIN users u ON sm."userId" = u.id
    LEFT JOIN services s ON sch."serviceId" = s.id
    WHERE sch."storeId" = $1::uuid
      AND sch.date >= $2::date
      AND sch.date <= $3::date
    GROUP BY sm.id, u.first_name, u.last_name
    ORDER BY total_appointments DESC
  `,
};
