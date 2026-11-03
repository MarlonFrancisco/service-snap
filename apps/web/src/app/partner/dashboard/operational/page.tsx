import {
  OperationalMetricsModule,
  PlanFeatureGate,
} from '@/components/features/partner';

export default function PartnerDashboardOperationalPage() {
  return (
    <PlanFeatureGate module="operational">
      <OperationalMetricsModule />
    </PlanFeatureGate>
  );
}
