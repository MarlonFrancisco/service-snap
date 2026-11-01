import { Activity } from 'lucide-react';
import { MetricsNotFound } from '../components/metrics-not-found';

export const OperationalMetricsNotFound = () => (
  <MetricsNotFound
    title="Nenhuma métrica operacional"
    description="Ainda não há dados operacionais para exibir. Registre agendamentos para acompanhar a ocupação."
    icon={Activity}
  />
);
