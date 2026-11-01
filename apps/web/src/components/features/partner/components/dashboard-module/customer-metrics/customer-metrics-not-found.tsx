import { Users } from 'lucide-react';
import { MetricsNotFound } from '../components/metrics-not-found';

export const CustomerMetricsNotFound = () => (
  <MetricsNotFound
    title="Nenhuma métrica de clientes"
    description="Ainda não há dados sobre seus clientes. Registre agendamentos para acompanhar retenção e valor por cliente."
    icon={Users}
  />
);
