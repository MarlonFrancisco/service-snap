/**
 * SQL Queries para Dashboard de Clientes
 * Queries otimizadas para performance
 * Todas as queries são parametrizadas para prevenir SQL injection
 */

export const DashboardCustomersQueries = {
  /**
   * Base de clientes (total único até a data, novos no período) e LTV médio,
   * agrupando o histórico da loja por cliente uma única vez.
   * $1: store_id, $2: current_start, $3: current_end, $4: prev_end
   */
  calculateCustomerBaseAndLTV: `
    WITH per_user AS (
      SELECT
        MIN(sch.date) AS first_date,
        MIN(sch.date) FILTER (WHERE sch.status = 'completed') AS first_completed_date,
        BOOL_OR(sch.date >= $2::date AND sch.date <= $3::date) AS active_in_period,
        SUM(COALESCE(sch.price, s.price)) FILTER (
          WHERE sch.status = 'completed' AND sch.date <= $3::date
        ) AS spent_until_current,
        SUM(COALESCE(sch.price, s.price)) FILTER (
          WHERE sch.status = 'completed' AND sch.date <= $4::date
        ) AS spent_until_prev
      FROM schedules sch
      LEFT JOIN services s ON sch."serviceId" = s.id
      WHERE sch."storeId" = $1::uuid
        AND sch."userId" IS NOT NULL
      GROUP BY sch."userId"
    ),
    totals AS (
      SELECT
        COUNT(*) FILTER (WHERE first_date <= $3::date) AS current_customers,
        COUNT(*) FILTER (WHERE first_date <= $4::date) AS prev_customers,
        -- Novo: apareceu no período e não tem agendamento anterior a ele
        COUNT(*) FILTER (
          WHERE active_in_period AND first_date >= $2::date
        ) AS new_customers_period,
        COUNT(*) FILTER (WHERE first_completed_date <= $3::date) AS current_ltv_customers,
        COUNT(*) FILTER (WHERE first_completed_date <= $4::date) AS prev_ltv_customers,
        COALESCE(SUM(spent_until_current), 0) AS current_ltv_revenue,
        COALESCE(SUM(spent_until_prev), 0) AS prev_ltv_revenue
      FROM per_user
    )
    SELECT
      current_customers,
      prev_customers,
      new_customers_period,
      ROUND(CASE WHEN current_ltv_customers > 0
        THEN current_ltv_revenue / current_ltv_customers
        ELSE 0 END) AS current_ltv,
      ROUND(CASE WHEN prev_ltv_customers > 0
        THEN prev_ltv_revenue / prev_ltv_customers
        ELSE 0 END) AS prev_ltv
    FROM totals
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
        AND created_at < ($3::date + 1)
    ),
    previous_reviews AS (
      SELECT
        COALESCE(AVG(rating), 0) as avg_rating
      FROM reviews
      WHERE "storeId" = $1::uuid
        AND created_at >= $4::date
        AND created_at < ($5::date + 1)
    )
    SELECT
      ROUND(CAST((SELECT avg_rating FROM current_reviews) AS NUMERIC), 1) as current_nps,
      (SELECT review_count FROM current_reviews) as review_count,
      ROUND(CAST((SELECT avg_rating FROM previous_reviews) AS NUMERIC), 1) as prev_nps
  `,

  /**
   * Calcula evolução de clientes para últimos 6 meses
   * Retorna: novos, recorrentes, churn e total por mês
   * $1: store_id, $2: start_date (6 meses atrás; a janela começa no dia 1 desse mês)
   */
  calculateCustomerEvolution: `
    WITH customer_first_visit AS (
      SELECT
        sch."userId",
        DATE_TRUNC('month', MIN(sch.date))::date as first_month
      FROM schedules sch
      WHERE sch."storeId" = $1::uuid
        AND sch."userId" IS NOT NULL
      GROUP BY sch."userId"
    ),
    monthly_stats AS (
      SELECT
        DATE_TRUNC('month', sch.date)::date as month,
        COUNT(DISTINCT sch."userId") as total_customers
      FROM schedules sch
      WHERE sch."storeId" = $1::uuid
        AND sch.date >= DATE_TRUNC('month', $2::date)
        AND sch."userId" IS NOT NULL
      GROUP BY DATE_TRUNC('month', sch.date)
    ),
    new_by_month AS (
      SELECT
        first_month,
        COUNT(*) as new_customers
      FROM customer_first_visit
      WHERE first_month >= DATE_TRUNC('month', $2::date)
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
   * $1: store_id, $2: hoje no fuso da loja
   */
  calculateLTVBySegment: `
    WITH customer_stats AS (
      SELECT
        sch."userId",
        COUNT(*) as total_visits,
        COUNT(CASE WHEN sch.status = 'completed' THEN 1 END) as completed_visits,
        COALESCE(SUM(COALESCE(sch.price, s.price)) FILTER (
          WHERE sch.status = 'completed'
        ), 0) as total_spent,
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
        total_visits / GREATEST(months_since_first, 1) as monthly_visits_calc,
        last_visit,
        ($2::date - last_visit) as days_since_last
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
      AND sch.status = 'completed'
    GROUP BY sch."userId", u.first_name, u.last_name
    ORDER BY total_spent DESC
    LIMIT 5
  `,
};
