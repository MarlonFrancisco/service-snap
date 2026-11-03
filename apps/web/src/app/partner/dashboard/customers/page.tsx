import {
  CustomerMetricsModule,
  PlanFeatureGate,
} from '@/components/features/partner';

export default function PartnerDashboardCustomersPage() {
  return (
    <PlanFeatureGate module="customers">
      <CustomerMetricsModule />
    </PlanFeatureGate>
  );
}
