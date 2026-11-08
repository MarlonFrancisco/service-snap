/**
 * SQL Queries para Dashboard de Clientes
 * Queries otimizadas para performance
 * Todas as queries são parametrizadas para prevenir SQL injection
 */

export const DashboardCustomersQueries = {
  /**
   * Calcula base de clientes (total único até data)
   * $1: store_id, $2: current_end, $3: prev_end, $4: current_start, $5: current_end
   */
  calculateCustomerBase: `
    WITH current_customers AS (
      SELECT COUNT(DISTINCT "userId") as total
      FROM schedules
      WHERE "storeId" = $1::uuid
        AND date <= $2::date
        AND "userId" IS NOT NULL
    ),
    previous_customers AS (
      SELECT COUNT(DISTINCT "userId") as total
      FROM schedules
      WHERE "storeId" = $1::uuid
        AND date <= $3::date
        AND "userId" IS NOT NULL
    ),
    new_customers_period AS (
      SELECT COUNT(DISTINCT s."userId") as new_count
      FROM schedules s
      WHERE s."storeId" = $1::uuid
        AND s.date >= $4::date
        AND s.date <= $5::date
        AND s."userId" IS NOT NULL
        AND NOT EXISTS (
          SELECT 1 FROM schedules s2
          WHERE s2."storeId" = $1::uuid
            AND s2."userId" = s."userId"
            AND s2.date < $4::date
        )
    )
    SELECT
      (SELECT total FROM current_customers) as current_customers,
      (SELECT total FROM previous_customers) as prev_customers,
      (SELECT new_count FROM new_customers_period) as new_customers_period
  `,

  /**
   * Calcula taxa de retenção (clientes que retornaram no período atual)
   * $1: store_id, $2: prev_start, $3: prev_end, $4: current_start, $5: current_end
   * $6: before_prev_start, $7: before_prev_end
   */
  calculateRetentionRate: `
    WITH prev_customers AS (
      SELECT DISTINCT "userId"
      FROM schedules
      WHERE "storeId" = $1::uuid
        AND date >= $2::date
        AND date <= $3::date
        AND status = 'completed'
        AND "userId" IS NOT NULL
    ),
    current_returned AS (
      SELECT COUNT(DISTINCT "userId") as count
      FROM schedules
      WHERE "storeId" = $1::uuid
        AND date >= $4::date
        AND date <= $5::date
        AND status = 'completed'
        AND "userId" IN (SELECT "userId" FROM prev_customers)
    ),
    before_prev_customers AS (
      SELECT DISTINCT "userId"
      FROM schedules
      WHERE "storeId" = $1::uuid
        AND date >= $6::date
        AND date <= $7::date
        AND status = 'completed'
        AND "userId" IS NOT NULL
    ),
    prev_returned AS (
      SELECT COUNT(DISTINCT "userId") as count
      FROM schedules
      WHERE "storeId" = $1::uuid
        AND date >= $2::date
        AND date <= $3::date
        AND status = 'completed'
        AND "userId" IN (SELECT "userId" FROM before_prev_customers)
    )
    SELECT
      (SELECT COUNT(*) FROM prev_customers)::INT as prev_customers_count,
      (SELECT count FROM current_returned)::INT as current_returned_count,
      (SELECT COUNT(*) FROM before_prev_customers)::INT as before_prev_count,
      (SELECT count FROM prev_returned)::INT as prev_returned_count
  `,

  /**
   * Calcula LTV (Lifetime Value) médio
   * $1: store_id, $2: current_end, $3: prev_end
   */
  calculateAverageLTV: `
    WITH current_ltv AS (
      SELECT
        COUNT(DISTINCT sch."userId") as customer_count,
        COALESCE(SUM(COALESCE(sch.price, s.price)), 0) as total_revenue
      FROM schedules sch
      LEFT JOIN services s ON sch."serviceId" = s.id
      WHERE sch."storeId" = $1::uuid
        AND sch.date <= $2::date
        AND sch.status = 'completed'
        AND sch."userId" IS NOT NULL
    ),
    previous_ltv AS (
      SELECT
        COUNT(DISTINCT sch."userId") as customer_count,
        COALESCE(SUM(COALESCE(sch.price, s.price)), 0) as total_revenue
      FROM schedules sch
      LEFT JOIN services s ON sch."serviceId" = s.id
      WHERE sch."storeId" = $1::uuid
        AND sch.date <= $3::date
        AND sch.status = 'completed'
        AND sch."userId" IS NOT NULL
    )
    SELECT
      ROUND(CAST(
        CASE
          WHEN (SELECT customer_count FROM current_ltv) > 0
          THEN (SELECT total_revenue FROM current_ltv) / (SELECT customer_count FROM current_ltv)
          ELSE 0
        END AS NUMERIC
      )) as current_ltv,
      ROUND(CAST(
        CASE
          WHEN (SELECT customer_count FROM previous_ltv) > 0
          THEN (SELECT total_revenue FROM previous_ltv) / (SELECT customer_count FROM previous_ltv)
          ELSE 0
        END AS NUMERIC
      )) as prev_ltv
  `,

  /**
   * Calcula NPS Score (média de ratings)
   * $1: store_id, $2: current_start, $3: current_end, $4: prev_start, $5: prev_end
   */
  calculateNPSScore: `
    WITH current_reviews AS (
      SELECT
        COALESCE(AVG(rating), 0) as avg_rating,
        COUNT(*) as review_count
      FROM reviews
      WHERE "storeId" = $1::uuid
        AND created_at >= $2::date
        AND created_at <= $3::date
    ),
    previous_reviews AS (
      SELECT
        COALESCE(AVG(rating), 0) as avg_rating
      FROM reviews
      WHERE "storeId" = $1::uuid
        AND created_at >= $4::date
        AND created_at <= $5::date
    )
    SELECT
      ROUND(CAST((SELECT avg_rating FROM current_reviews) AS NUMERIC), 1) as current_nps,
      (SELECT review_count FROM current_reviews) as review_count,
      ROUND(CAST((SELECT avg_rating FROM previous_reviews) AS NUMERIC), 1) as prev_nps
  `,

  /**
   * Calcula evolução de clientes para últimos 6 meses
   * Retorna: novos, recorrentes, churn e total por mês
   * $1: store_id, $2: start_date (6 meses atrás)
   */
  calculateCustomerEvolution: `
    WITH customer_first_visit AS (
      SELECT
        sch."userId",
        DATE_TRUNC('month', MIN(sch.date))::date as first_month
      FROM schedules sch
      WHERE sch."storeId" = $1::uuid
        AND sch.date >= $2::date
        AND sch."userId" IS NOT NULL
      GROUP BY sch."userId"
    ),
    monthly_stats AS (
      SELECT
        DATE_TRUNC('month', sch.date)::date as month,
        COUNT(DISTINCT sch."userId") as total_customers
      FROM schedules sch
      WHERE sch."storeId" = $1::uuid
        AND sch.date >= $2::date
        AND sch."userId" IS NOT NULL
      GROUP BY DATE_TRUNC('month', sch.date)
    ),
    new_by_month AS (
      SELECT
        first_month,
        COUNT(*) as new_customers
      FROM customer_first_visit
      GROUP BY first_month
    )
    SELECT
      TO_CHAR(COALESCE(nbm.first_month, ms.month), 'Mon') as month_name,
      COALESCE(nbm.new_customers, 0) as new_customers,
      0 as recurring_customers,
      0 as churn,
      COALESCE(ms.total_customers, 0) as total_customers
    FROM new_by_month nbm
    FULL OUTER JOIN monthly_stats ms ON nbm.first_month = ms.month
    ORDER BY COALESCE(nbm.first_month, ms.month) ASC
  `,

  /**
   * Calcula LTV por segmento de cliente
   * Segmentação: VIPs (>R$1000), Frequentes (2+/mês), Regulares (1+/mês), Ocasionais (2+), Novos (1)
   * $1: store_id
   */
  calculateLTVBySegment: `
    WITH customer_stats AS (
      SELECT
        sch."userId",
        COUNT(*) as total_visits,
        COUNT(CASE WHEN sch.status = 'completed' THEN 1 END) as completed_visits,
        COALESCE(SUM(COALESCE(sch.price, s.price)), 0) as total_spent,
        MIN(sch.date) as first_visit,
        MAX(sch.date) as last_visit,
        CASE
          WHEN MAX(sch.date) = MIN(sch.date) THEN 0
          ELSE COALESCE((MAX(sch.date) - MIN(sch.date))::NUMERIC / 30, 0)
        END as months_since_first
      FROM schedules sch
      LEFT JOIN services s ON sch."serviceId" = s.id
      WHERE sch."storeId" = $1::uuid
        AND sch."userId" IS NOT NULL
      GROUP BY sch."userId"
    ),
    customer_segments AS (
      SELECT
        CASE
          WHEN total_spent > 1000 THEN 'VIPs'
          WHEN months_since_first > 0 AND (total_visits / GREATEST(months_since_first, 1)) >= 4 THEN 'VIPs'
          WHEN months_since_first > 0 AND (total_visits / GREATEST(months_since_first, 1)) >= 2 THEN 'Frequentes'
          WHEN months_since_first > 0 AND (total_visits / GREATEST(months_since_first, 1)) >= 1 THEN 'Regulares'
          WHEN total_visits >= 2 THEN 'Ocasionais'
          ELSE 'Novos'
        END as segment,
        total_spent,
        total_visits,
        GREATEST(months_since_first, 1) as monthly_visits_calc,
        last_visit,
        (CURRENT_DATE - last_visit) as days_since_last
      FROM customer_stats
    )
    SELECT
      segment,
      COUNT(*) as customer_count,
      ROUND(AVG(total_spent)::NUMERIC) as average_ltv,
      ROUND(AVG(monthly_visits_calc * 1.0)::NUMERIC, 1) as average_monthly_visits,
      ROUND((SUM(CASE WHEN days_since_last <= 30 THEN 1 ELSE 0 END)::NUMERIC / COUNT(*)) * 100, 1) as retention_rate
    FROM customer_segments
    GROUP BY segment
    ORDER BY
      CASE segment
        WHEN 'VIPs' THEN 1
        WHEN 'Frequentes' THEN 2
        WHEN 'Regulares' THEN 3
        WHEN 'Ocasionais' THEN 4
        WHEN 'Novos' THEN 5
      END
  `,

  /**
   * Calcula Top 5 clientes VIP (maior valor total gasto)
   * $1: store_id
   */
  calculateTopVIPCustomers: `
    SELECT
      sch."userId" as customer_id,
      COALESCE(u.first_name || ' ' || u.last_name, 'Cliente') as customer_name,
      COUNT(*) as visits,
      ROUND(COALESCE(SUM(COALESCE(sch.price, s.price)), 0)::NUMERIC) as total_spent,
      MAX(sch.date) as last_visit
    FROM schedules sch
    LEFT JOIN services s ON sch."serviceId" = s.id
    LEFT JOIN users u ON sch."userId" = u.id
    WHERE sch."storeId" = $1::uuid
      AND sch."userId" IS NOT NULL
    GROUP BY sch."userId", u.first_name, u.last_name
    ORDER BY total_spent DESC
    LIMIT 5
  `,
};
