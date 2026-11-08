/**
 * SQL Queries para Dashboard Operational
 * Queries otimizadas para performance
 * Todas as queries são parametrizadas para prevenir SQL injection
 */

export const DashboardOperationalQueries = {
  /**
   * Calcula taxa de ocupação (agendamentos / capacidade máxima)
   * $1: store_id, $2: current_start, $3: current_end, $4: prev_start, $5: prev_end
   */
  calculateOccupancyRate: `
    WITH business_hours AS (
      SELECT
        CAST(SUBSTRING("closeTime", 1, 2) AS INT) -
        CAST(SUBSTRING("openTime", 1, 2) AS INT) as hours_per_day
      FROM stores
      WHERE id = $1::uuid
    ),
    current_capacity AS (
      SELECT
        COUNT(*) as total_appointments,
        (SELECT hours_per_day FROM business_hours) * (($3::date - $2::date) + 1) as max_capacity
      FROM schedules
      WHERE "storeId" = $1::uuid
        AND date >= $2::date
        AND date <= $3::date
    ),
    prev_capacity AS (
      SELECT
        COUNT(*) as total_appointments,
        (SELECT hours_per_day FROM business_hours) * (($5::date - $4::date) + 1) as max_capacity
      FROM schedules
      WHERE "storeId" = $1::uuid
        AND date >= $4::date
        AND date <= $5::date
    )
    SELECT
      LEAST(100, ROUND(((SELECT total_appointments FROM current_capacity)::NUMERIC /
            GREATEST((SELECT max_capacity FROM current_capacity), 1)::NUMERIC * 100))) as current_occupancy,
      LEAST(100, ROUND(((SELECT total_appointments FROM prev_capacity)::NUMERIC /
            GREATEST((SELECT max_capacity FROM prev_capacity), 1)::NUMERIC * 100))) as prev_occupancy
  `,

  /**
   * Calcula tempo médio de duração dos serviços
   * $1: store_id, $2: current_start, $3: current_end, $4: prev_start, $5: prev_end
   */
  calculateAverageTime: `
    WITH current_period AS (
      SELECT
        COALESCE(AVG(s.duration), 30) as avg_duration
      FROM schedules sch
      LEFT JOIN services s ON sch."serviceId" = s.id
      WHERE sch."storeId" = $1::uuid
        AND sch.date >= $2::date
        AND sch.date <= $3::date
        AND s.duration IS NOT NULL
    ),
    prev_period AS (
      SELECT
        COALESCE(AVG(s.duration), 30) as avg_duration
      FROM schedules sch
      LEFT JOIN services s ON sch."serviceId" = s.id
      WHERE sch."storeId" = $1::uuid
        AND sch.date >= $4::date
        AND sch.date <= $5::date
        AND s.duration IS NOT NULL
    )
    SELECT
      ROUND((SELECT avg_duration FROM current_period))::INT as current_avg_duration,
      ROUND((SELECT avg_duration FROM prev_period))::INT as prev_avg_duration
  `,

  /**
   * Calcula eficiência do time (profissionais com agendamentos / total)
   * $1: store_id, $2: current_start, $3: current_end, $4: prev_start, $5: prev_end
   */
  calculateTeamEfficiency: `
    WITH total_members AS (
      SELECT COUNT(*) as total_professionals
      FROM store_members
      WHERE "storeId" = $1::uuid
    ),
    current_active AS (
      SELECT COUNT(DISTINCT "storeMemberId") as active_professionals
      FROM schedules
      WHERE "storeId" = $1::uuid
        AND date >= $2::date
        AND date <= $3::date
    ),
    prev_active AS (
      SELECT COUNT(DISTINCT "storeMemberId") as active_professionals
      FROM schedules
      WHERE "storeId" = $1::uuid
        AND date >= $4::date
        AND date <= $5::date
    )
    SELECT
      ROUND(((SELECT active_professionals FROM current_active)::NUMERIC /
             GREATEST((SELECT total_professionals FROM total_members), 1)::NUMERIC * 100))::INT as current_efficiency,
      ROUND(((SELECT active_professionals FROM prev_active)::NUMERIC /
             GREATEST((SELECT total_professionals FROM total_members), 1)::NUMERIC * 100))::INT as prev_efficiency
  `,

  /**
   * Calcula taxa de pontualidade (completados / total) e no-show rate
   * $1: store_id, $2: current_start, $3: current_end, $4: prev_start, $5: prev_end
   */
  calculatePunctualityRate: `
    WITH current_period AS (
      SELECT
        COUNT(*) as total_appointments,
        SUM(CASE WHEN status = 'completed' THEN 1 ELSE 0 END) as completed_count,
        SUM(CASE WHEN status = 'no-show' THEN 1 ELSE 0 END) as no_show_count
      FROM schedules
      WHERE "storeId" = $1::uuid
        AND date >= $2::date
        AND date <= $3::date
    ),
    prev_period AS (
      SELECT
        COUNT(*) as total_appointments,
        SUM(CASE WHEN status = 'completed' THEN 1 ELSE 0 END) as completed_count,
        SUM(CASE WHEN status = 'no-show' THEN 1 ELSE 0 END) as no_show_count
      FROM schedules
      WHERE "storeId" = $1::uuid
        AND date >= $4::date
        AND date <= $5::date
    )
    SELECT
      ROUND((SELECT completed_count FROM current_period)::NUMERIC /
            GREATEST((SELECT total_appointments FROM current_period), 1)::NUMERIC * 100)::INT as current_punctuality,
      ROUND((SELECT completed_count FROM prev_period)::NUMERIC /
            GREATEST((SELECT total_appointments FROM prev_period), 1)::NUMERIC * 100)::INT as prev_punctuality,
      ROUND((SELECT no_show_count FROM current_period)::NUMERIC /
            GREATEST((SELECT total_appointments FROM current_period), 1)::NUMERIC * 100)::INT as current_no_show_rate,
      ROUND((SELECT no_show_count FROM prev_period)::NUMERIC /
            GREATEST((SELECT total_appointments FROM prev_period), 1)::NUMERIC * 100)::INT as prev_no_show_rate
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
    )
    SELECT
      ad.day_of_week,
      COALESCE(dc.total_appointments, 0) as appointments,
      ROUND(GREATEST(0, LEAST(100,
        COALESCE(dc.total_appointments, 0)::NUMERIC /
        GREATEST((SELECT hours_per_day FROM business_hours), 1)::NUMERIC * 100
      )))::INT as utilization_percentage,
      ROUND(COALESCE(dc.avg_duration, 30))::INT as avg_duration
    FROM all_days ad
    LEFT JOIN daily_counts dc ON ad.day_of_week = dc.day_of_week
    ORDER BY ad.day_of_week
  `,

  /**
   * Conta agendamentos por status
   * $1: store_id, $2: period_start, $3: period_end
   */
  calculateAppointmentStatus: `
    SELECT
      SUM(CASE WHEN status = 'completed' THEN 1 ELSE 0 END) as completed,
      SUM(CASE WHEN status = 'scheduled' THEN 1 ELSE 0 END) as scheduled,
      SUM(CASE WHEN status = 'no-show' THEN 1 ELSE 0 END) as no_show,
      SUM(CASE WHEN status = 'cancelled' THEN 1 ELSE 0 END) as cancelled,
      COUNT(*) as total
    FROM schedules
    WHERE "storeId" = $1::uuid
      AND date >= $2::date
      AND date <= $3::date
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
      cp.period_part,
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
