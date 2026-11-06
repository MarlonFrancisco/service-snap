import {
  CustomerMetricsModule,
  DashboardViewTracker,
  PlanFeatureGate,
} from '@/components/features/partner';

export default function PartnerDashboardCustomersPage() {
  return (
    <>
      <DashboardViewTracker section="customers" />
      <PlanFeatureGate module="customers">
        <CustomerMetricsModule />
      </PlanFeatureGate>
    </>
  );
}
