import { BarChart3 } from 'lucide-react';
import { MetricsNotFound } from '../components/metrics-not-found';

export const GeneralMetricsNotFound = () => (
  <MetricsNotFound
    title="Nenhuma métrica disponível"
    description="Os dados aparecem quando houver agendamentos na loja."
    icon={BarChart3}
    titleAs="h2"
  />
);
