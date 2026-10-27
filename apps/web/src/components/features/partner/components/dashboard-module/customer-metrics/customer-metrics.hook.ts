import type { PeriodFilterValue } from '@/components/features/partner/components/dashboard-module/components/period-filter-with-refresh';
import { useMetricsQuery } from '@/hooks/use-query/use-metrics-query/use-metrics-query.hook';
import { usePartnerStore } from '@/store/partner/partner.store';
import { downloadCsv, rowsToCsv } from '@/utils/helpers/csv.helper';
import { useCallback, useState } from 'react';

export function useCustomerMetrics() {
  const [period, setPeriod] = useState<PeriodFilterValue>('month');
  const [isRefreshing, setIsRefreshing] = useState(false);

  const activeStore = usePartnerStore((state) => state.activeStore);

  const periodLabels = {
    week: 'Semanal',
    month: 'Mensal',
    quarter: 'Trimestral',
  };

  const { customers, isPendingCustomers, isEnabledCustomers, customersRefetch } =
    useMetricsQuery({
      storeId: activeStore?.id,
      period,
      includeCustomers: true,
    });

  const stats = customers
    ? [
        {
          label: 'Base de Clientes',
          value: customers.customerBase?.value.toLocaleString() || '0',
          icon: 'Users',
          trend: `${customers.customerBase.comparison.percentageChange > 0 ? '+' : ''}${customers.customerBase.comparison.percentageChange}%`,
          trendUp: customers.customerBase.comparison.percentageChange > 0,
          trendNeutral:
            customers.customerBase.comparison.percentageChange === 0,
          comparison: 'vs mês anterior',
          detail: `+${customers.customerBase.comparison.newCustomers} novos`,
        },
        {
          label: 'Taxa de Retenção',
          value: `${customers.retentionRate.value}%`,
          icon: 'Heart',
          trend: `${customers.retentionRate.comparison.percentageChange > 0 ? '+' : ''}${customers.retentionRate.comparison.percentageChange}%`,
          trendUp: customers.retentionRate.comparison.percentageChange > 0,
          trendNeutral:
            customers.retentionRate.comparison.percentageChange === 0,
          comparison: 'vs mês anterior',
          detail: customers.retentionRate.context || '',
        },
        {
          label: 'LTV Médio',
          value: new Intl.NumberFormat('pt-BR', {
            style: 'currency',
            currency: 'BRL',
          }).format(customers.averageLTV.value),
          icon: 'DollarSign',
          trend: `${customers.averageLTV.comparison.percentageChange > 0 ? '+' : ''}${customers.averageLTV.comparison.percentageChange}%`,
          trendUp: customers.averageLTV.comparison.percentageChange > 0,
          trendNeutral: customers.averageLTV.comparison.percentageChange === 0,
          comparison: 'vs mês anterior',
          detail:
            customers.averageLTV.cac != null
              ? `CAC: ${new Intl.NumberFormat('pt-BR', {
                  style: 'currency',
                  currency: 'BRL',
                }).format(customers.averageLTV.cac)}`
              : 'CAC indisponível',
        },
        {
          label: 'NPS Score',
          value: `${customers.npsScore.value}`,
          icon: 'Star',
          trend: `${customers.npsScore.comparison.absoluteChange > 0 ? '+' : ''}${customers.npsScore.comparison.absoluteChange}`,
          trendUp: (customers.npsScore.comparison.absoluteChange || 0) > 0,
          trendNeutral:
            (customers.npsScore.comparison.absoluteChange || 0) === 0,
          comparison: 'vs mês anterior',
          detail: `${customers.npsScore.reviewCount} avaliações`,
        },
      ]
    : [];

  const retentionData =
    customers?.customerEvolution?.map((item) => ({
      month: item.month,
      new: item.newCustomers,
      returning: item.recurringCustomers,
      churn: item.churn,
      total: item.totalCustomers,
    })) || [];

  const lifetimeValueData =
    customers?.ltvBySegment?.map((item) => ({
      segment: item.segment,
      ltv: item.averageLTV,
      customers: item.customerCount,
      avgVisits: item.averageMonthlyVisits,
      retention: item.retentionRate,
    })) || [];

  const topCustomers =
    customers?.topVIPCustomers?.map((item) => {
      const lastVisitDate = new Date(item.lastVisit);
      const daysAgo = Math.floor(
        (Date.now() - lastVisitDate.getTime()) / (1000 * 60 * 60 * 24),
      );
      const lastVisitText =
        daysAgo === 0
          ? 'Hoje'
          : daysAgo === 1
            ? 'Há 1 dia'
            : daysAgo < 7
              ? `Há ${daysAgo} dias`
              : daysAgo < 30
                ? `Há ${Math.floor(daysAgo / 7)} ${Math.floor(daysAgo / 7) === 1 ? 'semana' : 'semanas'}`
                : `Há ${Math.floor(daysAgo / 30)} ${Math.floor(daysAgo / 30) === 1 ? 'mês' : 'meses'}`;

      return {
        name: item.customerName,
        visits: item.visits,
        spent: item.totalSpent,
        lastVisit: lastVisitText,
        status: 'active',
        riskLevel: 'low',
      };
    }) || [];

  const handleRefresh = () => {
    customersRefetch();
    setIsRefreshing(true);
    setTimeout(() => setIsRefreshing(false), 2000);
  };

  const handleExportCsv = useCallback(() => {
    if (!customers) return;

    const money = (value: number) =>
      value.toLocaleString('pt-BR', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      });

    const date = (value: Date | string) =>
      new Date(value).toLocaleDateString('pt-BR');

    const summaryRows = [
      ['Base de clientes', customers.customerBase.value, '', ''],
      ['Taxa de retenção (%)', customers.retentionRate.value, '', ''],
      ['LTV médio (R$)', money(customers.averageLTV.value), '', ''],
      ['NPS', customers.npsScore.value, '', ''],
    ];

    const vipRows = (customers.topVIPCustomers || []).map((item) => [
      item.customerName,
      item.visits,
      money(item.totalSpent),
      date(item.lastVisit),
    ]);

    const segmentRows = (customers.ltvBySegment || []).map((item) => [
      item.segment,
      item.customerCount,
      money(item.averageLTV),
      `${item.retentionRate}%`,
    ]);

    const csv = [
      rowsToCsv(['Métrica', 'Valor', '', ''], summaryRows),
      '',
      rowsToCsv(
        ['Cliente', 'Visitas', 'Total gasto (R$)', 'Última visita'],
        vipRows,
      ),
      '',
      rowsToCsv(
        ['Segmento', 'Clientes', 'LTV médio (R$)', 'Retenção'],
        segmentRows,
      ),
    ].join('\n');

    const stamp = new Date().toISOString().slice(0, 10);
    const storeSlug = (activeStore?.name || 'loja')
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');

    downloadCsv(`clientes-${storeSlug || 'loja'}-${stamp}.csv`, csv);
  }, [customers, activeStore?.name]);

  return {
    period,
    periodLabels,
    stats,
    retentionData,
    lifetimeValueData,
    topCustomers,
    isLoading: isPendingCustomers,
    customers,
    isEnabledCustomers,
    setPeriod,
    handleRefresh,
    handleExportCsv,
    isRefreshing,
    canExport:
      !!customers &&
      ((customers.topVIPCustomers?.length || 0) > 0 ||
        (customers.ltvBySegment?.length || 0) > 0 ||
        (customers.customerBase?.value || 0) > 0),
  };
}
