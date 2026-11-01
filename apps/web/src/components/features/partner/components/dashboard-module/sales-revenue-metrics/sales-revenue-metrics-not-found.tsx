import { DollarSign } from 'lucide-react';
import { MetricsNotFound } from '../components/metrics-not-found';

export const SalesRevenueMetricsNotFound = () => (
  <MetricsNotFound
    title="Nenhuma métrica de vendas"
    description="Ainda não há dados de receita para exibir. Registre agendamentos para acompanhar receita, ticket médio e metas."
    icon={DollarSign}
  />
);
